import { Method } from '../types/base';
import { Interceptor } from '../types/interceptor';

/**
 * Validate if a string ends with a slash (/),
 * if yes, return the string,
 * otherwise, return the same string with a slash in the end.
 * @param {string} str The string to check.
 * @return {string} The same sting ends with slash
 */
export function getStringEndWithSlash(str: string) {
  const lastChar = str.slice(-1);
  if (lastChar === '/') {
    return str;
  }
  return str.concat('/');
}

/**
 * Trim the url from query, slashes and params.
 * @param {string} url The url string to trim.
 * @return {string} A trimmed url.
 */
function trimUrl(url: string) {
  return getStringEndWithSlash(
    // Remove query
    url.replace(/\?.*$/, ''),
  );
}

/**
 * Get an interceptor key from request input.
 * @param {RequestInfo} input The provided url input.
 */
export function getKeyFromInput(input: RequestInfo) {
  if (typeof input === 'string') {
    // If input is a string, it is the url
    return trimUrl(input);
  }

  // Otherwise, input is a Request
  return trimUrl(input.url);
}

/**
 * Extract an array of dynamic params names from the url.
 * @param {string} url The url string to extract params from.
 * @return {string[]} An array of params names.
 * */
function extractParamsNames(url: string) {
  return (url.match(/:[^/]+/g) ?? [])
    .map((it) => it.replace(':', ''));
}

/**
 * Get an interceptor key from request input.
 * @param {RequestInfo} input The provided url input.
 */
export function getParamsNamesFromInput(input: RequestInfo) {
  if (typeof input === 'string') {
    // If input is a string, it is the url
    return extractParamsNames(input);
  }

  // Otherwise, input is a Request
  return extractParamsNames(input.url);
}

/**
 * Get request params from url and its interceptor.
 * @param {string} url The provided url input.
 * @param {Interceptor} interceptor The url matching interceptor.
 */
export function getParamsFromUrlAndInterceptor(url: string, interceptor: Interceptor) {
  const { key, paramsNames } = interceptor;
  const params = {};

  paramsNames.forEach((param) => {
    const indexOfColon = key.indexOf(`:${param}`);
    const indexOfSlash = indexOfColon + url.slice(indexOfColon).indexOf('/');

    const data = url.slice(0, indexOfSlash).slice(indexOfColon);

    Object.assign(params, { [param]: data });
  });

  return params;
}

/**
 * Get lower cased method name from options object.
 * @param {RequestOptions} input The RequestInfo object.
 * @param {RequestInit} init The RequestInit object (optional).
 */
export function getMethod(input: RequestInfo, init?: RequestInit) {
  if (typeof input === 'object') {
    // input is a Request instance
    return Method[input.method.toLowerCase() as keyof typeof Method];
  }

  // input is string URL, get method from init and fallback to 'get'
  return init?.method ? Method[init.method.toLowerCase() as keyof typeof Method] : Method.get;
}
