require('axios').defaults.adapter = require('./axios-fetch-adapter').default;

beforeEach(() => {
  require('isomorphic-fetch');
  // make sure that axios is a singleton
  let actualAxios: any;
  jest.doMock('axios', () => {
    if (!actualAxios) {
      actualAxios = jest.requireActual('axios');
    }
    return actualAxios;
  }, { virtual: true });
  const { allowRealNetwork } = require('./settings');
  const { overrideFetch } = require('./overrideFetch');
  overrideFetch();
  allowRealNetwork(false);
});

afterEach(() => {
  require('./mockedEndpointsService').reset();
});
