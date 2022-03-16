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

export interface NetmockResponse {
  status: number
  delay: number,
  statusText?: string,
  headers?: { [key: string]: string },
}
