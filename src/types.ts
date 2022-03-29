export type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';
export interface NetmockRequest extends Request {
  query: { [key: string]: string },
  params: { [key: string]: string },
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
export type MockedEndpointHandler<T = any> = (req: NetmockRequest) => T | NetmockResponseType<T>;

export type MockedEndpointMetaData = {
  calls: Parameters<MockedEndpointHandler>[]
};
export interface MockedEndpoint<T = any> {
  key: string,
  handler: MockedEndpointHandler<T>,
  metadata: MockedEndpointMetaData,
  urlRegex: RegExp,
}

export type MockedUrl = string | RegExp;
export interface Netmock {
  get: (url: MockedUrl, handler: MockedEndpointHandler) => void;
  post: (url: MockedUrl, handler: MockedEndpointHandler) => void;
  put: (url: MockedUrl, handler: MockedEndpointHandler) => void;
  patch: (url: MockedUrl, handler: MockedEndpointHandler) => void;
  delete: (url: MockedUrl, handler: MockedEndpointHandler) => void;
}

export type Headers = { [key: string]: string };
