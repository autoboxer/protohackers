import net from 'node:net';
import isPrime from '../utils/is-prime.js';

const server = net.createServer( ( socket ) => {
  let buffer = '';

  socket.on( 'data', data => {
    buffer += data.toString();

    let newlineIndex;

    while ( ( newlineIndex = buffer.indexOf('\n') ) !== -1 ) {
      // pull a complete message from the buffer
      const message = buffer.slice( 0, newlineIndex );
      buffer = buffer.slice( newlineIndex + 1 );

      try {
          const { method, number } = JSON.parse( message );

          if ( !method || typeof number !== 'number' ) {
            socket.write(`${ JSON.stringify( { error: 'Invalid request' } ) }\n`);
            continue;
          }
          
          if ( method !== 'isPrime' ) {
            socket.write(`${ JSON.stringify( { error: 'Invalid method' } ) }\n`);
            continue;
          }

          socket.write( `${ JSON.stringify( { method: 'isPrime', prime: isPrime( number ) } ) }\n` );
        // }
      } catch ( error ) {
        socket.write(`${ JSON.stringify({ error: 'Malformed request' }) }\n`);
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