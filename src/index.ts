import { registerMockedEndpoint } from './mockedEndpointsService';
import { MockedEndpointHandler, Netmock } from './types';
import { captureStack } from './utils';

export { netlog } from './netlog';
export { allowRealNetwork } from './settings';
export { reply } from './NetmockResponse';
export { reply as resp } from './NetmockResponse';
export * from './types';
export const netmock: Netmock = {
  get: (url: string | RegExp, handler: MockedEndpointHandler) => registerMockedEndpoint('get', url, handler, captureStack(netmock.get)),
  post: (url: string | RegExp, handler: MockedEndpointHandler) => registerMockedEndpoint('post', url, handler, captureStack(netmock.post)),
  put: (url: string | RegExp, handler: MockedEndpointHandler) => registerMockedEndpoint('put', url, handler, captureStack(netmock.put)),
  patch: (url: string | RegExp, handler: MockedEndpointHandler) => registerMockedEndpoint('patch', url, handler, captureStack(netmock.patch)),
  delete: (url: string | RegExp, handler: MockedEndpointHandler) => registerMockedEndpoint('delete', url, handler, captureStack(netmock.delete)),
};
