describe('Parse Tests', () => {
  const utils = require('../src/utils') as typeof import('../src/utils');
  describe('Get mocked endpoint key', () => {
    it('should get key from url string', () => {
      const url = 'https://google.com';
      const key = utils.getMockedEndpointKey(url);

      expect(key).toBe('https://google.com');
    });

    it('should ignore trailing slash', () => {
      const url = 'https://google.com/';
      const key = utils.getMockedEndpointKey(url);

      expect(key).toBe('https://google.com');
    });

    it('should remove url query', () => {
      const url = 'https://google.com/blamos?query=true';
      const key = utils.getMockedEndpointKey(url);

      expect(key).toBe('https://google.com/blamos');
    });
  });
  describe('Get  Request Tests', () => {
    it('should get the default method (get)', () => {
      const input = 'https://wix.com';
      const init = undefined;
      const method = utils.getRequestMethod(input, init);

      expect(method).toBe('get');
    });

    it('should get method from input object', () => {
      const input = { method: 'POST' } as RequestInfo;
      const init = undefined;
      const method = utils.getRequestMethod(input, init);

      expect(method).toBe('post');
    });

    it('should get method from input object', () => {
      const input = { method: 'POST' } as RequestInfo;
      const init = { method: 'DELETE' };
      const method = utils.getRequestMethod(input, init);

      expect(method).toBe('post');
    });

    it('should get method from init object', () => {
      const input = 'https://wix.com';
      const init = { method: 'POST' };
      const method = utils.getRequestMethod(input, init);

      expect(method).toBe('post');
    });
  });
  describe('Convert url to regex', () => {
    it('should convert url with on param to regex', () => {
      const urlRegex1 = utils.convertUrlToRegex('https://www.wix.com');
      const urlRegex2 = utils.convertUrlToRegex('https://www.wix.com/');
      expect(urlRegex1.test('https://www.wix.com')).toEqual(true);
      expect(urlRegex1.test('https://www.wix.com/')).toEqual(true);
      expect(urlRegex2.test('https://www.wix.com/')).toEqual(true);
      expect(urlRegex2.test('https://www.wix.com')).toEqual(true);
      expect(urlRegex1.test('https://www.wix.com/nir')).toEqual(false);
      expect(urlRegex2.test('https://www.wix.com/nir')).toEqual(false);
    });
    it('should convert url with one param to regex', () => {
      const urlRegex = utils.convertUrlToRegex('https://www.wix.com/:first');
      expect('https://www.wix.com/niryo'.match(urlRegex)?.groups).toEqual({ first: 'niryo' });
      expect('https://www.wix.com/niryo/'.match(urlRegex)?.groups).toEqual({ first: 'niryo' });
      expect(urlRegex.test('https://www.wix.com/niryo/blamos')).toEqual(false);
    });
    it('should convert url with two params to regex', () => {
      const urlRegex = utils.convertUrlToRegex('https://www.wix.com/:first/:second');
      expect('https://www.wix.com/niryo/blamos'.match(urlRegex)?.groups).toEqual({ first: 'niryo', second: 'blamos' });
      expect(urlRegex.test('https://www.wix.com/niryo')).toEqual(false);
      expect(urlRegex.test('https://www.wix.com/niryo/')).toEqual(false);
      expect(urlRegex.test('https://www.wix.com/niryo/blamos/vil')).toEqual(false);
    });
    it('should convert url with two not following params to regex', () => {
      const urlRegex = utils.convertUrlToRegex('https://www.wix.com/:first/wow/:second/');
      expect('https://www.wix.com/niryo/wow/blamos'.match(urlRegex)?.groups).toEqual(
        { first: 'niryo', second: 'blamos' },
      );
      expect(urlRegex.test('https://www.wix.com/niryo/test/blamos')).toEqual(false);
      expect(urlRegex.test('https://www.wix.com/niryo/blamos')).toEqual(false);
    });
  });
});
