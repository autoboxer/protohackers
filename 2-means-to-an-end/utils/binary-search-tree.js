class TreeNode {

  constructor( key, value ) {
    this.key = key;
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BST {
  constructor() {
      this.root = null;
  }

  insert( key, value ) {
      const node = new TreeNode( key, value );

      if ( !this.root ) {
          this.root = node;
          return;
      }

      let current = this.root;
      
      while ( true ) {
          if ( key === current.key ) {
            current.value = value;
            return;
          }

          if ( key < current.key ) {
            if ( !current.left ) {
              current.left = node;
              return;
            }

            current = current.left;
          } else {
            if ( !current.right ) {
              current.right = node;
              return;
            }

            current = current.right;
          }
      }
  }

  rangeQuery( start, end ) {
      const result = [];

      const traverse = node => {
          if ( !node ) {
            return;
          }

          if ( node.key >= start && node.key <= end ) {
              result.push( node.value );
          }

          if ( node.key > start ) {
            traverse(node.left);
          }

          if ( node.key < end ) {
            traverse( node.right );
          }
      };

      traverse( this.root );

      if ( !result.length ) {
        return 0;
      }

      const mean = result.reduce( ( acc, value ) => acc + value ) / result.length;

      return Math.floor( mean );
  }
}

export default BST;
