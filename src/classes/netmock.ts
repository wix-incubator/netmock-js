import { desk } from './desk';
import { settings } from './settings';
import { cleanup, destroy } from '../utils/lifecycle';

/**
 * Netmock main instance.
 * This instance is an object containing relevant classes and methods.
 */
export default {
  mock: desk(),
  settings: settings(),
  spy: {},
  cleanup: cleanup,
  destroy: destroy,
};
