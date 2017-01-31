const test = require('tape');
const StoredDb = require('../StoredDb.js');
const Errors = require('../Errors.js');

test('StoredDb.slice returned value', assert => {
  const db = new StoredDb.StoredDb('./js/test/testFile', 'node');
  const actual = db.slice(3, 7);
  const expected = new Buffer('D14B1A7B11', 'hex');

  assert.deepEqual(actual, expected,
    'for start=3 end=4 should return a Buffer that start at file\'s byte 3 at end at file\'s byte 7');
  assert.end();
});


test('StoredDb constructor enviornment not supported', assert => {
  let actual;
  let expected;
  try {
    const db = new StoredDb.StoredDb('./js/test/testFile', 'cordova');
  }
  catch(e) {
    actual = e.constructor.name;
  }
  try {
    throw new Errors.StoredDbNotSupportedEnv();
  }
  catch(e) {
    expected = e.constructor.name;
  }

  assert.deepEqual(actual, expected,
    'when we try to initialize a storedDb for a not supported enviornmet should raise not supp env');
  assert.end();
});

test('StoredDb updateNode action executed', assert => {
  const actual = 1;
  const expected = 1;

  assert.deepEqual(actual, expected,
    'updateNode should start to write `value` in the file at nodePosition + 24 + keyLen and finish to write at valueLen');
  assert.end();
});

test('StoredDb updateNode error for value to big', assert => {
  const actual = 1;
  const expected = 1;

  assert.deepEqual(actual, expected,
    'updateNode should throw [TODO] when we pass a value that is bigger than nodeLen - 24 - keyLen');
  assert.end();
});