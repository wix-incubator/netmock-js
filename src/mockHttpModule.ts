import {
  captureStack, getErrorWithCorrectStack, getHeadersForHttp, getRequestMethodForHttp, getUrlForHttp, parseQueryForHttp,
} from './utils';
import { findMockedEndpointForHttp, findMockedMethodForHttp, getMockedEndpointMetadata } from './mockedEndpointsService';
import { isRealNetworkAllowed } from './settings';
import { NetmockResponseType } from './types';
import { isInstanceOfNetmockResponse } from './NetmockResponse';

function handleNotMockedResponse(request: HttpRequest, cb?: CallBack, isHttpsRequest?: boolean) {
  const originalModule = isHttpsRequest ? global.originalHttps : global.originalHttp;
  const func = originalModule.request;
  const url = getUrlForHttp(request);
  const method = getRequestMethodForHttp(request);
  const initialResponseObject = {
    headers: {},
    location: 'BLA',
  };
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
      if (['error', 'abort', 'aborted'].includes(eventName) && !cb) {
        onCB(err);
        return err;
      }
      return null;
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
            return null;
          },
          destroy: () => {},
        });
      }
    },
  };
}
export function httpRequest(request: HttpRequest, cb?: CallBack, isHttpsRequest?: boolean) {
  const initialResponseObject = {
    headers: {},
    location: 'BLA',
  };
  try {
    const url = getUrlForHttp(request);
    const method = getRequestMethodForHttp(request);
    const mockedEndpoint = findMockedEndpointForHttp(request, method);
    if (!mockedEndpoint) {
      return handleNotMockedResponse(request, cb, isHttpsRequest);
    }
    const headers = getHeadersForHttp(request);
    const query = parseQueryForHttp(request);
    const params = url.match(mockedEndpoint.urlRegex)?.groups ?? {};
    const metadata = getMockedEndpointMetadata(method, url);
    let body = '';
    let res: HttpResponse;
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
      pipe: () => getResStr(res),
    };
    setTimeout(async () => {
      let handlerResponse = mockedEndpoint.handler({
        // @ts-ignore
        rawRequest: new Request(request), query, params, headers, body,
      }, { callCount: metadata?.calls.length }) || '';
      if (typeof handlerResponse === 'object' && !isPromise(handlerResponse) && !isInstanceOfNetmockResponse(handlerResponse)) {
        handlerResponse = JSON.stringify(handlerResponse);
      }
      await wait(getDelay(handlerResponse));
      res = isPromise(handlerResponse) ? await handlerResponse : handlerResponse;
      responseObject = convertResponse(responseObject, res);
      if (cb) {
        cb({ ...returnObject, ...responseObject });
      }
    }, 0);
    const returnObject = {
      ...responseObject,
      on: async (eventName: string, onCB: CallBack) => {
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
          onCB(returnValue);
          return returnValue;
        }
        return null;
      },
      destroy: (onCb: any) => { onCb(null); },
      end: () => { },
    };
    return returnObject;
  } catch (e) {
    return Promise.reject(e);
  }
}
function isPromise(obj: any) {
  return obj instanceof Promise;
}

function convertResponse(originalResponse: ResponseObject, response: HttpResponse) {
  if (isInstanceOfNetmockResponse(response)) {
    const netmockRes = response as NetmockResponseType<string | object>;
    const netmockResParams = netmockRes.getResponseParams();
    return {
      ...originalResponse,
      statusCode: netmockResParams.status,
      statusMessage: netmockResParams.statusText,
      ...(netmockRes.getResponseParams()),
      data: netmockRes.stringifyBody(),
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
