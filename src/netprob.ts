import { getMockedEndpointMetadata } from './mockedEndpointsService';
import { Method, MockedUrl } from './types';

export function netprob(method: Method, url: MockedUrl) {
  const metadata = getMockedEndpointMetadata(method, url);
  if (!metadata) {
    throw new Error(`Cannot probe unmocked endpoint: ${method} ${url}`);
  }
  return {
    callCount: () => metadata.calls.length,
    getRequest: (index: number) => metadata.calls[index][0],
  };
}
