import { describe, it, after, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import net from 'node:net';
import { decode } from '../utils/twos-complement.js';
import server from '../src/server.js';

const HOST = 'localhost';
const PORT = 3030;
const ERROR_VALUE = -2147483648;

const insertMessage1 = Buffer.from([ 0x49, 0x00, 0x00, 0x30, 0x39, 0x00, 0x00, 0x00, 0x65 ]); // I 12345 101
const insertMessage2 = Buffer.from([ 0x49, 0x00, 0x00, 0x30, 0x3A, 0x00, 0x00, 0x00, 0x67 ]); // I 12346 103
const queryMessage = Buffer.from([ 0x51, 0x00, 0x00, 0x30, 0x39, 0x00, 0x00, 0x30, 0x3A ]);   // Q 12345 12346

const createClient = async () => {
  const client = new net.Socket();

  return new Promise( ( resolve, reject ) => {
    client.connect( PORT, HOST, () => {
      resolve( client );
    });

    client.on( 'error', reject );
  });
}

const sendMessage = async ( client, message ) => {
  return new Promise( ( resolve, reject ) => {
    const messageType = String.fromCharCode( message[ 0 ] );
    let responseBuffer = Buffer.alloc( 0 );

    client.write( message, err => {
      if ( err ) {
        reject( err );
      }

      if ( messageType === 'I' ) {
        return resolve();
      }
    });

    client.on('data', data => {
      responseBuffer = Buffer.concat( [ responseBuffer, data ] );
      resolve( responseBuffer );
    });

    client.on('error', err => {
      reject( err );
    });
  });
};

describe('server.js', () => {

  let client;
  let client2;

  beforeEach( async () => {
    client = await createClient();
    client2 = await createClient();
  });

  afterEach( () => {
    client.end();
    client2.end();
  });

  after( () => {
    server.close();
  });

  it('should export a server instance', () => {
    assert.ok( server instanceof net.Server );
  });

  it('should handle valid insert and query messages', async () => {
    await sendMessage( client, insertMessage1 );
    await sendMessage( client, insertMessage2 );
    const response = await sendMessage( client, queryMessage );

    assert.strictEqual( decode( response ), 102);
  });

  it('should return 0 for queries with no matching data', async () => {
    const response = await sendMessage( client, queryMessage );

    assert.strictEqual( decode( response ), 0 );
  });

  it('should return 0 for queries with mintime > maxtime', async () => {
    const queryMessage = Buffer.from([ 0x51, 0x00, 0x00, 0x30, 0x3A, 0x00, 0x00, 0x30, 0x39 ]);   // Q 12346 12345

    await sendMessage( client, insertMessage1 );
    await sendMessage( client, insertMessage2 );
    const response = await sendMessage( client, queryMessage );

    assert.strictEqual( decode( response ), 0 );
  });

  it('should return the error value for invalid message types', async () => {
    const invalidMessage = Buffer.from([ 0x58, 0x00, 0x00, 0x30, 0x39, 0x00, 0x00, 0x30, 0x3A ]); // X 12345 12346

    const response = await sendMessage( client, invalidMessage );

    assert.strictEqual( decode( response ), ERROR_VALUE );
  });

  it('should partition client data', async () => {
    await sendMessage( client, insertMessage1 );
    await sendMessage( client, insertMessage2 );
    const client1Response = await sendMessage( client, queryMessage );
    const client2Response = await sendMessage( client2, queryMessage );

    assert.strictEqual( decode( client1Response ), 102 );
    assert.strictEqual( decode( client2Response ), 0 );
  });
  
  it('should handle 5 concurrent connections', async () => {
    const clientPromises = [];
    const clientClosePromises = [];
    const maxConnections = 5;

    for ( let i = 0; i < maxConnections; i++ ) {
      clientPromises.push( new Promise( async ( resolve, reject ) => {
        try {
          const client = await createClient();
          resolve( client );
        } catch ( error ) {
          reject( error );
        }
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
