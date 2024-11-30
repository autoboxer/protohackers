import net from 'node:net';
import isPrime from '../utils/is-prime.js';

const server = net.createServer( ( socket ) => {
  let receivedData = Buffer.alloc( 0 );
  let message = '';

  socket.on('data', data => {
    receivedData = Buffer.concat([ receivedData, data ]);

    message += data.toString();

    if ( message.endsWith('\n') ) {
      receivedData = Buffer.alloc( 0 );

      const { method, number } = JSON.parse( message );

      try {
        JSON.parse( message );
      } catch ( error ) {
        socket.write( `${ JSON.stringify( { id, error: 'Malformed request' } ) }\n` );
      }

      if ( !method || !number ) {
        socket.write( `${ JSON.stringify( { id, error: 'Invalid request' } ) }\n` );
      } else if ( method !== 'isPrime' ) {
        socket.write( `${ JSON.stringify( { id, error: 'Invalid method' } ) }\n` );
      } else if ( typeof number !== 'number' ) {
        socket.write( `${ JSON.stringify( { id, error: 'Invalid number' } ) }\n` );
      } else {
        socket.write( `${ JSON.stringify( { method: 'isPrime', prime: isPrime( number ) } ) }\n` );
      }
    }
  });

  socket.on('end', () => {
    socket.end();
  })
});

server.maxConnections = 5;

server.listen( { port: 3031 }, () => {
  console.log( `Server is running on port ${ server.address().port }` );
});

export default server;