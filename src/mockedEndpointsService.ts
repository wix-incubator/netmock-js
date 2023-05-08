// eslint-disable-next-line import/no-cycle
import { netlogApi } from './netlog';
import { getSettings } from './settings';
import type {
  MockedEndpoint, MockedEndpointHandler, Method, MockedUrl, MockedEndpointMetaData,
} from './types';
import { getMockedEndpointKey, convertUrlToRegex } from './utils';

function getCleanState() {
  return {
    get: {}, post: {}, put: {}, patch: {}, delete: {},
  };
}

global.netmockMockedEndpoints = getCleanState();

export function reset() {
  global.netmockMockedEndpoints = getCleanState();
}

export function getMockedEndpointMetadata(method: Method, url: MockedUrl) {
  const key = getMockedEndpointKey(url);
  return global.netmockMockedEndpoints[method][key]?.metadata;
}

export function registerMockedEndpoint(method: Method, url: MockedUrl, handler: MockedEndpointHandler, stackTrace: string) {
  if (typeof url === 'string' && isContainingQueryParams(url) && !getSettings().suppressQueryParamsInUrlWarnings) {
    console.warn(`
    Warning: detected query params inside a url for the following mocked endpoint: ${url}

    If you want to mock according to url params, use the handler's arguments instead:
    netmock.get('http//bla.com', ({params}) => params.isAdmin? true : false);
    
    You can suppress this warning by using netmock's settings:
    import {settings} from 'netmock-js';
    settings.suppressQueryParamsInsideUrlWarnings = true;`);
  }
  const key = getMockedEndpointKey(url);
  const urlRegex = url instanceof RegExp ? url : convertUrlToRegex(url);
  const metadata = getEmptyMetadata();
  global.netmockMockedEndpoints[method][key] = {
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
  const matchDirect = global.netmockMockedEndpoints[method][key];
  const matchByParams = () => Object
    .values(global.netmockMockedEndpoints[method])
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
