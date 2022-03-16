import { Netmock } from './src/types/netmock';
import { desk } from './src/classes/desk';
import { settings } from './src/classes/settings';
import { cleanup, destroy } from './src/utils/lifecycle';

const netmock: Netmock = {
  mock: desk(),
  settings: settings(),
  spy: {},
  cleanup: cleanup,
  destroy: destroy,
};

export default netmock;
