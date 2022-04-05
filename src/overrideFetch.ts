import { findMockedEndpoint, findMockedMethod } from './mockedEndpointsService';
import { getRequestMethod, getUrl } from './utils';
import { clearIsCurrentlyUsingNetmockReply, getIsCurrentlyUsingNetmockReply, NetmockResponse } from './NetmockResponse';
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
        let message = `Endpoint not mocked: ${method.toUpperCase()} ${url}`;
        const mockedMethods = findMockedMethod(input);
        if (mockedMethods.length > 0) {
          message += `\nThe request is of type ${method.toUpperCase()} but netmock could only find mocks for ${mockedMethods.map((value) => value.toUpperCase()).join(',')}`;
        }
        throw Error(message);
      }
      const rawRequest = new global.Request(input, init);
      const headers = Object.fromEntries(rawRequest.headers.entries());
      const query = Object.fromEntries(new URL(url).searchParams);
      const params = url.match(mockedEndpoint.urlRegex)?.groups ?? {};
      clearIsCurrentlyUsingNetmockReply();
      let res = mockedEndpoint.handler({
        rawRequest, query, params, headers,
      });

      const isUsedNetmockReply = getIsCurrentlyUsingNetmockReply();
      clearIsCurrentlyUsingNetmockReply();
      if (!(res instanceof NetmockResponse)) {
        if (isUsedNetmockReply) {
          throw new Error('Error: detected unreturned reply. Did you used "reply()" instead of "return reply()"?');
        }
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
