describe('Parse Tests', () => {
  const module = require('../src/utils/parse');

  describe('Get Key From Input Tests', () => {
    const uut = module.getKeyFromInput;

    it('should get key from url string', () => {
      const url = 'https://google.com';
      const key = uut(url);

      expect(key).toBe('https://google.com/');
    });

    it('should get key from url string', () => {
      const url = 'https://google.com/';
      const key = uut(url);

      expect(key).toBe('https://google.com/');
    });

    it('should get key from url string', () => {
      const url = 'https://google.com?query=true';
      const key = uut(url);

      expect(key).toBe('https://google.com/');
    });
  });

  describe('Get Params from Input Tests', () => {
    const uut = module.getParamsNamesFromInput;

    it('should get one param at the end of the url', () => {
      const input = 'https://wix.com/:id';
      const params = uut(input);

      expect(params).toEqual(['id']);
    });

    it('should get one param at the end of the url with trailing slash', () => {
      const input = 'https://wix.com/:id/';
      const params = uut(input);

      expect(params).toEqual(['id']);
    });

    it('should get one param at the middle of the url', () => {
      const input = 'https://wix.com/system/user/:id/photo';
      const params = uut(input);

      expect(params).toEqual(['id']);
    });

    it('should get one param at the middle of the url with trailing slash', () => {
      const input = 'https://wix.com/system/user/:id/photo/profile/';
      const params = uut(input);

      expect(params).toEqual(['id']);
    });

    it('should get two param from the url', () => {
      const input = 'https://wix.com/:id/test/:phone';
      const params = uut(input);

      expect(params).toEqual(['id', 'phone']);
    });
  });

  describe('Get Method Tests', () => {
    const uut = module.getMethod;

    it('should get the default method (get)', () => {
      const input = 'https://wix.com';
      const init = undefined;
      const method = uut(input, init);

      expect(method).toBe('get');
    });

    it('should get method from input object', () => {
      const input = { method: 'POST' };
      const init = undefined;
      const method = uut(input, init);

      expect(method).toBe('post');
    });

    it('should get method from input object', () => {
      const input = { method: 'POST' };
      const init = { method: 'DELETE' };
      const method = uut(input, init);

      expect(method).toBe('post');
    });

    it('should get method from init object', () => {
      const input = 'https://wix.com';
      const init = { method: 'POST' };
      const method = uut(input, init);

      expect(method).toBe('post');
    });
  });
});
