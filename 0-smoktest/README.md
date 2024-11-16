this is a solution to the [protohackers smoketest](https://protohackers.com/problem/0), a distributed system delay-line memory with the following requirements:

1. implement the TCP Echo Service from [RFC 862](https://www.rfc-editor.org/rfc/rfc862.html)
2. accept TCP connections
3. echo data received from a client back to them, being sure not to mangle binary data
4. handle at least 5 simultaneous clients
5. close the connection once end-of-file is reached on the receiving side and all data received is sent back.  The client will shut down it's sending side once it's finished sending data.


### requirements

`node 20` - the program uses the built in node test runner

### running the server

```bash
node src/server.js
```

### running a client

```bash
echo 'testing' | nc localhost 3030
```

### testing

```bash
node --test
```