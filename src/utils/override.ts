import { InterceptorsDictionary } from '../types/desk';
import { NetmockRequest } from '../types/base';
import { Interceptor } from '../types/interceptor';

import { findInterceptor } from './interceptor';
import { endStringWithSlash } from './parse';
import { extractMethod, extractParamsFromUrlAndInterceptor } from './extract';

const originalFetch = global.fetch;

/**
 * Enhance an intercepted request object.
 * Inject query and url params to the request.
 * @param {Request} req The request object to enhance.
 * @param {Interceptor} interceptor The request's interceptor.
 * @return {NetmockRequest} An enhanced NetmockRequest object.
 */
function enhanceInterceptedRequest(req: Request, interceptor: Interceptor): NetmockRequest {
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
    try {
      const method = extractMethod(input, init);
      const interceptor = findInterceptor(interceptors, { input, method });

      if (!interceptor) {
        return originalFetch(input, init);
      }

      const request = new global.Request(input, init);
      const req = enhanceInterceptedRequest(request, interceptor);
      const res = interceptor.res;

      if (interceptor.handler) {
        res.body = interceptor.handler(req, res);
      }

      const stringifyBody = res.stringifyBody();
      const responseParams = res.getResponseParams();

      const response = new global.Response(stringifyBody, responseParams);
      const responsePromise = new Promise<Response>((resolve) => {
        const resolveResponse = () => resolve(response);
        setTimeout(resolveResponse, responseParams.delay);
      });

      return responsePromise;
    } catch (e) {
      return Promise.reject(e);
    }
  };
}

/**
 * Restore the original fetch function as the global.fetch() function
 */
export function restoreFetchOverride() {
  global.fetch = originalFetch;
}
