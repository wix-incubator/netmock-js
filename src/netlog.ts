// eslint-disable-next-line import/no-cycle
import { getMockedEndpointMetadata } from './mockedEndpointsService';
import type {
  Method, MockedEndpointMetaData, MockedUrl, NetlogAPI,
} from './types';
import { captureStack, getErrorWithCorrectStack } from './utils';

export function netlog(method: Method, url: MockedUrl): NetlogAPI {
  const metadata = getMockedEndpointMetadata(method, url);
  if (!metadata) {
    throw getErrorWithCorrectStack(`Cannot log unmocked endpoint: ${method} ${url}`, captureStack(netlog));
  }
  return netlogApi(metadata);
}

export function netlogApi(metadata: MockedEndpointMetaData): NetlogAPI {
  return {
    callCount: () => metadata.calls.length,
    getRequest: (index: number) => {
      console.log(`index: ${index}`);
      console.log(`metadata.calls[index]: ${JSON.stringify(metadata.calls[index])}`)
      console.log(`metadata: ${JSON.stringify(metadata)}`)
      return metadata.calls[index][0]
    },
  };
}
