import { describe, it } from 'node:test';
import assert from 'node:assert';
import decodeTwosComplement from '../utils/decode-twos-complement.js';

describe('decodeTwosComplement', () => {
  it('should decode positive numbers', () => {
    const buffer = Buffer.from( [ 0x00, 0x00, 0x13, 0xF3 ] );
    const result = decodeTwosComplement( buffer );

    assert.strictEqual( result, 5107 );
  });

  it('should decode negative numbers', () => {
    const buffer = Buffer.from( [ 0xFF, 0xFF, 0xFF, 0x9C ] );
    const result = decodeTwosComplement( buffer );

    assert.strictEqual( result, -100 );
  });

  it('should decode zero', () => {
    const buffer = Buffer.from( [ 0x00, 0x00, 0x00, 0x00 ] );
    const result = decodeTwosComplement( buffer );

    assert.strictEqual( result, 0 );
  });

  it('should decode the maximum positive int32', () => {
    const buffer = Buffer.from( [ 0x7F, 0xFF, 0xFF, 0xFF ] );
    const result = decodeTwosComplement( buffer );

    assert.strictEqual( result, 2147483647 );
  });

  it('should decode the minimum negative int32', () => {
    const buffer = Buffer.from( [ 0x80, 0x00, 0x00, 0x00 ] );
    const result = decodeTwosComplement( buffer );

    assert.strictEqual( result, -2147483648 );
  });

  it('should throw an error for buffers that are not 4 bytes', () => {
    assert.throws( () => decodeTwosComplement( Buffer.from( [ 0x00, 0x00, 0x13 ] ) ) );
    assert.throws( () => decodeTwosComplement( Buffer.from( [ 0x00, 0x00, 0x13, 0xF3, 0x00 ] ) ) );
  });
});