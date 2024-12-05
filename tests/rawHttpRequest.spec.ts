import http from 'http';
import https from 'https';

describe('Netmock with Node.js HTTP', () => {
  let netmock: typeof import('../src').netmock;
  let reply: typeof import('../src').reply;

  beforeEach(() => {
    netmock = require('netmock-js').netmock;
    reply = require('netmock-js').reply;
  });

  function makeHttpRequest(
    options: HttpRequest,
    body: string | null = null,
  ): Promise<{ status: number; headers: http.IncomingHttpHeaders; data: string }> {
    const protocol = options.protocol === 'https:' ? https : http;

    return new Promise((resolve, reject) => {
      const req = protocol.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => resolve({ status: res.statusCode || 0, headers: res.headers, data }));
      });

      req.on('error', reject);

      if (body) {
        req.write(body);
      }

      req.end();
    });
  }

  describe('Edge Cases', () => {
    it('should handle different HTTP methods', async () => {
      netmock.post('http://example.com/post', () => reply('Post Response'));
      netmock.put('http://example.com/put', () => reply('Put Response'));
      netmock.delete('http://example.com/delete', () => reply('Delete Response'));

      const postResponse = await makeHttpRequest({
        hostname: 'example.com',
        path: '/post',
        method: 'POST',
      });

      expect(postResponse.data).toBe('Post Response');

      // Testing PUT
      const putResponse = await makeHttpRequest({
        hostname: 'example.com',
        path: '/put',
        method: 'PUT',
      });
      expect(putResponse.data).toBe('Put Response');

      // Testing DELETE
      const deleteResponse = await makeHttpRequest({
        hostname: 'example.com',
        path: '/delete',
        method: 'DELETE',
      });
      expect(deleteResponse.data).toBe('Delete Response');
    });

    it('should mock response headers and status codes', async () => {
      netmock.get('http://example.com/custom', () => reply('Custom Response').set({
        status: 207,
        headers: { 'content-type': 'text/custom' },
      }));

      const response = await makeHttpRequest({
        hostname: 'example.com',
        path: '/custom',
        method: 'GET',
      });

      console.log('response:', response);
      expect(response.status).toBe(207);
      expect(response.headers['content-type']).toBe('text/custom');
      expect(response.data).toBe('Custom Response');
    });

    it('should handle multiple sequential calls with unique responses', async () => {
      netmock.get('http://example.com/sequence', (req, data) => reply(`Response ${data.callCount}`));

      const firstResponse = await makeHttpRequest({
        hostname: 'example.com',
        path: '/sequence',
        method: 'GET',
      });
      expect(firstResponse.data).toBe('Response 0');

      const secondResponse = await makeHttpRequest({
        hostname: 'example.com',
        path: '/sequence',
        method: 'GET',
      });
      expect(secondResponse.data).toBe('Response 1');
    });

    it('should mock a request url with params', async () => {
      netmock.get('http://wix.com/:id', (req) => `ID: ${req.params.id}`);

      const response = await makeHttpRequest({
        protocol: 'http:',
        hostname: 'wix.com',
        path: '/123',
        method: 'GET',
      });

      expect(response.data).toBe('ID: 123');
    });

    it('should mock a request URL with one param in the middle', async () => {
      netmock.get('http://wix.com/user/:id/photo', (req) => {
        expect(req.params.id).toEqual('5');
        return `Photo of user ${req.params.id}`;
      });

      const response = await makeHttpRequest({
        hostname: 'wix.com',
        path: '/user/5/photo',
        method: 'GET',
      });

      expect(response.data).toBe('Photo of user 5');
    });

    it('should mock a request with query', async () => {
      netmock.get('https://wix.com', (req) => {
        console.log('inside query:', req);
        if (req.query.blamos) {
          return 'blamos!';
        }
        return 'not blamos';
      });

      const responseWithQuery = await makeHttpRequest({
        protocol: 'https:',
        hostname: 'wix.com',
        path: '/',
        search: '?blamos=true',
        method: 'GET',
      });

      expect(responseWithQuery.data).toEqual('blamos!');

      const responseWithoutQuery = await makeHttpRequest({
        protocol: 'https:',
        hostname: 'wix.com',
        path: '/',
        method: 'GET',
      });

      expect(responseWithoutQuery.data).toEqual('not blamos');
    });
  });
});
