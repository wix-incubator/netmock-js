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

declare type CallBack = (res: any) => void;

type NetmockSettings = {
  allowRealNetwork: boolean | RegExp;
  suppressQueryParamsInUrlWarnings: boolean;
};
type ResponseObject = {
  headers: object,
  location: string,
  statusCode: number,
  once: () => void,
  write: (text: Buffer) => void,
  pipe: () => any,
};

type HttpRequest = import('http').ClientRequestArgs & { query?: string, body?: any, search?: string };
type HttpResponse = import('NetmockResponseType').NetmockResponseType<string | object> | string | object;
