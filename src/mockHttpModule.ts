import { ClientRequestArgs } from 'http';
import httpMock from 'node-mocks-http';
import {
  captureStack, getErrorWithCorrectStack, getRequestMethodForHttp, getUrlForHttp,
} from './utils';
import { findMockedEndpointForHttp, findMockedMethodForHttp, getMockedEndpointMetadata } from './mockedEndpointsService';
import { isRealNetworkAllowed } from './settings';
import {
  clearCurrentNetmockReplyTrace,
  getCurrentNetmockReplyTrace,
  isInstanceOfNetmockResponse, reply,
} from './NetmockResponse';

export function httpRequest(request: ClientRequestArgs & { query?: string, body?: any }, cb: CallBack, isHttpsRequest: boolean) {
  try {
    console.log(`BLBBL config: ${JSON.stringify(request)}`);
    const originalModule = isHttpsRequest ? global.originalHttps : global.originalHttp;
    const func = originalModule.request;
    const url = decodeURI(getUrlForHttp(request));
    console.log(`url: ${url}`);
    const method = getRequestMethodForHttp(request);
    const mockedEndpoint = findMockedEndpointForHttp(request, method);
    if (!mockedEndpoint) {
      if (isRealNetworkAllowed(url) || true) {
        return func(request, cb);
      }
      let message = `Endpoint not mocked: ${method.toUpperCase()} ${url}`;
      const mockedMethods = findMockedMethodForHttp(request);
      console.log(`mockedMethods: ${mockedMethods}`);
      if (mockedMethods.length > 0) {
        message += `\nThe request is of type ${method.toUpperCase()} but netmock could only find mocks for ${mockedMethods.map((value) => value.toUpperCase()).join(',')}`;
      }

      throw getErrorWithCorrectStack(message, captureStack(func));
    }
    const headers = request.headers;
    const query = request.query;
    const params = url.match(mockedEndpoint.urlRegex)?.groups ?? {};
    const body = request.body;

    const metadata = getMockedEndpointMetadata(method, url);

    let res = mockedEndpoint.handler({
      // @ts-ignore
      rawRequest: request, query, params, headers, body,
    }, { callCount: metadata?.calls.length });
    console.log(`res0: ${res}`);
    if (!isInstanceOfNetmockResponse(res)) {
      res = reply(res);
    }
    console.log(`res1: ${JSON.stringify(res)}`);
    const stringifyBody = res.stringifyBody();
    console.log(`stringifyBody: ${stringifyBody}`);
    const responseParams = res.getResponseParams();
    console.log(`responseParams: ${JSON.stringify(responseParams)}`)
    const response = new global.Response(stringifyBody, responseParams);
    console.log(`response: ${JSON.stringify(response)}`);
    cb(response);
    //
    // const stringifyBody = res.stringifyBody();
    // console.log(`stringifyBody: ${stringifyBody}`)
    // const responseParams = res.getResponseParams();
    // console.log(`responseParams: ${responseParams}`);
    // const response = new global.Response(stringifyBody, responseParams);
    // console.log(`response: ${JSON.stringify(response)}`);
    // if (responseParams.delay) {
    //   setTimeout(() => cb(response), responseParams.delay);
    // } else {
    //   cb(response);
    // }
    //
    // cb(res);
    // return null;
  } catch (e) {
    return Promise.reject(e);
  }
}
