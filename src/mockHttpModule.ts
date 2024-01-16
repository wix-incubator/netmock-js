import { ClientRequestArgs } from 'http';
import { getRequestMethodForHttp, getUrlForHttp } from './utils';
import { findMockedEndpointForHttp, findMockedMethodForHttp } from './mockedEndpointsService';
import { isRealNetworkAllowed } from './settings';

export function httpRequest(request: ClientRequestArgs, cb: CallBack, isHttpsRequest: boolean) {
  console.log(`BLBBL config: ${JSON.stringify(request)}`);
  try {
    const url = decodeURI(getUrlForHttp(request));
    console.log(`url: ${url}`);
    const method = getRequestMethodForHttp(request);
    const mockedEndpoint = findMockedEndpointForHttp(request, method);
    console.log(`mockedEndpoint: ${mockedEndpoint}`);
    if (!mockedEndpoint) {
      console.log('here1');
      if (isRealNetworkAllowed(url)) {
        const func = isHttpsRequest ? global.originalHttps.request : global.originalHttp.request
        return func(request, cb);
      }
      let message = `Endpoint not mocked: ${method.toUpperCase()} ${url}`;
      const mockedMethods = findMockedMethodForHttp(request);
      if (mockedMethods.length > 0) {
        message += `\nThe request is of type ${method.toUpperCase()} but netmock could only find mocks for ${mockedMethods.map((value) => value.toUpperCase()).join(',')}`;
      }

      console.log(`message: ${message}`);

      // throw getErrorWithCorrectStack(message, captureStack(global.fetch));
    }
    return { bla: 3 };
    // const rawRequest = new global.Request(input, init);
    // const headers = Object.fromEntries(rawRequest.headers.entries());
    // const query = Object.fromEntries(new URL(url).searchParams);
    // const params = url.match(mockedEndpoint.urlRegex)?.groups ?? {};
    // const body = rawRequest.body ? rawRequest.body!.toString() : undefined;
    // clearCurrentNetmockReplyTrace();
    // const metadata = getMockedEndpointMetadata(method, url);
    // let res = await mockedEndpoint.handler({
    //   rawRequest, query, params, headers, body,
    // }, { callCount: metadata?.calls.length });
    //
    // const replyTrace = getCurrentNetmockReplyTrace();
    // clearCurrentNetmockReplyTrace();
    // if (!isInstanceOfNetmockResponse(res)) {
    //   if (replyTrace) {
    //     // throw getErrorWithCorrectStack('Error: detected unreturned reply. Did you used "reply()" instead of "return reply()"?', replyTrace);
    //   }
    //   res = reply(res);
    // }
    //
    // const stringifyBody = res.stringifyBody();
    // const responseParams = res.getResponseParams();
    // const response = new global.Response(stringifyBody, responseParams);
    // const responsePromise = new Promise<Response>((resolve) => {
    //   setTimeout(() => resolve(response), responseParams.delay);
    // });
    //
    // return await responsePromise;
  } catch (e) {
    return Promise.reject(e);
  }
}
