import { ClientRequestArgs, OutgoingHttpHeaders } from 'http';
import {
  captureStack, getErrorWithCorrectStack, getRequestMethodForHttp, getUrlForHttp,
} from './utils';
import { findMockedEndpointForHttp, findMockedMethodForHttp, getMockedEndpointMetadata } from './mockedEndpointsService';
import { isRealNetworkAllowed } from './settings';
import { NetmockResponseType } from './types';
import { isInstanceOfNetmockResponse } from './NetmockResponse';

let i = 0;
export function httpRequest(request: ClientRequestArgs & { query?: string, body?: any, search?: string }, cb?: CallBack, isHttpsRequest?: boolean) {
  i += 1;
  const initialResponseObject = {
    headers: {},
    location: 'BLA',
  };
  try {
    const originalModule = isHttpsRequest ? global.originalHttps : global.originalHttp;
    const isAxios = request.headers?.['User-Agent']?.toString().includes('axios'); // TRY to remove isAxios.
    const func = originalModule.request;
    const url = decodeURI(getUrlForHttp(request));
    const method = getRequestMethodForHttp(request);
    const mockedEndpoint = findMockedEndpointForHttp(request, method);
    if (!mockedEndpoint) {
      if (isRealNetworkAllowed(url)) {
        return func(request, cb);
      }
      let message = `Endpoint not mocked: ${method.toUpperCase()} ${url}`;
      const mockedMethods = findMockedMethodForHttp(request);
      if (mockedMethods.length > 0) {
        message += `\nThe request is of type ${method.toUpperCase()} but netmock could only find mocks for ${mockedMethods.map((value) => value.toUpperCase()).join(',')}`;
      }

      const err = getErrorWithCorrectStack(message, captureStack(func));
      return {
        ...initialResponseObject,
        statusCode: 500,
        on: (eventName: string, onCB: CallBack) => {
          if (['error', 'abort', 'aborted'].includes(eventName) && !isAxios) {
            onCB(err);
            return err;
          }
          return {};
        },
        end: () => {
          if (cb) {
            cb({
              ...initialResponseObject,
              statusCode: 500,
              cause: err,
              on: (eventName: string, endCallback: CallBack) => {
                if (['error', 'end'].includes(eventName)) {
                  endCallback(err);
                  return err;
                }
              },
              destroy: () => {},
            });
          }
        },
      };
    }
    const headers = getHeaders(request.headers);
    const query = parseQuery(request.query || request.search);
    const params = url.match(mockedEndpoint.urlRegex)?.groups ?? {};
    const metadata = getMockedEndpointMetadata(method, url);
    let body = '';
    let res: any;
    const waitForRes = async () => {
      while (res === undefined) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 5));
      }
    };
    let responseObject: ResponseObject = {
      ...initialResponseObject,
      statusCode: 200,
      once: () => { },
      write: (text: Buffer) => {
        body = text.toString('utf8');
      },
      pipe: () => {
        console.log(`res in pipe: ${res}`);
        return getResStr(res);
      },
    };
    setTimeout(async () => {
      let response = mockedEndpoint.handler({
        // @ts-ignore
        rawRequest: new Request(request), query, params, headers, body,
      }, { callCount: metadata?.calls.length }) || '';
      if (typeof response === 'object' && !isPromise(response) && !isInstanceOfNetmockResponse(response)) {
        response = JSON.stringify(response);
      }
      await wait(getDelay(response));
      res = isPromise(response) ? await response : response;
      responseObject = convertResponse(responseObject, res);
      console.log(`YOY: responseObject: ${JSON.stringify(responseObject)}`);
      console.log(`YOY: cb: ${cb}`);
      if (cb) {
        console.log(`calling cb: ${stringifyWithOneLevel({ ...finalResponse, ...responseObject })}`);
        cb({ ...finalResponse, ...responseObject });
      }
    }, 0);
    const finalResponse = {
      ...responseObject,
      on: async (eventName: string, onCB: CallBack) => {
        console.log(`eventName: ${eventName}`);
        let returnValue;
        if (eventName === 'data') {
          returnValue = getResStr(res);
        } else if (eventName === 'response') {
          await waitForRes();
          returnValue = responseObject;
        } else {
          returnValue = null;
        }
        if (!['aborted', 'error', 'abort', 'connect', 'socket', 'timeout'].includes(eventName)) {
          console.log(`calling onCB for: ${eventName}`);
          console.log(`calling onCB for returnValue: ${stringifyWithOneLevel(returnValue)}`);
          onCB(returnValue);
          return returnValue;
        }
      },
      destroy: (onCb: any) => { onCb(null); },
      end: () => { },
    };
    return finalResponse;
  } catch (e) {
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

function parseQuery(queryString?: string) {
  if (!queryString) {
    return '';
  }
  const query: { [key: string]: string } = {};
  const pairs = (queryString[0] === '?' ? queryString.substr(1) : queryString).split('&');
  pairs.forEach((item) => {
    const pair = item.split('=');
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  });
  return query;
}
function getHeaders(originalHeaders?: OutgoingHttpHeaders) {
  const initialHeaders = originalHeaders || {};
  return Object.keys(initialHeaders).reduce((prev, cur) => ({ ...prev, [cur]: initialHeaders[cur]?.toString() }), {});
}

function isPromise(obj: any) {
  return obj instanceof Promise;
}

function convertResponse<T>(originalResponse: ResponseObject, response: NetmockResponseType<T>) {
  if (isInstanceOfNetmockResponse(response)) {
    const netmockRes = response.getResponseParams();
    return {
      ...originalResponse,
      statusCode: netmockRes.status,
      statusMessage: netmockRes.statusText,
      ...(response.getResponseParams()),
      data: response.stringifyBody(),
    };
  }
  return {
    ...originalResponse,
    data: response,
  };
}

function getResStr(res: any) {
  return isInstanceOfNetmockResponse(res) ? (res as NetmockResponseType<string>).stringifyBody() : res;
}

function getDelay(res: any) {
  return isInstanceOfNetmockResponse(res) ? (res as NetmockResponseType<any>).getResponseParams().delay : 0;
}

function wait(time: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, time);
  });
}
