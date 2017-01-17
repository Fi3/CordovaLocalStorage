const Errors = require('./Errors.js');
function _inspect(memoryDb, key) {
  // key is a string, memoryDb is the object that we get from load the db in memory
  // hashFucntion is the function that I use for hashing
  // return {index, getPreviousIndexPosition, nextNodePosition, alreadyInDb, collisions}
  // collisions is int, number of collisions

  const hashFunction = memoryDb._hashFunction;
  const index = hashFunction(key);
  const node = memoryDb._nodes[key];
  const prevNode = _getPreviousNode(memoryDb, key);
  let previousNodePosition;
  let nextNodePosition;

  // set alreadyInDb and collisions
  let alreadyInDb;
  let collisions;
  if (node === undefined) {
    alreadyInDb = false;
    collisions = 0;
  }
  else if (_getFirstBoucketNode(memoryDb, key) === node) {
    alreadyInDb = true;
    collisions = 0;
  }
  else {
    alreadyInDb = true;
    collisions = 'chi lo sa??';
  }

  // set previous  and next position
  if (node !== undefined) {
    // if key is in db ever use saved previous and next position
    previousNodePosition = memoryDb._nodes[node.previousKey].position;
    nextNodePosition = node.nextNodePosition;
  }
  else if (prevNode.collisionFlag === 1) {
    // if key is not in db and the previous node is in a boucket
    const boucket = _traverseBoucket(memoryDb, prevNode);                        // jshint ignore:line
    previousNodePosition = boucket[boucket.length - 1].position;
    previousNodePosition = boucket[boucket.length - 1].nextPosition;
  }
  else if (prevNode.collisionFlag !== 1) {
    // if key is not in db and the previous node is not in a boucket
    previousNodePosition = prevNode.position;
    previousNodePosition = prevNode.nextPosition;
  }
  else if (prevNode.collisionFlag === 1 && ) {
    // if key is in db and the previous node is not in a boucket
    previousNodePosition = prevNode.position;
    previousNodePosition = prevNode.nextPosition;
  }

  return {
    normalizedIndex: prevNode.normalizedIndex + 1,
    previousNodePosition: prevNode.position,
    nextNodePosition: prevNode.nextPosition,
    alreadyInDb: alreadyInDb,
    collisions: collisions,
  };
}

function _getPreviousNode(memoryDb, key) {
  // iterate memoryDb key and when key > indexSerched return the key before

  const hashFunction = memoryDb._hashFunction;
  const indexSearched = hashFunction(key);
  const nodes = memoryDb._nodes;
  const node = nodes[key];
  let prevNode;

  function _findPreviouNodeForKeyNotInDb(nodes, indexSearched) {
    // iterate nodes and return when we find a key such that hash(key) is the biggest of the ones that are smaller than indexSearched
    for (let _key in nodes) {
      const actualIndex = hashFunction(_key);
      if (actualIndex > indexSearched && indexSearched > nodes[_key].previousIndex) {
        // return isHead if there is not in the db a key such that hash(key) < indexSearched
        if (_key === nodes[_key].previousKey) {
          return 'isHead';
        }
        return {node: nodes[nodes[_key].previousKey], key: nodes[_key].previousKey};
      }
    }
    // return the last node if indexSearched is bigger than each key in the db
    return {node: memoryDb._header.tail, key: memoryDb._header.tail.key};
  }

  // we are looking for a key that is not in the db yet
  if (node === undefined) {
    prevNode = _findPreviouNodeForKeyNotInDb(nodes, indexSearched);
  }
  // we are looking for a key that is already in the db
  if (node !== undefined) {
    prevNode = {node: nodes[node.previousKey], key: node.previousKey};
  }

  // if prevNode isHead mean that there aren't node with smaller index than the one inspected in the db so we return 'head'
  if (prevNode === 'isHead') {
    return 'head';
  }

  // if prevNode is part of a boucket (there are collisions) we should return the first element of the boucket
  return _getFirstBoucketNode(memoryDb, prevNode.key);
}

