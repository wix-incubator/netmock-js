import type { MockedEndpoint, MockedEndpointHandler, MethodType } from './types';
import { getMockedEndpointKey, convertUrlToRegex } from './utils';

function getCleanState() {
  return {
    get: {}, post: {}, put: {}, patch: {}, delete: {},
  };
}

 type MockedEndpointsDictionary = {
   [method in MethodType]: {
     [key: string]: MockedEndpoint
   }
 };

let mockedEndpoints: MockedEndpointsDictionary = getCleanState();

export function reset() {
  mockedEndpoints = getCleanState();
}

export function registerMockedEndpoint(method: MethodType, url: string | RegExp, handler: MockedEndpointHandler) {
  const key = getMockedEndpointKey(url);
  const urlRegex = url instanceof RegExp ? url : convertUrlToRegex(url);
  mockedEndpoints[method][key] = {
    key, handler, urlRegex,
  };
}

export function findMockedEndpoint(input: RequestInfo, method: MethodType): MockedEndpoint | undefined {
  const key = getMockedEndpointKey(input);
  const matchDirect = mockedEndpoints[method][key];
  const matchByParams = () => Object
    .values(mockedEndpoints[method])
    .find((mockedEndpoint) => mockedEndpoint.urlRegex.test(key));

  return matchDirect || matchByParams();
}
