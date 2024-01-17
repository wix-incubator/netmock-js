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
      if (isRealNetworkAllowed(url) || true) { // TODO remove true
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

    const res = mockedEndpoint.handler({
      // @ts-ignore
      rawRequest: request, query, params, headers, body,
    }, { callCount: metadata?.calls.length });
    // if (!isInstanceOfNetmockResponse(res)) {
    //   res = reply(res);
    // }
    setTimeout(() => cb({
      headers: {},
      location: 'BLA',
      data: res,
      statusCode: 200,
      on: (eventName: string, onCB: CallBack) => {
        console.log(`eventName: ${eventName}`);
        if (eventName === 'data'){
          onCB(res);
          return res;
        }
        if (!['aborted', 'error'].includes(eventName)){
          onCB(null);
          return res;
        }
      },
      destroy: () => {},
    }), 0);
    return {
      on: (...args: any[]) => { console.log(`on args: ${args}`); },
      destroy: (...args: any[]) => { console.log(`destroy args: ${args}`); },
      end: (...args: any[]) => { console.log(`destroy args: ${args}`); },
      location: 'BLA',
      data: res,
      statusCode: 200,
    };
  } catch (e) {
    console.log(`e: ${e}`);
    return Promise.reject(e);
  }
}

function stringifyWithOneLevel(obj: any) {
  const seen = new WeakSet();

  function replacer(key: any, value: any) {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular Reference]';
      }
      seen.add(value);
    }
    return value;
  }

  return JSON.stringify(obj, replacer);
}