function _getFirstBoucketNode(memoryDb, key) {
  const node = memoryDb._nodes[key];
  if (JSON.stringify(node) === JSON.stringify(memoryDb._header.head.node)) {
    return node;
  }
  const prevNode = memoryDb._nodes[node.previousKey];
  if (prevNode.collisionFlag === 0) {
    return node;
  }
  else if (prevNode.collisionFlag === 1) {
    return _getFirstBoucketNode(memoryDb, node.previousKey);
  }
  else {
    throw UnknownError;
  }
}

function _traverseBoucket(memoryDb, node) {
  // take the first element of the boucket and return a list that contain the whole boucket

  function checkValue(memoryDb, node) {
    // check if the key belong at an element the is the first element of a boucket if not
    // throw an appropiate error

    const nodeCollisionFlag = node.collisionFlag;
    const prevNodeCollisionFlag = memoryDb._nodes[node.previousKey].collisionFlag;
    const isHead = node.normalizedIndex === 1;

    // the key do not belong at a node in a boucket
    if (nodeCollisionFlag !== 1 && prevNodeCollisionFlag !== 1) {
      throw new Errors.MemoryDbKeyNotInBoucket();
    }

    // the key is not the first element of the boucket
    if (nodeCollisionFlag === 1 && prevNodeCollisionFlag === 1 && !isHead) {
      throw new Errors.MemoryDbKeyNotFirstInBoucket();
    }

    // the key is not the first element of the boucket
    if (nodeCollisionFlag !== 1 && prevNodeCollisionFlag === 1) {
      throw new Errors.MemoryDbKeyNotFirstInBoucket();
    }
  }

  function traverse(memoryDb, nodes) {
    const nextNode = memoryDb._nodes[nodes[nodes.length - 1].nextKey];
    if (nextNode.collisionFlag === 0) {
      nodes.push(nextNode);
      return nodes;
    }
    else if (nextNode.collisionFlag === 1) {
      nodes.push(nextNode);
      return traverse(memoryDb, nodes);
    }
    else {
      throw UndefinedError;
    }
  }

  checkValue(memoryDb, node);
  return traverse(memoryDb, [node]);
}

class Node {
  // how is rapresented a node in memory
  constructor(collisionFlag, nextPosition, value, position, normalizedIndex, key, previousIndex) {
    // collisionFlag is 0 or 1
    this.collisionFlag = collisionFlag;
    // nextPosition is int, file byte position of the next node, 0 if tail
    this.nextPosition = nextPosition;
    // value is string
    this.value = value;
    // position is int, file byte position of this node
    this.position = position;
    // normalized index is int, if hash(key) is actual index normalized index is
    //  min(hash(key1), ..., hash(keyn)) => 0 MAX(hash(key1)...) => n all the
    //  other element accordingly
    this.normalizedIndex = normalizedIndex;
    // previousKey string is the node's key when head
    this.previousKey = previousKey;
    // nextKey string is the node's key when tai
    this.nextKey = nextKey;
    // previousIndex is int, is actual index of previous node, 0 if head
    this.previousIndex = previousIndex;
  }
}

class Header {
  constructor(head, headKey, tail, tailKey) {
    this.head = {
      node: head,
      key: jeadKey,
    };
    this.tail = {
      node: tail,
      key: tailKey,
    };
  }
}

class MemoryDb {
  // MemoryDb is create when we load the database from the file where is saved, or from ...
  // we need memoryDb for read the db and also for write becaouse the object that rapresent
  // the bufferized db (the one in the file) need MemoryDb for modify the buffer.
  // _header should be new Header
  // nodes should be {strinf: new Node, string: new Node, ...}
  // hash function is a function that take a string and return an int
  constructor(header, nodes, hashFucntion) {
    this._header = header;
    this._nodes = nodes;
    this._hashFunction = hashFucntion;
  }
  getPreviousNode(key) {
    // return the node with a key such that:
    // hash(key) is the biggest of the ones that are smaller than indexSearched 
    // If this node is an element of a boucket (has collsions in the db) return the first
    // node of the boucket
    return (_getPreviousNode(this, node));
  }
}

module.exports._inspect = _inspect;
module.exports._getPreviousNode = _getPreviousNode;
module.exports._traverseBoucket = _traverseBoucket;
