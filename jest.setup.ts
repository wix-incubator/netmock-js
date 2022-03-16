import 'isomorphic-fetch';
import netmock from './index';

afterEach(netmock.cleanup);

afterAll(netmock.destroy);
