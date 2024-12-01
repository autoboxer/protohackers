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

      let method;
      let number;

      // split the message into an array of JSON strings
      const jsonStrings = message.match( /(\{.*?\})/g );

      if ( !jsonStrings ) {
        socket.write( `${ JSON.stringify({ error: 'Malformed request' }) }\n` );
        return;
      }

      try {
        for ( const jsonString of jsonStrings ) {
          ({ method, number } = JSON.parse( jsonString ));

          if ( !method || ( !number && typeof number !== 'number' ) ) {
            throw new Error('Invalid request');
          } else if ( method !== 'isPrime' ) {
            throw new Error('Invalid method')
          } else if ( typeof number !== 'number' ) {
            throw new Error('Invalid number')
          }

          socket.write( `${ JSON.stringify( { method: 'isPrime', prime: isPrime( number ) } ) }\n` );
        }
      } catch ( error ) {
        socket.write(`${JSON.stringify({ error: error.message })}`);
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