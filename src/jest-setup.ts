import 'isomorphic-fetch';
import { reset } from './mockedEndpointsService';
import { allowRealNetwork } from './settings';
import { overrideFetch } from './overrideFetch';

// make sure that axios is a singleton
let actualAxios: any;
jest.doMock('axios', () => {
  if (!actualAxios) {
    actualAxios = jest.requireActual('axios');
  }
  return actualAxios;
}, { virtual: true });

beforeEach(() => {
  overrideFetch();
  allowRealNetwork(false);
  try {
    require('axios').defaults.adapter = require('./axios-fetch-adapter').default;
  } catch {
    // no need to do anythinng if axios isn't available.
  }
});

afterEach(() => {
  reset();
});
