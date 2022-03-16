import { Method } from '../types/base';
import { InterceptorsDictionary } from '../types/desk';
import { settings } from '../classes/settings';

import { extractKeyFromInput } from './extract';

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

  let interceptor;
  let wasFound = false;

  // Direct match
  if (!wasFound) {
    interceptor = interceptors[method][key];
    if (!!interceptor) wasFound = true;
  }

  // Params match
  if (!wasFound) {
    Object
      .entries(interceptors[method])
      .forEach(([interceptorKey, currentInterceptor]) => {
        // Skip keys with no params of if an interceptor was found
        if (wasFound || currentInterceptor.paramsNames.length === 0) return;

        let remainingMatch = key;
        let matchFail = false;

        currentInterceptor.paramsNames.forEach((param) => {
          if (matchFail) return;

          const indexOfColon = interceptorKey.indexOf(`:${param}`);

          if (remainingMatch.slice(0, indexOfColon) === interceptorKey.slice(0, indexOfColon)) {
            const indexOfSlashUrl = indexOfColon + remainingMatch.slice(indexOfColon).indexOf('/');
            const indexOfSlashInterceptor = indexOfColon + param.length + 1;

            remainingMatch = remainingMatch.slice(indexOfSlashUrl);
            interceptorKey = interceptorKey.slice(indexOfSlashInterceptor);
          } else {
            matchFail = true;
          }
        });
        if (remainingMatch === interceptorKey) {
          interceptor = currentInterceptor;
          wasFound = true;
        }
      });
    if (!!interceptor) wasFound = true;
  }

  const isInterceptorInvalid = !interceptor && settings().isNetworkDisabled;
  if (isInterceptorInvalid) {
    const message = `Endpoint not mocked ${method.toUpperCase()} ${key}`;
    throw ReferenceError(message);
  }

  return interceptor;
}
