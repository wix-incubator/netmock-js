import { InterceptorsDictionary } from '../types/desk';
import { NetmockRequest } from '../types/base';
import { Interceptor } from '../types/interceptor';

import { findInterceptor } from './interceptor';
import { endStringWithSlash } from './parse';
import { extractMethod, extractParamsFromUrlAndInterceptor } from './extract';

const originalFetch = global.fetch;

function enhanceRequest(req: Request, interceptor: Interceptor): NetmockRequest {
  const url = endStringWithSlash(req.url);

  const { searchParams } = new URL(url.slice(0, -1));
  const query = Object.fromEntries(searchParams);

  const params = extractParamsFromUrlAndInterceptor(req.url, interceptor);

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
    const method = extractMethod(input, init);
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
