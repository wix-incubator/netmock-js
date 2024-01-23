import { ClientRequestArgs } from 'http';
import { httpRequest } from './mockHttpModule';

global.originalHttps = jest.requireActual('https');
global.originalHttp = jest.requireActual('http');
jest.doMock('https', () => ({
  ...jest.requireActual('https'),
  request: (request: ClientRequestArgs, cb: CallBack) => httpRequest(request, cb, true),
}));
jest.doMock('http', () => ({
  ...jest.requireActual('http'),
  request: (request: ClientRequestArgs, cb: CallBack) => httpRequest(request, cb, false),
}));

beforeEach(() => {
  const realFetch = jest.requireActual('node-fetch');
  // @ts-ignore
  global.fetch = realFetch;
  // @ts-ignore
  global.Response = realFetch.Response;
  // @ts-ignore
  global.Headers = realFetch.Headers;
  // @ts-ignore
  global.Request = realFetch.Request;
  const { configure } = require('./settings');
  configure({ allowRealNetwork: false });
});

afterEach(() => {
  require('./mockedEndpointsService').reset();
});
