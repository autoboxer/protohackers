import { describe, it } from 'node:test';
import assert from 'node:assert';
import BST from '../utils/binary-search-tree.js';

describe('BST', () => {
  it( 'should insert nodes correctly', () => {
    const bst = new BST();

    bst.insert({ key: 10, value: 5 });
    bst.insert({ key: 5, value: 3 });
    bst.insert({ key: 15, value: 7 });

    assert.strictEqual( bst.root.key, 10 );
    assert.strictEqual( bst.root.value, 5 );
    assert.strictEqual( bst.root.left.key, 5 );
    assert.strictEqual( bst.root.left.value, 3 );
    assert.strictEqual( bst.root.right.key, 15 );
    assert.strictEqual( bst.root.right.value, 7 );
  });

  it('should handle duplicate keys by replacing the value', () => {
    const bst = new BST();

    bst.insert({ key: 10, value: 5 });
    bst.insert({ key: 10, value: 8 });

    assert.strictEqual( bst.root.key, 10 );
    assert.strictEqual( bst.root.value, 8 );
    assert.strictEqual( bst.root.left, null );
    assert.strictEqual( bst.root.right, null );
  });

  it('should perform a range query and return the correct mean value', () => {
    const bst = new BST();

    bst.insert({ key: 10, value: 5 });
    bst.insert({ key: 5, value: 3 });
    bst.insert({ key: 15, value: 7 });
    bst.insert({ key: 3, value: 2 });
    bst.insert({ key: 7, value: 4 });

    const result = bst.rangeQuery({ start: 5, end: 15 });
    const expected = Math.floor( ( 5 + 3 + 7 + 4 ) / 4 );

    assert.strictEqual( result, expected );
  });

  it('should return 0 for an empty range query', () => {
    const bst = new BST();

    const result = bst.rangeQuery({ start: 20, end: 25 });

    assert.strictEqual( result, 0 );
  });

  it('should return 0 if start is greater than end', () => {
    const bst = new BST();

    bst.insert({ key: 10, value: 5 });
    bst.insert({ key: 5, value: 3 });
    bst.insert({ key: 15, value: 7 });

    const result = bst.rangeQuery({ start: 15, end: 5 });

    assert.strictEqual( result, 0 );
  });
});
