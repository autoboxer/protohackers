import { describe, it, after } from 'node:test';
import assert from 'node:assert';
import net from 'node:net';
import server from '../src/server.js';
import isPrime from '../utils/is-prime.js';

const host = 'localhost';
const port = 3030;

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
      client.on( 'data', data => {
        response += data.toString();
        client.end();
      });

      client.on( 'end', () => {
        const parsed = JSON.parse( response.trim() );
        assert.deepStrictEqual(parsed, { method: 'isPrime', prime: true });
        resolve();
      });

      client.on( 'error', reject );
      client.write( `${ message }\n` );
    });
  });

  it('should send a well-formed response for a valid request', async () => {
    const client = net.connect({ host, port });

    const message = JSON.stringify({ method: 'isPrime', number: 7 });
    let response = '';

    await new Promise( ( resolve, reject ) => {
      client.on( 'data', data => {
        response += data.toString();
        client.end();
      });

      client.on( 'end', () => {
        const parsed = JSON.parse( response.trim() );
        assert.equal( response.endsWith('\n'), true );
        assert.ok( parsed.method, 'response should have a method' );
        assert.ok( parsed.prime, 'response should have a prime' );
        assert.equal( parsed.method, 'isPrime' );
        assert.equal( typeof parsed.prime, 'boolean' );
        resolve();
      });

      client.on( 'error', reject );
      client.write( `${ message }\n` );
    });
  });

  it('should ignore extraneous fields in the request', async () => {
    const client = net.connect({ host, port });

    const message = JSON.stringify({ method: 'isPrime', number: 7, extraneous: 'field' });
    let response = '';

    await new Promise( ( resolve, reject ) => {
      client.on( 'data', data => {
        response += data.toString();
        client.end();
      });

      client.on( 'end', () => {
        const parsed = JSON.parse( response.trim() );
        assert.equal( parsed.prime, true );
        resolve();
      });

      client.on( 'error', reject );
      client.write( `${ message }\n` );
    });
  });

  it('should handle multiple requests from the same client in order', async () => {
    const client = net.connect({ host, port });

    const numbers = [ 1, 2, 3, 4, 9, 13, 100, 101 ];

    const messages = numbers.map( number => `${ JSON.stringify({ method: 'isPrime', number }) }\n` );

    let response = '';

    await new Promise( ( resolve, reject ) => {
      client.on( 'data', data => {
        response += data.toString();
        client.end();
      });

      client.on( 'end', () => {
        const jsonStrings = response.match( /(\{.*?\})/g );

        for ( const [ i, jsonString ] of jsonStrings.entries() ) {
          const parsed = JSON.parse( jsonString );
          assert.equal( parsed.prime, isPrime( numbers[ i ] ) );
        }
        
        resolve();
      });

      client.on( 'error', reject );

      for ( const message of messages ) {
        client.write( `${ message }` );
      }
    });
  });

  it('should respond with an error for malformed JSON', async () => {
    const client = net.connect({ host, port });

    const message = '{"method": "isPrime", "number": 7\n';
    let response = '';

    await new Promise( ( resolve, reject ) => {
      client.on( 'data', data => {
        response += data.toString();
        client.end();
      });

      client.on( 'end', () => {
        const parsed = JSON.parse( response.trim() );
        assert.ok( parsed.error, 'response should have an error' );
        assert.equal( parsed.error, 'Malformed request' );
        resolve();
      });

      client.on( 'error', reject );
      client.write( `${ message }` );
    });
  });

  it('should respond with an error for a request with missing number', async () => {
    const client = net.connect({ host, port });

    const message = '{"method": "isPrime"}\n';
    let response = '';

    await new Promise( ( resolve, reject ) => {
      client.on( 'data', data => {
        response += data.toString();
        client.end();
      });

      client.on( 'end', () => {
        const parsed = JSON.parse( response.trim() );
        assert.ok( parsed.error, 'response should have an error' );
        assert.equal( parsed.error, 'Invalid request' );
        resolve();
      });

      client.on( 'error', reject );
      client.write( `${ message }` );
    });
  });

  it('should respond with an error for a request with missing method', async () => {
    const client = net.connect({ host, port });

    const message = '{"number": "7"}\n';
    let response = '';

    await new Promise( ( resolve, reject ) => {
      client.on( 'data', data => {
        response += data.toString();
        client.end();
      });

      client.on( 'end', () => {
        const parsed = JSON.parse( response.trim() );
        assert.ok( parsed.error, 'response should have an error' );
        assert.equal( parsed.error, 'Invalid request' );
        resolve();
      });

      client.on( 'error', reject );
      client.write( `${ message }` );
    });
  });

  it('should respond with an error for a request with an invalid method', async () => { 
    const client = net.connect({ host, port });

    const message = '{"method": "isNotPrime", "number": 7}\n';
    let response = '';

    await new Promise( ( resolve, reject ) => {
      client.on( 'data', data => {
        response += data.toString();
        client.end();
      });

      client.on( 'end', () => {
        const parsed = JSON.parse( response.trim() );
        assert.ok( parsed.error, 'response should have an error' );
        assert.equal( parsed.error, 'Invalid method' );
        resolve();
      });

      client.on( 'error', reject );
      client.write( `${ message }` );
    });
  });

  it('should respond with an error for an invalid number', async () => {
    const client = net.connect({ host, port });

    const message = '{"method": "isPrime", "number": "seven"}\n';
    let response = '';

    await new Promise( ( resolve, reject ) => {
      client.on( 'data', data => {
        response += data.toString();
        client.end();
      });

      client.on( 'end', () => {
        const parsed = JSON.parse( response.trim() );
        assert.ok( parsed.error, 'response should have an error' );
        assert.equal( parsed.error, 'Invalid request' );
        resolve();
      });

      client.on( 'error', reject );
      client.write( `${ message }` );
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
