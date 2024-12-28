import { describe, it } from 'node:test';
import assert from 'node:assert';
import { decode, encode } from '../utils/twos-complement.js';

describe('decode', () => {
  it('should decode positive numbers', () => {
    const buffer = Buffer.from( [ 0x00, 0x00, 0x13, 0xF3 ] );
    const result = decode( buffer );

    assert.strictEqual( result, 5107 );
  });

  it('should decode negative numbers', () => {
    const buffer = Buffer.from( [ 0xFF, 0xFF, 0xFF, 0x9C ] );
    const result = decode( buffer );

    assert.strictEqual( result, -100 );
  });

  it('should decode zero', () => {
    const buffer = Buffer.from( [ 0x00, 0x00, 0x00, 0x00 ] );
    const result = decode( buffer );

    assert.strictEqual( result, 0 );
  });

  it('should decode the maximum positive int32', () => {
    const buffer = Buffer.from( [ 0x7F, 0xFF, 0xFF, 0xFF ] );
    const result = decode( buffer );

    assert.strictEqual( result, 2147483647 );
  });

  it('should decode the minimum negative int32', () => {
    const buffer = Buffer.from( [ 0x80, 0x00, 0x00, 0x00 ] );
    const result = decode( buffer );

    assert.strictEqual( result, -2147483648 );
  });

  it('should throw an error for buffers that are not 4 bytes', () => {
    assert.throws( () => decode( Buffer.from( [ 0x00, 0x00, 0x13 ] ) ) );
    assert.throws( () => decode( Buffer.from( [ 0x00, 0x00, 0x13, 0xF3, 0x00 ] ) ) );
  });
});

describe('encode', () => {
  it('should encode positive numbers', () => {
    const buffer = encode( 5107 );

    assert.deepStrictEqual( buffer, Buffer.from( [ 0x00, 0x00, 0x13, 0xF3 ] ) );
  });

  it('should encode negative numbers', () => {
    const buffer = encode( -100 );

    assert.deepStrictEqual( buffer, Buffer.from( [ 0xFF, 0xFF, 0xFF, 0x9C ] ) );
  });

  it('should encode zero', () => {
    const buffer = encode( 0 );

    assert.deepStrictEqual( buffer, Buffer.from( [ 0x00, 0x00, 0x00, 0x00 ] ) );
  });

  it('should encode the maximum positive int32', () => {
    const buffer = encode( 2147483647 );

    assert.deepStrictEqual( buffer, Buffer.from( [ 0x7F, 0xFF, 0xFF, 0xFF ] ) );
  });

  it('should encode the minimum negative int32', () => {
    const buffer = encode( -2147483648 );
    assert.deepStrictEqual( buffer, Buffer.from( [ 0x80, 0x00, 0x00, 0x00 ] ) );
  });

  it('should throw an error for inputs greater than 2147483647', () => {
    assert.throws( () => encode( 2147483648 ) );
  });

  it('should throw an error for inputs less than -2147483648', () => {
    assert.throws( () => encode( -2147483649 ) );
  });

  it('should throw an error for non-number inputs', () => {
    assert.throws( () => encode( 'string' ) );
    assert.throws( () => encode( null ) );
    assert.throws( () => encode( undefined ) );
  });
});
