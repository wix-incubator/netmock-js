export enum Method {
  get = 'get',
  post = 'post',
}

export interface NetmockRequest extends Request {
  query: { [key: string]: string },
  params: { [key: string]: string },
}
