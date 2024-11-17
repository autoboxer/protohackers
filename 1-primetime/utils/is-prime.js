const isPrimeCache = new Map();

function isPrime( num ) {
  if ( num !== parseInt( num ) ) {
    return false;
  }

  if ( isPrimeCache.has( num ) ) {
    return isPrimeCache.get( num );
  }

  if ( num < 2 ) {
    isPrimeCache.set( num, false );
    return false;
  }

  if ( num === 2 ) {
    isPrimeCache.set( num, true );
    return true;
  }

  if ( num % 2 === 0 ) {
    isPrimeCache.set( num, false );
    return false;
  }

  const sqrt = Math.sqrt( num );

  for ( let i = 3; i <= sqrt; i += 2 ) {
    if ( num % i === 0 ) {
      isPrimeCache.set( num, false );
      return false;
    }
  }

  isPrimeCache.set( num, true );
  return true;
}

export default isPrime;