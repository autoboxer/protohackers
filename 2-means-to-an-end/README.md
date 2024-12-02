This is a solution to the [protohackers means to an end challenge](https://protohackers.com/problem/2), a TCP server that lets users insert and query timestamped prices with the following requirements:

1. Each client will track the price of a different asset
2. Clients send messages to the server to either `insert` or `query` the prices
3. Each connection from a client is a separate session, with each session's data tracking a different asset
4. Each client can only query data supplied by itself
5. Clients can send multiple requests per connection
5. Messages will be sent in binary, using the `insert` or `query` format
6. Behaviour is undefined if the type specifier is not either `I` or `Q`
7. Behaviour is undefined if there are multiple prices with the same timestamp from the same client
8. For `query` messages, the server must compute the mean of the inserted prices with timestamps T, `mintime` <= T <= `maxtime`.  If the mean is not an integer, it is acceptable to round either up or down
9. The server must then send the mean to the client as a single `int32`, defined as 4 bytes of binary data
10. If there are no samples within the requested period, the value returned must be `0`
11. If the `mintime` comes after `maxtime`, the value returned must be `0`
12. The server should handle at least 5 simultaneous clients
13. When a client triggers undefined behaviour, the server can do anything it likes for that client, but must not adversely affect other clients that did not trigger undefined behaviour

#### Notes

1. Insertions may occur out-of-order
2. Prices can go negative 

---

### query formats

Each request is 9 bytes long

```
Byte:  |  0  |  1     2     3     4  |  5     6     7     8  |
Type:  |char |         int32         |         int32         |
```

Byte 0: a type indicator - `I` for insert, `Q` for query

Bytes 1-4: a [two's compliment](https://en.wikipedia.org/wiki/Two%27s_complement) 32-bit integers in network byte order (big endian), whose meaning depends on the message type (referred to as `int32`)

Bytes 5-8: a [two's compliment](https://en.wikipedia.org/wiki/Two%27s_complement) 32-bit integers in network byte order (big endian), whose meaning depends on the message type (referred to as `int32`)

---

### insert

An insert message lets the client insert a timestamped price:

```
Byte:  |  0  |  1     2     3     4  |  5     6     7     8  |
Type:  |char |         int32         |         int32         |
Value: | 'I' |       timestamp       |         price         |
```

Byte 0: `I`

Bytes 1-4: the timestamp, in seconds since 00:00, January 1st, 1970

Bytes 5-8: the price, in pennies, of this client's asset, at the given timestamp

#### example

To insert a price of 101 pennies at timestamp 12345, a client would send:

```
Hexadecimal: 49    00 00 30 39    00 00 00 65
Decoded:      I          12345            101
```

---

### query

A query message lets the client query the average price over a given time period:

```
Byte:  |  0  |  1     2     3     4  |  5     6     7     8  |
Type:  |char |         int32         |         int32         |
Value: | 'Q' |        mintime        |        maxtime        |
```

Byte 0: `Q`

Bytes 1-4: `mintime`, the earliest timestamp of the period in seconds since 00:00, January 1st, 1970

Bytes 5-8: `maxtime`, the latest timestamp of the period in seconds since 00:00, January 1st, 1970

#### example

To query the mean price between T=1000 and T=100000, a client would send:

```
Hexadecimal: 51    00 00 03 e8    00 01 86 a0
Decoded:      Q           1000         100000
```

---

### response

A response message is a single `int32` value corresponding to the mean of the values for timestamps T, where `mintime` <= T <= `maxtime`:

```
Hexadecimal: 00 00 13 f3
Decoded:            5107
```

---

### example session

In this example, "<--" denotes messages from the client to the server, and "-->" denotes messages from the server to the client.

```
    Hexadecimal:                 Decoded:
<-- 49 00 00 30 39 00 00 00 65   I 12345 101
<-- 49 00 00 30 3a 00 00 00 66   I 12346 102
<-- 49 00 00 30 3b 00 00 00 64   I 12347 100
<-- 49 00 00 a0 00 00 00 00 05   I 40960 5
<-- 51 00 00 30 00 00 00 40 00   Q 12288 16384
--> 00 00 00 65                  101
```

The client inserts (timestamp, price) values: `(12345, 101)`, `(12346, 102)`, `(12347, 100)`, and `(40960, 5)`. The client then queries between `T=12288` and `T=16384`. The server computes the mean price during this period, which is `101`, and sends back `101`.

---

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