describe('Parse Tests', () => {
  const module = require('../src/utils/extract');

  describe('Extract Method Tests', () => {
    const uut = module.extractMethod;

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

  describe('Extract Key from Input Tests', () => {
    const uut = module.extractKeyFromInput;

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

  describe('Extract Params Names from Input Tests', () => {
    const uut = module.extractParamsNamesFromInput;

    it('should get one param name at the end of the url', () => {
      const input = 'https://wix.com/:id';
      const params = uut(input);

      expect(params).toEqual(['id']);
    });

    it('should get one param name at the end of the url with trailing slash', () => {
      const input = 'https://wix.com/:id/';
      const params = uut(input);

      expect(params).toEqual(['id']);
    });

    it('should get one param name at the middle of the url', () => {
      const input = 'https://wix.com/system/user/:id/photo';
      const params = uut(input);

      expect(params).toEqual(['id']);
    });

    it('should get one param name at the middle of the url with trailing slash', () => {
      const input = 'https://wix.com/system/user/:id/photo/profile/';
      const params = uut(input);

      expect(params).toEqual(['id']);
    });

    it('should get two param names from the url', () => {
      const input = 'https://wix.com/:id/test/:phone';
      const params = uut(input);

      expect(params).toEqual(['id', 'phone']);
    });
  });

  describe('Extract Params from Input and Interceptor Tests', () => {
    const uut = module.extractParamsFromUrlAndInterceptor;

    it('should get one param at the end of the url', () => {
      const interceptor = { key: 'https://wix.com/:id/', paramsNames: ['id'] };
      const input = 'https://wix.com/3';
      const params = uut(input, interceptor);

      expect(params).toEqual({ id: '3' });
    });

    it('should get one param at the end of the url with trailing slash', () => {
      const interceptor = { key: 'https://wix.com/:id/', paramsNames: ['id'] };
      const input = 'https://wix.com/3/';
      const params = uut(input, interceptor);

      expect(params).toEqual({ id: '3' });
    });

    it('should get one param at the middle of the url', () => {
      const interceptor = { key: 'https://wix.com/system/user/:id/photo/', paramsNames: ['id'] };
      const input = 'https://wix.com/system/user/3/photo/';

      const params = uut(input, interceptor);

      expect(params).toEqual({ id: '3' });
    });

    it('should get two params from the url', () => {
      const interceptor = { key: 'https://wix.com/:id/test/:phone/', paramsNames: ['id', 'phone'] };
      const input = 'https://wix.com/3/test/0000/';

      const params = uut(input, interceptor);

      expect(params).toEqual({ id: '3', phone: '0000' });
    });
  });
});
