/* eslint-disable no-var */

declare var originalFetch: typeof fetch;
declare var netmockMockedEndpoints: {
  [method in import('./types').Method]: {
    [key: string]: import('./types').MockedEndpoint;
  }
};
