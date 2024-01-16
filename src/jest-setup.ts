/* eslint-disable import/no-extraneous-dependencies */
import { ClientRequestArgs } from 'http';
import { httpRequest } from './mockHttpModule';

// @ts-ignore
global.originalHttps = jest.requireActual('https');
// @ts-ignore
global.originalHttp = jest.requireActual('http');
jest.doMock('https', () => ({
  ...jest.requireActual('https'),
  request: (request: ClientRequestArgs, cb: CallBack) => httpRequest(request, cb, true),
}));
jest.doMock('http', () => ({
  ...jest.requireActual('http'),
  request: (request: ClientRequestArgs, cb: CallBack) => httpRequest(request, cb, false),
}));
// require('https').request = (config: any) => httpRequest(config);
// require('http').request = (config: any) => httpRequest(config);

beforeEach(() => {
  require('isomorphic-fetch');
  const { configure } = require('./settings');
  // const { overrideFetch } = require('./overrideFetch');
  // overrideFetch();
  configure({ allowRealNetwork: false });
});

afterEach(() => {
  require('./mockedEndpointsService').reset();
});
