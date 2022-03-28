# netmock
A javascript network mocker for tests

### Installation
`npm install --save-dev netmock-js`

### Usage
```javascript
  import {netmock} from 'netmock-js';
  // mock some endpoint:
  netmock.post('https://wix.com', () => 'Mocked Text');
  
  // now calling fetch on this endpoint will return the mocked body:
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
#### **netmock[method](url, handler)**
The netmock object allows you to mock the following http method types: `get/post/put/patch/delete`.

params:
 * *url*: string | rout | RegExp
  
      ```javascript
      netmock.get('https://wix.com/get/some/value', () => {}) // plain url
      netmock.get(/.*wix/, () => {}) // regex
      netmock.post('https://wix.com/bookings/:user/:id', () => {}) // rout
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

