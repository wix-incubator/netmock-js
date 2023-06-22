# netmock
A javascript network mocker for tests

### Installation
`npm install --save-dev netmock-js`

### Usage
```javascript
  import {netmock} from 'netmock-js';
  // mock some endpoint:
  netmock.post('https://wix.com', () => 'Mocked Text');
  
  // now calling fetch or axios on this endpoint will return the mocked body:
  const res = await fetch('https://wix.com', { method: 'POST' });
  const body = await res.text();
  expect(body).toBe('Mocked Text');
```

### Setup
Add this to your jest config:
```javascript
{
  "setupFilesAfterEnv": ['node_modules/netmock-js/lib/jest-setup.js']
}
```
### API
#### **netmock[method](url, handler): Netlog**
The netmock object allows you to mock the following http method types: `get/post/put/patch/delete`.
The returned object can be used for doing some assertions about the mocked endpoint (Read the section about `netlog`)

params:
 * *url*: string | route | RegExp
  
      ```javascript
      netmock.get('https://wix.com/get/some/value', () => {}) // plain url
      netmock.get(/.*wix/, () => {}) // regex
      netmock.post('https://wix.com/bookings/:user/:id', () => {}) // route
      netmock.get('https://wix.com/get/some/value', (req, data) => ({responseNumber: data.callCount})) // different responses
      
      //using the returned endpoint log:
      const log = netmock.get('https://wix.com/get/some/value', () => {}) // plain url
      expect(log.callCount()).toEqual(0);
      ```
    In case of mock collisions, netmock will prefer plain url matching over regex matching over rout matching
 * *handler*: ({query, params}) => responseBody
   
   ```javascript
   netmock.get('https://wix.com/get/some/value', () => ({id: 'mocked-id'})); // returning body
   netmock.post('https://wix.com/get/:id', (req) => ({id: req.params.id})); // using url params
   netmock.get('https://wix.com/get', (req) => ({id: req.query.id})); // using query params (when called like this: https://wix.com/get?id=mockedId)
   ```
  
#### **resp(body: any) => NetmockResponse**
In cases where you need to tweak the response parameters, for example the statusCode, your handler should return a response object like this:
```javascript
   import {netmock, resp} from 'netmock-js';
   netmock.get('https://wix.com', () => resp({id: 'mocked-id'}).statusCode(400).delay(100));
```

Here is the NetmockResponse object API:

*  statusCode(value: number); // set the response status
*  headers: (value: object); // set the response header
*  delay(delayInMs: number); // simulate response delay
*  set: (set: (value: Partial<NetmockResponse>)); //a convenient function for setting multiple response fields at once

#### **netlog(method, url) => ProbObject**
A function that allows you to access the logs of a certain endpoint and do some assertions on them.

params:
* *method: string* - The http method of the mocked endpoint (post, get, put, patch, delete);
* *url: string | route | regex* - The url of the mocked endpoint;

It returns and object with the following methods:
* *callCount()* - returns the number of times the endpoint has been called.
* *getRequest(index: number)* - returns the request object for the given call number.

usage:
```javascript
    import {netlog} from 'netmock-js';
    const mockedEndpointUrl = 'https://www.wix.com/:id/:user';
    netmock.post(mockedEndpointUrl, () => ({}));
    await fetch('https://www.wix.com/123/blamos', { method: 'post' }); //trigger call 1
    await fetch('https://www.wix.com/456/blamos2?value=true', { method: 'post' }); //trigger call 2
    expect(netlog('post', mockedEndpointUrl).callCount()).toEqual(2);
    expect(netlog('post', mockedEndpointUrl).getRequest(0).params).toEqual({ id: '123', user: 'blamos' });
    expect(netlog('post', mockedEndpointUrl).getRequest(1).query).toEqual({ value: 'true'});
```

### Using with axios:
Netmock attempts to automatically detect if you are using Axios and applies the relevant mocks for you. However, if you have multiple instances of Axios in your `node_modules`, you need to explicitly specify which Axios instance netmock should mock:
```javascript
//inside jest-setup file:
import {mockAxios} from 'netmock-js';
beforeEach(() => {
   mockAxios(require('axios'));
});

```
### Configurations:
#### **allowRealNetwork: boolean | RegExp**
Netmock will block any real network by default. In order to allow real network requests (to unmocked endpoints), you can do the following:
```javascript
import {configure} from 'netmock-js;
beforeEach(() => {
  configure({
    allowRealNetwork: true;
  })
});
```
You can pass a regex instead of boolean in order to allow real network only for specific urls (those who match the regex).
Allowing real network in your tests is not recommended, and can lead to flaky tests. This why netmock will disable this option for you after each test, and if you want to allow real network requests for all tests, make sure to call `allowRealNetwork(true)` inside `beforeEach()`.

#### **suppressQueryParamsInUrlWarnings: boolean**
Will suppress any warnings regarding passing query params in the mocked url