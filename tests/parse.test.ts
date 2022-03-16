describe('Parse Tests', () => {
  const module = require('../src/utils/parse');

  describe('End String with Slash Tests', () => {
    const uut = module.endStringWithSlash;

    it('should add slash to a string that doesnt ends with slash', () => {
      const url = 'https://wix.com';
      const key = uut(url);

      expect(key).toBe('https://wix.com/');
    });

    it('should not add an extra slash to a string that ends with slash', () => {
      const url = 'https://wix.com/';
      const key = uut(url);

      expect(key).toBe('https://wix.com/');
    });
  });
});
