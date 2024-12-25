function decodeTwosComplement( buffer ) {
  if ( buffer.length !== 4 ) {
    throw new Error( 'Input must be exactly 4 bytes long' );
  }

  return buffer.readInt32BE( 0 );
}

export default decodeTwosComplement;
