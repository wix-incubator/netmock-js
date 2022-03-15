import { Singleton } from '../utils/singleton';

export class Settings {
  private allowNetworkRequests = false;

  get isNetworkDisabled() {
    return !this.allowNetworkRequests;
  }

  disableNetwork() {
    this.allowNetworkRequests = false;
  }

  enableNetwork() {
    this.allowNetworkRequests = true;
  }

  restore() {
    this.allowNetworkRequests = false;
  }
}

const SettingsSingleton = Singleton(() => new Settings());
export const settings = () => SettingsSingleton.getInstance();
