import { InterceptorsDictionary } from '../types/desk';
import { findInterceptor } from './interceptors';
import { getMethod } from './parse';

const originalFetch = global.fetch;

/**
 * Override the Fetch API fetch() function
 */
export function overrideFetch(interceptors: InterceptorsDictionary) {
  global.fetch = (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    const req = new global.Request(input, init);

    const method = getMethod(input, init);
    const interceptor = findInterceptor(interceptors, { input, method });

    const body = interceptor(req);
    const res = new global.Response(body);

    return Promise.resolve(res);
  };
}

export function restoreFetchOverride() {
  global.fetch = originalFetch;
}
