import { getMockedEndpointMetadata } from './mockedEndpointsService';
import { Method, MockedUrl } from './types';
import { captureStack, getErrorWithCorrectStack } from './utils';

export function netlog(method: Method, url: MockedUrl) {
  const metadata = getMockedEndpointMetadata(method, url);
  if (!metadata) {
    throw getErrorWithCorrectStack(`Cannot log unmocked endpoint: ${method} ${url}`, captureStack(netlog));
  }
  const getRequest = (index: number) => metadata.calls[index][0];
  return {
    callCount: () => metadata.calls.length,
    getRequest,
  };
}
