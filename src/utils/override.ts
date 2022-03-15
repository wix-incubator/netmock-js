import { InterceptorsDictionary } from '../types/desk';
import { findInterceptor } from './interceptors';
import { getStringEndWithSlash, getMethod, getParamsFromUrlAndInterceptor } from './parse';
import { NetmockRequest } from '../types/base';
import { Interceptor } from '../types/interceptor';

const originalFetch = global.fetch;

function enhanceRequest(req: Request, interceptor: Interceptor): NetmockRequest {
  const url = getStringEndWithSlash(req.url);

  const { searchParams } = new URL(url.slice(0, -1));
  const query = Object.fromEntries(searchParams);

  const params = getParamsFromUrlAndInterceptor(url, interceptor);

  return {
    ...req,
    query,
    params,
  };
}

/**
 * Override the Fetch API fetch() function
 */
export function overrideFetch(interceptors: InterceptorsDictionary) {
  global.fetch = (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    const method = getMethod(input, init);
    const interceptor = findInterceptor(interceptors, { input, method });

    if (!interceptor) {
      return originalFetch(input, init);
    }

    const rawReq = new global.Request(input, init);
    const req = enhanceRequest(rawReq, interceptor);
    const body = interceptor.handler(req);
    const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
    const res = new global.Response(bodyString);

    return Promise.resolve(res);
  };
}

/**
 * Restore the original fetch function as the global.fetch() function
 */
export function restoreFetchOverride() {
  global.fetch = originalFetch;
}
