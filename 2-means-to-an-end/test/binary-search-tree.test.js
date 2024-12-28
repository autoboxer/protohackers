import { describe, it } from 'node:test';
import assert from 'node:assert';
import BST from '../utils/binary-search-tree.js';

describe('BST', () => {
  it( 'should insert nodes correctly', () => {
    const bst = new BST();

    bst.insert( 10, 5 );
    bst.insert( 5, 3 );
    bst.insert( 15, 7 );

    assert.strictEqual( bst.root.key, 10 );
    assert.strictEqual( bst.root.value, 5 );
    assert.strictEqual( bst.root.left.key, 5 );
    assert.strictEqual( bst.root.left.value, 3 );
    assert.strictEqual( bst.root.right.key, 15 );
    assert.strictEqual( bst.root.right.value, 7 );
  });

  it('should handle duplicate keys by replacing the value', () => {
    const bst = new BST();

    bst.insert( 10, 5 );
    bst.insert( 10, 8 );

    assert.strictEqual( bst.root.key, 10 );
    assert.strictEqual( bst.root.value, 8 );
    assert.strictEqual( bst.root.left, null );
    assert.strictEqual( bst.root.right, null );
  });

  it('should perform a range query and return the correct mean value', () => {
    const bst = new BST();

    bst.insert( 10, 5 );
    bst.insert( 5, 3 );
    bst.insert( 15, 7 );
    bst.insert( 3, 2 );
    bst.insert( 7, 4 );

    const result = bst.rangeQuery( 5, 15 );
    const expected = Math.floor( ( 5 + 3 + 7 + 4 ) / 4 );

    assert.strictEqual( result, expected );
  });

  it('should return 0 for an empty range query', () => {
    const bst = new BST();

    bst.insert( 10, 5 );
    bst.insert( 5, 3 );
    bst.insert( 15, 7 );

    const result = bst.rangeQuery( 20, 25 );

    assert.strictEqual( result, 0 );
  });
});
