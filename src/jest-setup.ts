/* eslint-disable import/no-extraneous-dependencies */
import { httpRequest } from './mockHttpModule';

let axios: typeof import('axios') | undefined;
try {
  axios = require('axios');
} catch {
  //
}

// let actualAxios: any;
// jest.doMock('axios', () => {
//   if (!actualAxios) {
//     actualAxios = jest.requireActual('axios');
//   }
//   return actualAxios;
// }, { virtual: true });
// require('axios').defaults.adapter = require('./axios-fetch-adapter').default;

let actualHttps: any;
jest.doMock('https', () => {
  if (!actualHttps) {
    actualHttps = jest.requireActual('https');
  }
  return {
    ...actualHttps,
    request: (config: any) => httpRequest(config),
  };
}, { virtual: true });
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
