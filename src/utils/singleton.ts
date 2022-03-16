import { Singleton } from '../types/singleton';

/**
 * Generate a singleton object for T instance.
 * @param {<T>() => T} creator A create new instance function.
 * @return {<T>Singleton<T>} A T instance singleton object.
 */
export function singletonize<T>(creator: () => T): Singleton<T> {
  let instance: T;

  return {
    getInstance() {
      if (!instance) {
        instance = creator();
      }
      return instance;
    },
  };
}
