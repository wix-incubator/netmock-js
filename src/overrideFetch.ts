import { findMockedEndpoint } from './mockedEndpointsService';
import { getRequestMethod, getUrl } from './utils';
import { NetmockResponse } from './NetmockResponse';
import { isRealNetworkAllowed } from './settings';

let originalFetch: any;

export function overrideFetch() {
  if (!originalFetch) {
    originalFetch = global.fetch;
  }
  global.fetch = (input: RequestInfo, init?: RequestInit): Promise<Response> => {
    try {
      const url = getUrl(input);
      const method = getRequestMethod(input, init);
      const mockedEndpoint = findMockedEndpoint(input, method);
      if (!mockedEndpoint) {
        if (isRealNetworkAllowed()) {
          return originalFetch(input, init);
        }
        throw ReferenceError(`Endpoint not mocked: ${method.toUpperCase()} ${url}`);
      }
      const request = new global.Request(input, init);
      const query = Object.fromEntries(new URL(url).searchParams);
      const params = url.match(mockedEndpoint.urlRegex)?.groups ?? {};
      let res = mockedEndpoint.handler({ ...request, query, params });
      if (!(res instanceof NetmockResponse)) {
        res = new NetmockResponse(res);
      }

      const stringifyBody = res.stringifyBody();
      const responseParams = res.getResponseParams();
      const response = new global.Response(stringifyBody, responseParams);
      const responsePromise = new Promise<Response>((resolve) => {
        setTimeout(() => resolve(response), responseParams.delay);
      });

      return responsePromise;
    } catch (e) {
      return Promise.reject(e);
    }
  };
}
