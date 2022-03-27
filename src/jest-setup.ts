import 'isomorphic-fetch';
import { reset } from './mockedEndpointsService';
import { allowRealNetwork } from './settings';
import { overrideFetch } from './overrideFetch';

beforeEach(() => {
  overrideFetch();
  allowRealNetwork(false);
});

afterEach(() => {
  reset();
});
