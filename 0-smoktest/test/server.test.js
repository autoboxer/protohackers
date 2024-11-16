import { describe, it, after } from 'node:test';
import assert from 'node:assert';
import net from 'node:net';
import server from '../src/server.js';

const host = 'localhost';
const port = 7;

describe( 'server.js', () => {

  after( () => {
    server.close();
  });

  it('should export a server instance', () => {
    assert.ok( server instanceof net.Server );
  });

  it('should echo data unmodified', async () => {
    const client = net.connect({ host, port });

    const message = 'testing echo';
    let receivedData = Buffer.alloc( 0 );

    await new Promise( ( resolve, reject ) => {
      client.on( 'data', data => {
        receivedData = Buffer.concat([ receivedData, data ]);
      });

      client.on( 'end', () => {
        assert.strictEqual( receivedData.toString(), message );
        resolve();
      });

      client.on( 'error', reject );

      client.write( message );
      client.end();

    }).then( () => {
      assert.ok( true );
    }).catch( () => {
      assert.fail();
    });
  });

  it('should not mangle binary data', async () => {
    const client = net.connect({ host, port });

    const message = Buffer.from([ 0x00, 0x01, 0x02, 0x03, 0x04 ]);
    let receivedData = Buffer.alloc(0);

    await new Promise( ( resolve, reject ) => {
      client.on( 'data', data => {
        receivedData = Buffer.concat([ receivedData, data ]);
      });

      client.on( 'end', () => {
        assert.deepStrictEqual( receivedData, message );
        resolve();
      });

      client.on( 'error', reject );

      client.write( message );
      client.end();

    });
  });

  it('should handle 5 concurrent connections', async () => {
    const clientPromises = [];
    const clientClosePromises = [];
    const maxConnections = 5;

    for ( let i = 0; i < maxConnections; i++ ) {
      clientPromises.push( new Promise( ( resolve, reject ) => {
        const client = net.connect({ host, port });

        client.on( 'connect', () => resolve( client ) );
        client.on( 'error', reject );
      }) );
    }

    const connectedClients = await Promise.all( clientPromises );

    connectedClients.forEach(( client, index ) => {
      assert.ok( client.remoteAddress, `client ${ index + 1 } should have a remote address` );
      assert.ok( client.remotePort, `client ${ index + 1 } should have a remote port` );
    });

    connectedClients.forEach( client => {
      clientClosePromises.push( new Promise( ( resolve, reject ) => {
        client.on( 'end', resolve );
        client.on( 'error', reject );
        client.end()
      }) );
    });

    await Promise.all( clientClosePromises );
  });

  it('should close the connection when the client closes the socket', async () => {
    const serverClosedConnection = new Promise( ( resolve, reject ) => {
      server.on( 'connection', socket => {
        socket.on( 'end', resolve );
        socket.on( 'error', reject );
      });
    });
    
    const client = net.connect({ host, port });

    await new Promise( ( resolve, reject ) => {
      client.on( 'close', resolve );
      client.on( 'error', reject );
      client.end();
    });

    await serverClosedConnection;
  });

});