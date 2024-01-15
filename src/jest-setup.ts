/* eslint-disable import/no-extraneous-dependencies */

import { httpRequest } from './mockHttpModule';

require('https').request = (config: any) => httpRequest(config);
require('http').request = (config: any) => httpRequest(config);

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
