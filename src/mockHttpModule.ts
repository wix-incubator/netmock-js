import {
  captureStack, getErrorWithCorrectStack, getHeadersForHttp, getRequestMethodForHttp, getUrlForHttp, parseQueryForHttp,
} from './utils';
import { findMockedEndpointForHttp, findMockedMethodForHttp, getMockedEndpointMetadataForHttp } from './mockedEndpointsService';
import { isRealNetworkAllowed } from './settings';
import { NetmockResponseType } from './types';
import { isInstanceOfNetmockResponse } from './NetmockResponse';
import { MockHttpEventsBuilder } from './MockHttpEventsBuilder';

const initialResponseObject = {
  headers: {},
  location: 'DEFAULT_LOCATION',
};

function handleNotMockedResponse(request: HttpRequest, requestBuilder: MockHttpEventsBuilder, responseBuilder: MockHttpEventsBuilder, requestCallback?: CallBack, isHttpsRequest?: boolean) {
  const originalModule = isHttpsRequest ? global.originalHttps : global.originalHttp;
  const url = getUrlForHttp(request);
  const method = getRequestMethodForHttp(request);
  if (isRealNetworkAllowed(url)) {
    return originalModule.request(request, requestCallback);
  }
  let message = `Endpoint not mocked: ${method.toUpperCase()} ${url}`;
  const mockedMethods = findMockedMethodForHttp(request);
  if (mockedMethods.length > 0) {
    message += `\nThe request is of type ${method.toUpperCase()} but netmock could only find mocks for ${mockedMethods.map((value) => value.toUpperCase()).join(',')}`;
  }

  const err = getErrorWithCorrectStack(message, captureStack(originalModule.request));
  const requestResult = requestBuilder
    .setStatusCode(500)
    .setErrorMessage(err)
    .setEnd(() => {
      if (requestCallback) {
        requestCallback(responseResult);
      }
    })
    .build();

  const responseResult = responseBuilder
    .setStatusCode(500)
    .setErrorMessage(err)
    .setOn((eventName: string, onCallback: CallBack) => {
      if (['error', 'end'].includes(eventName)) {
        onCallback(err);
        return err;
      }
      return null;
    })
    .build();

  return requestResult;
}
export function httpRequest(request: HttpRequest, cb?: CallBack, isHttpsRequest?: boolean) {
  const requestBuilder = new MockHttpEventsBuilder(initialResponseObject);
  const responseBuilder = new MockHttpEventsBuilder(initialResponseObject);
  try {
    requestBuilder.setCallback(cb);
    const url = getUrlForHttp(request);
    const method = getRequestMethodForHttp(request);
    const mockedEndpoint = findMockedEndpointForHttp(request, method);
    if (!mockedEndpoint) {
      return handleNotMockedResponse(request, requestBuilder, responseBuilder, cb, isHttpsRequest);
    }
    const headers = getHeadersForHttp(request);
    const query = parseQueryForHttp(request);
    const params = url.match(mockedEndpoint.urlRegex)?.groups ?? {};
    const metadata = getMockedEndpointMetadataForHttp(method, url);

    return requestBuilder.setEnd(async () => {
      const body = requestBuilder.body;
      let handlerResponse = mockedEndpoint.handler({
        // @ts-ignore
        rawRequest: new Request(request), query, params, headers, body,
      }, { callCount: metadata?.calls.length }) || '';
      if (typeof handlerResponse === 'object' && !isPromise(handlerResponse) && !isInstanceOfNetmockResponse(handlerResponse)) {
        handlerResponse = JSON.stringify(handlerResponse);
      }
      await wait(getDelay(handlerResponse));
      requestBuilder.mockedResponse = isPromise(handlerResponse) ? await handlerResponse : handlerResponse;
      const responseObject = convertResponse(requestBuilder, requestBuilder.mockedResponse);
      if (cb) {
        cb(responseObject);
      }
    }).build();
  } catch (e) {
    return Promise.reject(e);
  }
}
function isPromise(obj: any) {
  return obj instanceof Promise;
}

function convertResponse(responseBuilder: MockHttpEventsBuilder, response: HttpResponse) {
  if (isInstanceOfNetmockResponse(response)) {
    const netmockRes = response as NetmockResponseType<string | object>;
    const netmockResParams = netmockRes.getResponseParams();

    return responseBuilder.setStatusCode(netmockResParams.status)
      .setStatusMessage(netmockResParams.statusText)
      .setData(netmockRes.stringifyBody())
      .addParams({ ...netmockResParams })
      .build();
  }
  return responseBuilder.setData(response).build();
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
