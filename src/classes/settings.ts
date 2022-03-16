import { singletonize } from '../utils/singleton';

/**
 * the settings class provides an api to modify Netmock settings.
 */
export class Settings {
  private allowNetworkRequests = false;

  /**
   * True if unmocked network traffic in allowed,
   * False otherwise.
   */
  get isNetworkDisabled(): boolean {
    return !this.allowNetworkRequests;
  }

  /**
   * Disable unmocked network traffic.
   */
  disableNetwork() {
    this.allowNetworkRequests = false;
  }

  /**
   * Enable unmocked network traffic.
   */
  enableNetwork() {
    this.allowNetworkRequests = true;
  }

  /**
   * Restore Netmock settings to default.
   */
  restore() {
    this.allowNetworkRequests = false;
  }
}

const SettingsSingleton = singletonize(() => new Settings());
export const settings = () => SettingsSingleton.getInstance();
