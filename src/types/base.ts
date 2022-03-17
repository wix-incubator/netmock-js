export enum Method {
  get = 'get',
  post = 'post',
  put = 'put',
  patch = 'patch',
  delete = 'delete',
}

export interface NetmockRequest extends Request {
  query: { [key: string]: string },
  params: { [key: string]: string },
}

export interface NetmockResponse<T = any> {
  body: T | null
  status: number
  delay: number,
  statusText?: string,
  headers?: { [key: string]: string },
}

export type NetmockResponseParams = Omit<NetmockResponse, 'body'>;
