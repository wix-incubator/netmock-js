import { getMockedEndpointMetadata } from './mockedEndpointsService';
import { Method, MockedUrl } from './types';

export function netlog(method: Method, url: MockedUrl) {
  const metadata = getMockedEndpointMetadata(method, url);
  if (!metadata) {
    throw new Error(`Cannot log unmocked endpoint: ${method} ${url}`);
  }
  return {
    callCount: () => metadata.calls.length,
    getRequest: (index: number) => metadata.calls[index][0],
  };
}
