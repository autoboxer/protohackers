import net from 'node:net';
import { decode, encode } from '../utils/twos-complement.js';
import BST from '../utils/binary-search-tree.js';

const ERROR_VALUE = -2147483648;

// use a weakmap to allow entries to clean themselves up when each client socket is closed
let bank = new WeakMap();
let buffer = Buffer.alloc( 0 );

const server = net.createServer( socket => {
  // initialize data for each client when they connect
  bank.set( socket, new BST() );

  socket.on( 'data', data => {
    buffer = Buffer.concat( [ buffer, data ] );

    while ( buffer.length >= 9 ) {
      // pull a complete message from the buffer
      const message = Buffer.from( buffer.subarray( 0, 9 ) );
      buffer = Buffer.from( buffer.subarray( 9 ) );

      try {
          const type = String.fromCharCode( message[ 0 ] );
          const val1 = decode( Buffer.from( message.subarray( 1, 5 ) ) );
          const val2 = decode( Buffer.from( message.subarray( 5, 9 ) ) );

          const currentData = bank.get( socket );

          if ( type === 'I' ) {
            currentData.insert({ key: val1, value: val2 });
          } else if ( type === 'Q' ) {
            const mean = currentData.rangeQuery({ start: val1, end: val2 });

            socket.write( encode( mean ) );
          } else {
            throw new Error( 'Invalid message type' );
          }

      } catch ( error ) {
        console.error( `Error from client ${ socket.remoteAddress }: ${ error.message }` );
        socket.write( encode( ERROR_VALUE ) );
      }
    }
  });

  socket.on( 'end', () => {
    socket.end();
  })
});

server.maxConnections = 5;

server.listen( { port: 3030 }, () => {
  console.log( `Server is running on port ${ server.address().port }` );
});

export default server;
