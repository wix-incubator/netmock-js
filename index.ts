import { DeskSingleton } from './src/classes/desk';
import { Netmock } from './src/types/netmock';

const netmock: Netmock = {
  mock: DeskSingleton.getInstance(),
  spy: {},
};

export default netmock;
