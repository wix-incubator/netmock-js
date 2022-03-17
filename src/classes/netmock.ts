import { desk } from './desk';
import { settings } from './settings';
import { cleanup, destroy } from '../utils/lifecycle';

export default {
  mock: desk(),
  settings: settings(),
  spy: {},
  cleanup: cleanup,
  destroy: destroy,
};
