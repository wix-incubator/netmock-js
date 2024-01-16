/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-var */
import * as https from 'https';
import * as http from 'http';

declare var originalFetch: typeof fetch;

declare global {
  namespace NodeJS {
    interface Global {
      originalHttps: typeof https;
    }
  }
}
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
