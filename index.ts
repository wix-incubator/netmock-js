import { Netmock } from './src/types/netmock';
import { desk } from './src/classes/desk';
import { settings } from './src/classes/settings';

const netmock: Netmock = {
  mock: desk(),
  settings: settings(),
  spy: {},
  cleanup: () => {
    desk().cleanup();
    settings().restore();
  },
  destroy: () => {
    desk().destroy();
    settings().restore();
  },
};

export default netmock;
