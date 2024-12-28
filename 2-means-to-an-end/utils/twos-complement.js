// decode a 4-byte big-endian int32 buffer as a number
export function decode( buffer ) {
  if ( buffer?.length !== 4 ) {
    throw new Error( 'Input must be exactly 4 bytes long' );
  }

  return buffer.readInt32BE();
}

// encode a number as a 4-byte big-endian int32 buffer
export function encode( int ) {
  if ( typeof int !== 'number' || int > 2147483647 || int < -2147483648 ) {
    throw new Error( 'Input must be a number between -2147483648 and 2147483647' );
  }

  const buffer = Buffer.alloc( 4 );

  buffer.writeInt32BE( int );

  return buffer;
}
