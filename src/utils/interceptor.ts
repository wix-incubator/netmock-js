import { Method } from '../types/base';
import { InterceptorsDictionary } from '../types/desk';
import { settings } from '../classes/settings';

import { extractKeyFromInput } from './extract';
import { Interceptor } from '../types/interceptor';

/**
 * Check for direct match between the endpoint and interceptors dictionary.
 * @param {InterceptorsDictionary} interceptors The interceptors dictionary.
 * @param {string} key The endpoint key.
 * @param {method} method The endpoint method
 */
function matchDirect(interceptors: InterceptorsDictionary, key: string, method: Method) {
  return interceptors[method][key];
}

/**
 * Check for regexp match between the endpoint and interceptors dictionary.
 * @param {InterceptorsDictionary} interceptors The interceptors dictionary.
 * @param {string} key The endpoint key.
 * @param {method} method The endpoint method
 */
function matchRegExp(interceptors: InterceptorsDictionary, key: string, method: Method) {
  let match: Interceptor | undefined;

  Object
    .values(interceptors[method])
    .forEach((interceptor) => {
      const SlashSandwichRegexp = /^[/](.+)[/]$/;
      const isInterceptorKeyRegexp = SlashSandwichRegexp.test(interceptor.key);
      // Skip keys if an interceptor was found
      if (!!match || !isInterceptorKeyRegexp) return;

      const re = new RegExp(interceptor.key.replace(SlashSandwichRegexp, '$1'));
      const hasRegexpMatch = re.test(key);
      if (hasRegexpMatch) {
        match = interceptor;
      }
    });

  return match;
}

/**
 * Check for dynamic url match between the endpoint and interceptors dictionary.
 * @param {InterceptorsDictionary} interceptors The interceptors dictionary.
 * @param {string} key The endpoint key.
 * @param {method} method The endpoint method
 */
function matchDynamic(interceptors: InterceptorsDictionary, key: string, method: Method) {
  let match: Interceptor | undefined;

  Object
    .entries(interceptors[method])
    .forEach(([interceptorKey, interceptor]) => {
      // Skip keys with no params or if an interceptor was found
      if (!!match || interceptor.paramsNames.length === 0) return;

      let remainingMatch = key;
      let matchFail = false;

      interceptor.paramsNames.forEach((param) => {
        if (matchFail) return;

        const indexOfColon = interceptorKey.indexOf(`:${param}`);

        // Compare strings up to the dynamic param
        if (remainingMatch.slice(0, indexOfColon) === interceptorKey.slice(0, indexOfColon)) {
          const indexOfSlashUrl = indexOfColon + remainingMatch.slice(indexOfColon).indexOf('/');
          const indexOfSlashInterceptor = indexOfColon + param.length + 1;

          // Slice already compared strings + the dynamic param
          remainingMatch = remainingMatch.slice(indexOfSlashUrl);
          interceptorKey = interceptorKey.slice(indexOfSlashInterceptor);
        } else {
          matchFail = true;
        }
      });

      // Last comparison for the rest of the strings
      if (remainingMatch === interceptorKey) {
        match = interceptor;
      }
    });

  return match;
}

/**
 * Find the best interceptor to intercept the request.
 * @param interceptors
 * @param params
 * @return {InterceptionHandler} The handler function of the best interceptor.
 * @throws {ReferenceError} Network is disabled anf no interceptor found.
 */
export function findInterceptor(
  interceptors: InterceptorsDictionary,
  params: { input: RequestInfo, method: Method },
) {
  const { input, method } = params;
  const key = extractKeyFromInput(input);

  let match;

  // Direct match
  match = matchDirect(interceptors, key, method);

  // RegExp match
  if (!match) {
    match = matchRegExp(interceptors, key, method);
  }

  // Params match
  if (!match) {
    match = matchDynamic(interceptors, key, method);
  }

  const isInterceptorInvalid = !match && settings().isNetworkDisabled;
  if (isInterceptorInvalid) {
    const message = `Endpoint not mocked ${method.toUpperCase()} ${key}`;
    throw ReferenceError(message);
  }

  return match;
}
