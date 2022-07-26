import 'isomorphic-fetch';
import { reset } from './mockedEndpointsService';
import { allowRealNetwork } from './settings';
import { overrideFetch } from './overrideFetch';

beforeEach(() => {
  require('axios').defaults.adapter = require('./axios-fetch-adapter').default;

  overrideFetch();
  allowRealNetwork(false);
});

afterEach(() => {
  reset();
});
