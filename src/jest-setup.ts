/* eslint-disable import/no-extraneous-dependencies */

import { httpRequest } from './mockHttpModule';

console.log('mocking http');
jest.doMock('https', () => {
  return {
    ...jest.requireActual('https'),
    request: (config: any) => httpRequest(config),
  };
});
jest.doMock('http', () => {
  return {
    ...jest.requireActual('http'),
    request: (config: any) => httpRequest(config),
  };
});
// require('https').request = (config: any) => httpRequest(config);
// require('http').request = (config: any) => httpRequest(config);

beforeEach(() => {
  require('isomorphic-fetch');
  const { configure } = require('./settings');
  const { overrideFetch } = require('./overrideFetch');
  overrideFetch();
  configure({ allowRealNetwork: false });
});

afterEach(() => {
  require('./mockedEndpointsService').reset();
});
