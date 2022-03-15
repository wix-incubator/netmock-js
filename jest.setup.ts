import { DeskSingleton } from './src/classes/desk';

require('isomorphic-fetch');

afterEach(() => {
  DeskSingleton.getInstance().cleanup();
});

afterAll(() => {
  DeskSingleton.getInstance().destroy();
});
