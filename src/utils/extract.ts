import { endStringWithSlash } from './parse';
import { Interceptor } from '../types/interceptor';
import { Method } from '../types/base';

/**
 * Extract url string from RequestInfo input.
 * @param {RequestInfo} input The provided url input.
 * @return {string} A string url.
 */
function extractUrlFromInput(input: RequestInfo) {
  if (typeof input === 'string') {
    // If input is a string, it is the url
    return input;
  }

  // Otherwise, input is a Request
  return input.url;
}

/**
 * Extract an interceptor key from request input.
 * @param {RequestInfo} input The provided url input.
 */
export function extractKeyFromInput(input: RequestInfo) {
  const url = extractUrlFromInput(input);

  // Trim url
  const trimmedUrl = url
    // Remove query
    .replace(/\?.*$/, '');
  return endStringWithSlash(trimmedUrl);
}

/**
 * Extract an array of dynamic params names from the url.
 * @param {RequestInfo} input The provided url input.
 * @return {string[]} An array of params names.
 */
export function extractParamsNamesFromInput(input: RequestInfo) {
  const url = extractUrlFromInput(input);

  return (url
    .match(/:[^/]+/g) ?? [])
    .map((it) => it.replace(':', ''));
}

/**
 * Get request params from url and its interceptor.
 * @param {string} url The provided url input.
 * @param {Interceptor} interceptor The url matching interceptor.
 */
export function extractParamsFromUrlAndInterceptor(url: string, interceptor: Interceptor) {
  let normalizedUrl = endStringWithSlash(url)
    // Return spaces
    .replace(/%20/g, ' ');

  let { key } = interceptor;
  const { paramsNames } = interceptor;
  const params = {};

  paramsNames.forEach((param) => {
    const indexOfColon = key.indexOf(`:${param}`);
    const indexOfSlashUrl = indexOfColon + normalizedUrl.slice(indexOfColon).indexOf('/');
    const indexOfSlashInterceptor = indexOfColon + param.length + 1;

    const data = normalizedUrl.slice(0, indexOfSlashUrl).slice(indexOfColon);

    normalizedUrl = normalizedUrl.slice(indexOfSlashUrl);
    key = key.slice(indexOfSlashInterceptor);

    Object.assign(params, { [param]: data });
  });

  return params;
}

/**
 * Get lower cased method name from options object.
 * @param {RequestOptions} input The RequestInfo object.
 * @param {RequestInit} init The RequestInit object (optional).
 */
export function extractMethod(input: RequestInfo, init?: RequestInit) {
  if (typeof input === 'object') {
    // input is a Request instance
    return Method[input.method.toLowerCase() as keyof typeof Method];
  }

  // input is string URL, get method from init and fallback to 'get'
  return init?.method ? Method[init.method.toLowerCase() as keyof typeof Method] : Method.get;
}
