import {
  captureStack, getErrorWithCorrectStack, getHeadersForHttp, getRequestMethodForHttp, getUrlForHttp, parseQueryForHttp,
} from './utils';
import { findMockedEndpointForHttp, findMockedMethodForHttp, getMockedEndpointMetadataForHttp } from './mockedEndpointsService';
import { isRealNetworkAllowed } from './settings';
import { NetmockResponseType } from './types';
import { isInstanceOfNetmockResponse } from './NetmockResponse';

function handleNotMockedResponse(request: HttpRequest, requestCallback?: CallBack, isHttpsRequest?: boolean) {
  const originalModule = isHttpsRequest ? global.originalHttps : global.originalHttp;
  const url = getUrlForHttp(request);
  const method = getRequestMethodForHttp(request);
  const initialResponseObject = {
    headers: {},
    location: 'DEFAULT_LOCATION',
  };
  if (isRealNetworkAllowed(url)) {
    return originalModule.request(request, requestCallback);
  }
  let message = `Endpoint not mocked: ${method.toUpperCase()} ${url}`;
  const mockedMethods = findMockedMethodForHttp(request);
  if (mockedMethods.length > 0) {
    message += `\nThe request is of type ${method.toUpperCase()} but netmock could only find mocks for ${mockedMethods.map((value) => value.toUpperCase()).join(',')}`;
  }

  const err = getErrorWithCorrectStack(message, captureStack(originalModule.request));
  return {
    ...initialResponseObject,
    statusCode: 500,
    on: (eventName: string, onCallback: CallBack) => {
      if (['error', 'abort', 'aborted'].includes(eventName) && !requestCallback) {
        onCallback(err);
        return err;
      }
      return null;
    },
    end: () => {
      if (requestCallback) {
        requestCallback({
          ...initialResponseObject,
          statusCode: 500,
          cause: err,
          on: (eventName: string, onCallback: CallBack) => {
            if (['error', 'end'].includes(eventName)) {
              onCallback(err);
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
    location: 'DEFAULT_LOCATION',
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
    const metadata = getMockedEndpointMetadataForHttp(method, url);
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
      pipe: () => getResBuffer(res),
    };
    const returnValue = {
      ...responseObject,
      on: async (eventName: string, onCallback: CallBack) => {
        let onReturnValue;
        if (eventName === 'data') {
          onReturnValue = getResBuffer(res);
        } else if (eventName === 'response') {
          await waitForRes();
          onReturnValue = responseObject;
        } else {
          onReturnValue = null;
        }
        if (!['aborted', 'error', 'abort', 'connect', 'socket', 'timeout'].includes(eventName)) {
          onCallback(onReturnValue);
          return onReturnValue;
        }
        return null;
      },
      destroy: (destroyCallback: any) => { destroyCallback(null); },
      end: () => { },
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
        cb({ ...returnValue, ...responseObject });
      }
    }, 0);
    return returnValue;
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

function getResBuffer(res: any) {
  return Buffer.from((isInstanceOfNetmockResponse(res) ? (res as NetmockResponseType<string>).stringifyBody() : res.toString()) || '');
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
