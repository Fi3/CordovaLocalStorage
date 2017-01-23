const Errors = require('./Errors.js');
class Db {
  // Db is the object that expose the localStorage API
  // _buffer is the buffer that contain the raw data that we can find in the file where the db is saved
  // _memoryDb is the js object that contain all the keys and values so serialize(_memoryDb) -> _buffer
  // For get(key) we just need to do memoryDb.key.
  // For set an item we need to query memoryDb for the positions in the buffer of the neigbors of the item that we want to set
  // than we have to serialize the item then we have to append the item to the buffer then we have to
  // modify in the buffer the item's neighbors for point to the new item, finally we update memoryDb.
  // _buffer should be a special object that extend Buffer and when we write something to _buffer it should write
  // the changes to a specular file at a predefined path. Of course all work also with a simple buffer but without
  // the persistence of the data
  cosntructor(buffer, memoryDb, path) {
    this._buffer = buffer;
    this._memoryDb = memoryDb;
    this. path = path;
  }
}

function builder(path, environment) {
  // Take a path (string) and an environment (node, mobile, browser)
  // Return new Db()
  const buffer = bufferFromPath(path, environment);
  const memoryDb = bufferParser(buffer);
  return new Db(buffer, memoryDb, path);
}



function bufferFromPath(path, environment) {
  // return a class that extends Buffer and is an abstarction of a file so it that work in several envioronment
}

function bufferParser(buffer) {
  // take a buffer and return new MemoryDb()
}

function _parseHeader(buffer) {
  // Return head and tail byte position of a serilized db
  if (buffer.length < 24) {
    // sanity check head should be 24 byte
    throw new Errors.ParseHeaderInvalidInput();
  }
  const magic = buffer.slice(0,8).toString();
  if (magic !== 'KyVeKyVe') {
    // sanity check head should start with 8 byte magic number
    throw new Errors.ParseHeaderInvalidInput();
  }
  const head = buffer.slice(8,16).readIntBE(0,8);
  const tail = buffer.slice(16,24).readIntBE(0,8);
  return {head, tail};
}

module.exports._parseHeader = _parseHeader;
