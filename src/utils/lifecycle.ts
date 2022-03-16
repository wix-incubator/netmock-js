import { desk } from '../classes/desk';
import { settings } from '../classes/settings';

export function cleanup() {
  desk().cleanup();
  settings().restore();
}

export function destroy() {
  desk().destroy();
  settings().restore();
}
