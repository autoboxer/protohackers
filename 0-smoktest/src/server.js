import net from 'node:net';

const server = net.createServer( ( socket ) => {
  let receivedData = Buffer.alloc( 0 );

  socket.on('data', data => {
    receivedData = Buffer.concat([ receivedData, data ]);
  });

  socket.on('end', () => {
    socket.write( receivedData, () => {
      socket.end();
    } );
  })
});

server.maxConnections = 5;

server.listen( { port: 3030 }, () => {
  console.log( `Server is running on port ${ server.address().port }` );
});

export default server;