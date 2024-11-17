import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';

let isPrime;

describe( 'isPrime', () => {

  beforeEach( async () => {
    mock.method( Map.prototype, 'has' );
    mock.method( Map.prototype, 'get' );
    mock.method( Map.prototype, 'set' );
  
    const random = Math.random();
  
    const isPrimeModule = await import(`../utils/is-prime.js?cachebust=${ random }`);
    isPrime = isPrimeModule.default;
  });
  
  afterEach( () => {
    mock.reset();
  });

  it('should return true for prime numbers', () => {

    assert.strictEqual( isPrime( 2 ), true );
    assert.strictEqual( isPrime( 3 ), true );
    assert.strictEqual( isPrime( 13 ), true );
    assert.strictEqual( isPrime( 101 ), true );
  });

  it('should return false for non-prime numbers', () => {

    assert.strictEqual( isPrime( 1 ), false );
    assert.strictEqual( isPrime( 4 ), false );
    assert.strictEqual( isPrime( 9 ), false );
    assert.strictEqual( isPrime( 100 ), false );
  });

  it('should return false for non-integer numbers', () => {

    assert.strictEqual( isPrime( 2.5 ),  false);
    assert.strictEqual( isPrime( '7 '), false );
    assert.strictEqual( isPrime( NaN ), false );
    assert.strictEqual( isPrime( undefined ), false );
  });

  it('should only cache integers', async () => {
    
    isPrime( 2.5 );
    isPrime( NaN );
    isPrime( undefined );

    assert.equal( Map.prototype.set.mock.calls.length, 0 );

    isPrime( 1 );
    isPrime( 2 );
    isPrime( 3 );

    assert.equal( Map.prototype.set.mock.calls.length, 3 );
  });

  it('should return cached values', () => {

    isPrime( 2 );

    assert.equal( Map.prototype.has.mock.calls.length, 1 );
    assert.equal( Map.prototype.set.mock.calls.length, 1 );
    assert.equal( Map.prototype.get.mock.calls.length, 0 );

    isPrime( 2 );

    assert.equal( Map.prototype.has.mock.calls.length, 2 );
    assert.equal( Map.prototype.set.mock.calls.length, 1 );
    assert.equal( Map.prototype.get.mock.calls.length, 1 );
  });
});