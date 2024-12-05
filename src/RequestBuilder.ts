import { NetmockResponseType } from './types';

export class MockHttpRequestBuilder {
  private result: any;
  public body: string = '';
  public mockedResponse: HttpResponse;
  private error?: Error;
  private callback?: CallBack; // Callback to allow modification

  // Class members for overrideable behaviors
  public on: (eventName: string, onCallback: CallBack) => any = async (eventName, onCallback) => {
    if (['error', 'abort', 'aborted'].includes(eventName) && !this.callback) {
      onCallback(this.error);
      return this.error;
    }

    let onReturnValue: any;
    if (eventName === 'data') {
      onReturnValue = this.getResBuffer(this.mockedResponse);
    } else if (eventName === 'response') {
      onReturnValue = this.result;
    } else {
      onReturnValue = null;
    }

    if (!['aborted', 'error', 'abort', 'connect', 'socket', 'timeout'].includes(eventName)) {
      setTimeout(() => {
        onCallback(onReturnValue);
      }, 0);
      return onReturnValue;
    }

    return null;
  };

  public end: () => void = () => { };

  public destroy: () => void = () => {};

  constructor(initialResponse: Partial<ResponseObject>) {
    this.result = {
      ...initialResponse,
      statusCode: 200,
      once: () => {},
      removeListener: () => {},
      write: (text: Buffer, encoding: BufferEncoding = 'utf8', callback?: () => void) => {
        this.body = text.toString(encoding);
        if (callback) {
          callback();
        }
      },
      pipe: () => this.getResBuffer(this.mockedResponse),
    };
  }

  setStatusCode(code: number): this {
    this.result.statusCode = code;
    return this;
  }

  setStatusMessage(message?: string): this {
    this.result.statusMessage = message;
    return this;
  }

  setHeaders(headers: Record<string, string>): this {
    this.result.headers = { ...this.result.headers, ...headers };
    return this;
  }

  setBody(body: string): this {
    this.body = body;
    return this;
  }

  addParams(params: Record<string, any>): this {
    this.result = { ...this.result, ...params };
    return this;
  }

  setData(data: any): this {
    this.result.data = data;
    return this;
  }

  setErrorMessage(error: Error): this {
    this.error = error;
    return this;
  }

  setOn(customOn: (eventName: string, onCallback: CallBack) => any): this {
    this.on = customOn;
    return this;
  }

  setEnd(end: () => void): this {
    this.end = end;
    return this;
  }

  setCallback(cb?: CallBack): this {
    this.callback = cb;
    return this;
  }

  appendBody(chunk: Buffer): this {
    this.body += chunk.toString('utf8');
    this.result.data = this.body;
    return this;
  }

  getResBuffer(res: any) {
    return Buffer.from(
      (res?.__isNetmockResponse
        ? (res as NetmockResponseType<string>).stringifyBody()
        : res.toString()) || '',
    );
  }

  build(): ResponseObject {
    return {
      ...this.result,
      on: (eventName: string, onCallback: CallBack) => {
        this.on(eventName, onCallback);
      },
      end: this.end,
      destroy: this.destroy,
    };
  }
}
