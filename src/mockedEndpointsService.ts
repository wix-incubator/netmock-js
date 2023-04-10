// eslint-disable-next-line import/no-cycle
import { netlogApi } from './netlog';
import type {
  MockedEndpoint, MockedEndpointHandler, Method, MockedUrl, MockedEndpointMetaData,
} from './types';
import { getMockedEndpointKey, convertUrlToRegex } from './utils';

function getCleanState() {
  return {
    get: {}, post: {}, put: {}, patch: {}, delete: {},
  };
}

 type MockedEndpointsDictionary = {
   [method in Method]: {
     [key: string]: MockedEndpoint
   }
 };

let mockedEndpoints: MockedEndpointsDictionary = getCleanState();

export function reset() {
  mockedEndpoints = getCleanState();
}

export function getMockedEndpointMetadata(method: Method, url: MockedUrl) {
  const key = getMockedEndpointKey(url);
  return mockedEndpoints[method][key]?.metadata;
}

export function registerMockedEndpoint(method: Method, url: MockedUrl, handler: MockedEndpointHandler, stackTrace: string) {
  if (typeof url === 'string' && isContainingQueryParams(url)) {
    throw new Error(`Cannot mock endpoint with query params. Please remove the query params from the url. Endpoint: ${url}`);
  }
  const key = getMockedEndpointKey(url);
  const urlRegex = url instanceof RegExp ? url : convertUrlToRegex(url);
  const metadata = getEmptyMetadata();
  mockedEndpoints[method][key] = {
    key,
    handler: getHandlerMetadataCollectorWrapper(handler, metadata),
    urlRegex,
    metadata,
    stackTrace,
  };
  return netlogApi(metadata);
}

export function findMockedEndpoint(input: RequestInfo, method: Method): MockedEndpoint | undefined {
  const key = getMockedEndpointKey(input);
  const matchDirect = mockedEndpoints[method][key];
  const matchByParams = () => Object
    .values(mockedEndpoints[method])
    .find((mockedEndpoint) => mockedEndpoint.urlRegex.test(key));

  return matchDirect || matchByParams();
}

export function findMockedMethod(input: RequestInfo) {
  const methods: Method[] = ['get', 'post', 'put', 'delete', 'patch'];
  return methods.filter((method) => !!findMockedEndpoint(input, method));
}

function getHandlerMetadataCollectorWrapper(handler: MockedEndpointHandler, metadata: MockedEndpointMetaData): MockedEndpointHandler {
  return (...params) => {
    metadata.calls.push(params);
    return handler(...params);
  };
}

function getEmptyMetadata(): MockedEndpointMetaData {
  return {
    calls: [],
  };
}

function isContainingQueryParams(url: string) {
  return url.includes('?');
}
