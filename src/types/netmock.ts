import { Desk } from '../classes/desk';
import { Settings } from '../classes/settings';

export interface Netmock {
  mock: Desk,
  settings: Settings,
  spy: any
  cleanup: () => void
  destroy: () => void
}
