import { Method } from '../types/base';

/**
 * Get an interceptor key from request input.
 * @param {RequestInfo} input The provided url input.
 */
export function getKeyFromInput(input: RequestInfo) {
  if (typeof input === 'string') {
    // If input is a string, it is the url
    return input;
  }

  // Otherwise, input is a Request
  return input.url;
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
