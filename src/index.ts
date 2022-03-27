import { registerMockedEndpoint } from './mockedEndpointsService';
import { MockedEndpointHandler, Netmock } from './types';

export { allowRealNetwork } from './settings';
export { resp } from './NetmockResponse';
export * from './types';

export const netmock: Netmock = {
  get: (url: string | RegExp, handler: MockedEndpointHandler) => registerMockedEndpoint('get', url, handler),
  post: (url: string | RegExp, handler: MockedEndpointHandler) => registerMockedEndpoint('post', url, handler),
  put: (url: string | RegExp, handler: MockedEndpointHandler) => registerMockedEndpoint('put', url, handler),
  patch: (url: string | RegExp, handler: MockedEndpointHandler) => registerMockedEndpoint('patch', url, handler),
  delete: (url: string | RegExp, handler: MockedEndpointHandler) => registerMockedEndpoint('delete', url, handler),
};
