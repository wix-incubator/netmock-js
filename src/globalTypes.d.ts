/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-var */

declare var originalFetch: typeof fetch;
declare var originalHttps: typeof https;
declare var originalHttp: typeof http;

declare var __netmockSettings: NetmockSettings;
declare var __netmockMockedEndpoints: {
  [method in import('./types').Method]: {
    [key: string]: import('./types').MockedEndpoint;
  }
};
type NetmockSettings = {
  allowRealNetwork: boolean | RegExp;
  suppressQueryParamsInUrlWarnings: boolean;
};
