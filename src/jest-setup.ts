// make sure that axios is a singleton in the system
let actualAxios: any;
jest.doMock('axios', () => {
  if (!actualAxios) {
    actualAxios = jest.requireActual('axios');
  }
  return actualAxios;
}, { virtual: true });
require('axios').defaults.adapter = require('./axios-fetch-adapter').default;

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
