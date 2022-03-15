import { Netmock } from '../src/types/netmock';
import { NetmockRequest } from '../src/types/base';

describe('Interceptors Tests', () => {
  let netmock: Netmock;

  beforeEach(() => {
    netmock = require('..').default;
  });

  describe('Interceptors Handler Functions Tests', () => {
    describe('Response Body', () => {
      it('should mock a string response body', async () => {
        netmock.mock.get('https://wix.com', (_: Request) => 'Mocked Text');

        const res = await fetch('https://wix.com');
        const body = await res.text();

        expect(body).toBe('Mocked Text');
      });

      it('should mock a number response body', async () => {
        netmock.mock.get('https://wix.com', (_: Request) => 5);

        const res = await fetch('https://wix.com');
        const body = await res.text();

        expect(body).toBe('5');
      });

      it('should mock a json response body', async () => {
        netmock.mock.get('https://wix.com', (_: NetmockRequest) => ({ mocked: true }));

        const res = await fetch('https://wix.com');
        const body = await res.json();

        expect(body).toEqual({ mocked: true });
      });
    });

    describe('Request Params', () => {
      it('should mock a request url with params', async () => {
        netmock.mock.get('https://wix.com/:id', (req: NetmockRequest) => {
          if (req.params.id === '5') {
            return 'Bingo!';
          }
          return 'No luck...';
        });

        const resBingo = await fetch('https://wix.com/5');
        const bodyBingo = await resBingo.text();

        const resRegular = await fetch('https://wix.com/3');
        const bodyRegular = await resRegular.text();

        expect(bodyBingo).toBe('Bingo!');
        expect(bodyRegular).toBe('No luck...');
      });

      it('should mock a request url with one param in the middle', async () => {
        netmock.mock.get('https://wix.com/user/:id/photo', (req: NetmockRequest) => {
          if (req.params.id === '5') {
            return 'Bingo!';
          }
          return 'No luck...';
        });

        const res = await fetch('https://wix.com/user/5/photo');
        const body = await res.text();

        expect(body).toBe('Bingo!');
      });

      it.skip('should mock a request url with two params', async () => { // TODO
        netmock.mock.get('https://wix.com/:id/:name', (req: NetmockRequest) => {
          if (req.params.id === '5' && req.params.name === 'Peter Parker') {
            return 'Bingo!';
          }
          return 'No luck...';
        });

        const res = await fetch('https://wix.com/5/Peter Parker');
        const body = await res.text();

        expect(body).toBe('Bingo!');
      });

      it('should mock a request with query', async () => {
        netmock.mock.get('https://wix.com', (req: NetmockRequest) => {
          if (req.query.mock) {
            return 'Im a mock!';
          }
          return 'Im a regular response';
        });

        const resMock = await fetch('https://wix.com?mock=true');
        const bodyMock = await resMock.text();

        const resRegular = await fetch('https://wix.com');
        const bodyRegular = await resRegular.text();

        expect(bodyMock).toBe('Im a mock!');
        expect(bodyRegular).toBe('Im a regular response');
      });

      it('should use a request query in response', async () => {
        netmock.mock.get('https://wix.com', (req: NetmockRequest) => {
          if (Object.keys(req.query).length > 0) {
            return req.query;
          }
          return null;
        });

        const res = await fetch('https://wix.com?firstName=Scarlet&lastName=Johansson');
        const body = await res.json();

        expect(body).toEqual({ firstName: 'Scarlet', lastName: 'Johansson' });
      });
    });

    it('should mock a request with status code', async () => { // TODO
    });
  });

  describe('Interceptors Match Tests', () => {
  });

  describe('Interceptors Methods Tests', () => {

  });
});
