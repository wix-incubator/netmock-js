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

export function httpRequest(request: ClientRequestArgs & { query?: string, body?: any }, cb?: CallBack, isHttpsRequest?: boolean) {
  try {
    const originalModule = isHttpsRequest ? global.originalHttps : global.originalHttp;
    const func = originalModule.request;
    const url = decodeURI(getUrlForHttp(request));
    const method = getRequestMethodForHttp(request);
    const mockedEndpoint = findMockedEndpointForHttp(request, method);
    if (!mockedEndpoint) {
      if (isRealNetworkAllowed(url) || true) { // TODO remove true
        return func(request, cb);
      }
      let message = `Endpoint not mocked: ${method.toUpperCase()} ${url}`;
      const mockedMethods = findMockedMethodForHttp(request);
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
    }, { callCount: metadata?.calls.length }) || '';
    const responseObject = {
      headers: {},
      location: 'BLA',
      data: res,
      statusCode: 200,
      once: (...args: any[]) => console.log(`args once: ${args}`),
      pipe: () => res,
    };
    const finalResponse = {
      ...responseObject,
      on: (eventName: string, onCB: CallBack) => {
        console.log(`eventName: ${eventName}`);
        if (eventName === 'data') {
          onCB(res);
          return res;
        } if (eventName === 'response') {
          onCB(responseObject);
          return responseObject;
        }
        if (!['aborted', 'error'].includes(eventName)) {
          onCB(null);
          return res;
        }
      },
      destroy: (onCb: any) => { onCb(null); },
    };
    if (cb) {
      setTimeout(() => cb(finalResponse), 0);
    }
    return cb ? {
      // on: (onCb: any) => { console.log(`on args: ${onCb}`); },
      on: (eventName: string, onCB: CallBack) => {
        console.log(`eventName2: ${eventName}`);
        if (['response'].includes(eventName)) {
          onCB(responseObject);
          return res;
        }
        if (!['aborted', 'error', 'abort', 'connect', 'socket', 'timeout'].includes(eventName)) {
          onCB({
            emit: (...args: any[]) => console.log(`args emit: ${args}`),
          });
          return res;
        }
      },
      destroy: (onCb: any) => { console.log(`destroy args: ${onCb}`); },
      end: (...args: any[]) => { console.log(`destroy args: ${args}`); },
      location: 'BLA',
      data: res,
      statusCode: 200,
    } : finalResponse;
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
