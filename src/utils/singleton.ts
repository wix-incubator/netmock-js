export function Singleton<T>(creator: () => T) {
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
