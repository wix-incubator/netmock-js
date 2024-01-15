/* eslint-disable import/no-extraneous-dependencies */
let axios: typeof import('axios') | undefined;
try {
  axios = require('axios');
} catch {
  //
}

let actualHttps: any;
jest.doMock('https', () => {
  if (!actualHttps) {
    actualHttps = jest.requireActual('https');
  }
  return {
    ...actualHttps,
    request: (...params: any[]) => {
      console.log(`params: ${JSON.stringify(params)}`);
      return actualHttps.request(...params);
    },
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
