this is a solution to the [protohackers primetime challenge](https://protohackers.com/problem/1), a JSON-based request-response protocol with the following requirements:

1. accepts single-line input terminated by a newline character (`\n`, or ASCII 10)
2. sends a response for each request, which is also a single line containing a JSON object, terminated by a newline character
3. a client may send multiple requests in a single session - each request must be handled in order
4. a conforming request object has the required field `method`, which must always contain the string `isPrime`, and the required field `number`, which must contain a number. Any JSON number is a valid number, including floating-point values
5. a request is _malformed_ if it is not a well-formed JSON object, if any required field is missing, if the method name is not `isPrime`, or if the number value is not a number
6. extraneous fields are to be ignored
7. a conforming response object has the required field `method`, which must always contain the string `isPrime`, and the required field `prime`, which must contain a boolean value: `true` if the number in the request was prime, `false` if it was not
8. a response is malformed if it is not a well-formed JSON object, if any required field is missing, if the method name is not `isPrime`, or if the prime value is not a boolean
9. a response object is considered incorrect if it is well-formed but has an incorrect `prime` value. Note that non-integers can not be prime
10. when a malformed request is received, a single malformed response should be sent back, then the server should disconnect from the client
11. the server should handle at least 5 simultaneous clients

### example messages

```json
// request
{"method":"isPrime","number":123}

// response
{"method":"isPrime","prime":false}
``` 

### requirements

`node 20` - the program uses the built in node test runner

### running the server

```bash
node src/server.js
```

### testing

```bash
node --test
```