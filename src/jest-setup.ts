import 'isomorphic-fetch';
import { reset } from './mockedEndpointsService';
import { allowRealNetwork } from './settings';
import { overrideFetch } from './overrideFetch';

beforeEach(() => {
  require('axios').defaults.adapter = require('@vespaiach/axios-fetch-adapter').default;

  overrideFetch();
  allowRealNetwork(false);
});

afterEach(() => {
  reset();
});
