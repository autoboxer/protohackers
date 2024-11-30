import { describe, it, after, mock } from 'node:test';
import assert from 'node:assert';
import net from 'node:net';
import server from '../src/server.js';

const host = 'localhost';
const port = 3031;

describe( 'server.js', () => {

  after( () => {
    server.close();
  });

  it('should export a server instance', () => {
    assert.ok( server instanceof net.Server );
  });

  it('should only respond after receiving a full message', async () => {

    const client = net.connect({ host, port });

    const message = JSON.stringify({ method: 'isPrime', number: 7 });
    let response = '';

    await new Promise( ( resolve, reject ) => {
      client.on('data', data => {
        response += data.toString();
        client.end();
      });

      client.on('end', () => {
        const parsed = JSON.parse( response.trim() );
        assert.deepStrictEqual(parsed, { method: 'isPrime', prime: true });
        resolve();
      });

      client.on('error', reject);
      client.write( `${ message }\n` );
    });
  });

  it('should send a well-formed response for a valid request', async () => {

    const client = net.connect({ host, port });

    const message = JSON.stringify({ method: 'isPrime', number: 7 });
    let response = '';

    await new Promise( ( resolve, reject ) => {
      client.on('data', data => {
        response += data.toString();
        client.end();
      });

      client.on('end', () => {
        const parsed = JSON.parse( response.trim() );
        assert.equal( response.endsWith('\n'), true );
        assert.ok( parsed.method, 'response should have a method' );
        assert.ok( parsed.prime, 'response should have a prime' );
        assert.equal( parsed.method, 'isPrime' );
        assert.equal( typeof parsed.prime, 'boolean' );
        resolve();
      });

      client.on('error', reject);
      client.write( `${ message }\n` );
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

});
