export type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';
export interface NetmockRequest {
  raRequest: Request;
  headers: { [key: string]: string };
  query: { [key: string]: string };
  params: { [key: string]: string };
  body?: string;
}
export interface NetmockResponseFields<T = any> {
  body: T | undefined
  status: number
  delay: number,
  statusText?: string,
  headers?: { [key: string]: string },
}

export type NetmockResponseParams = Omit<NetmockResponseFields, 'body'>;

export interface NetmockResponseType<Body> {
  delay: (value: number) => NetmockResponseType<Body>;
  statusCode: (value: number) => NetmockResponseType<Body>;
  headers: (value: Headers) => NetmockResponseType<Body>;
  set: (value: Partial<NetmockResponseFields>) => NetmockResponseType<Body>;
  stringifyBody: () => string;
  getResponseParams: () => NetmockResponseParams;
}
export type MockedEndpointHandler<T = any> = (req: NetmockRequest, data: { callCount: number }) => T | NetmockResponseType<T>;

export type MockedEndpointMetaData = {
  calls: Parameters<MockedEndpointHandler>[]
};
export interface MockedEndpoint<T = any> {
  key: string,
  handler: MockedEndpointHandler<T>,
  metadata: MockedEndpointMetaData,
  urlRegex: RegExp,
  stackTrace: string;
}

export type MockedUrl = string | RegExp;
export interface Netmock {
  get: (url: MockedUrl, handler: MockedEndpointHandler) => NetlogAPI;
  post: (url: MockedUrl, handler: MockedEndpointHandler) => NetlogAPI;
  put: (url: MockedUrl, handler: MockedEndpointHandler) => NetlogAPI;
  patch: (url: MockedUrl, handler: MockedEndpointHandler) => NetlogAPI;
  delete: (url: MockedUrl, handler: MockedEndpointHandler) => NetlogAPI;
}
export type NetlogAPI = {
  callCount: () => number;
  getRequest: (index: number) => NetmockRequest;
};

export type Headers = { [key: string]: string };
