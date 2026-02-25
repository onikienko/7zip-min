'use strict';

const _7z = require('../src/index.js');
const test = require('ava');
const { remove, pathExists } = require('fs-extra');
const { join } = require('path');

const {
  SRC_DIR_NAME,
  SRC_DIR_PATH,
  ARCH_PATH,
  UNPACK_PATH,
  UNPACK_IN_CURRENT_PATH,
  CUSTOM_BINARY_PATH,
  getFilesList,
  getExpectedPathsFromStructure,
} = require('./helpers');

const fsify = require('fsify')({
  cwd: __dirname,
});

const makeFolderStructure = require('./fixtures');
const folderStructure = makeFolderStructure(fsify);

test.before('create a folder', async () => {
  await fsify(folderStructure);
});

test.serial('pack', async (t) => {
  const output = await _7z.pack(SRC_DIR_PATH, ARCH_PATH);
  const exists = await pathExists(ARCH_PATH);
  t.true(exists);
  t.is(typeof output, 'string');
});

// Universal wrapper sanity test: ensure Promise form works
test.serial('universalCall - promise', async (t) => {
  await remove(ARCH_PATH);
  t.false(await pathExists(ARCH_PATH));

  const p = _7z.pack(SRC_DIR_PATH, ARCH_PATH);
  t.truthy(p && typeof p.then === 'function');
  await p;
  t.true(await pathExists(ARCH_PATH));
});

// Additionally verify the callback form of the universal wrapper (success)
test.serial('universalCall - callback (success)', async (t) => {
  await remove(ARCH_PATH);
  t.false(await pathExists(ARCH_PATH));

  const out = await new Promise((resolve, reject) => {
    _7z.pack(SRC_DIR_PATH, ARCH_PATH, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });

  t.is(typeof out, 'string');
  t.true(await pathExists(ARCH_PATH));
});

// verify the callback error path (ensure errors are delivered via callback)
test.serial('universalCall - callback (error)', async (t) => {
  const wrongPath = join(__dirname, 'this-path-does-not-exist-for-callback-test');

  const err = await new Promise((resolve) => {
    _7z.pack(wrongPath, ARCH_PATH, (e /*, res */) => {
      resolve(e);
    });
  });
  t.true(err instanceof Error, 'Expected an Error instance to be passed to the callback for invalid path');
});

test.serial('list', async (t) => {
  const result = await _7z.list(ARCH_PATH);
  const names = result.map((el) => el.name).sort();
  const expectedNames = getExpectedPathsFromStructure(folderStructure).sort();
  t.deepEqual(names, expectedNames, 'Listed file names do not match expected names.');

  // Detailed check for one specific file
  const targetFile = join('testDir', 'Brasileirão de Seleções.txt');
  const fileInfo = result.find((el) => el.name === targetFile);

  t.truthy(fileInfo, `File ${targetFile} should be in the list`);
  t.is(fileInfo.size, '56', 'File size should match the content length');
  t.truthy(fileInfo.attr, 'Attributes should be present');
  t.regex(fileInfo.date, /^\d{4}[-/.]\d{2}[-/.]\d{2}$/, 'Date should be in YYYY-MM-DD format (or similar)');
  t.regex(fileInfo.time, /^\d{2}:\d{2}:\d{2}(\.\d+)?$/, 'Time should be in HH:MM:SS format (or similar)');
  t.truthy(fileInfo.compressed, 'Compressed size should be present');
  t.truthy(fileInfo.method, 'Compression method should be present');
});

test.serial('list with empty archive', async (t) => {
  const emptyArchPath = join(__dirname, 'empty.7z');
  await _7z.pack(join(__dirname, 'nonexistent*'), emptyArchPath);

  const result = await _7z.list(emptyArchPath);
  t.is(result.length, 0, 'Empty archive should return an empty array');

  await remove(emptyArchPath);
});

test.serial('unpack', async (t) => {
  const output = await _7z.unpack(ARCH_PATH, UNPACK_PATH);
  const unpackSrcPath = join(UNPACK_PATH, SRC_DIR_NAME);
  t.deepEqual(...(await getFilesList(unpackSrcPath)));
  t.is(typeof output, 'string');
});

test.serial('unpack to the current path', async (t) => {
  const output = await _7z.unpack(ARCH_PATH);
  t.deepEqual(...(await getFilesList(UNPACK_IN_CURRENT_PATH)));
  t.is(typeof output, 'string');
});

test.serial('unpackSome', async (t) => {
  await remove(UNPACK_PATH);
  t.false(await pathExists(UNPACK_PATH));

  const filesToExtract = ['Some = File = Name.txt', 'Brasileirão de Seleções.txt'];

  const output = await _7z.unpackSome(ARCH_PATH, filesToExtract, UNPACK_PATH);

  // Check if the specific files were extracted
  t.true(await pathExists(join(UNPACK_PATH, SRC_DIR_NAME, 'dir1', 'Some = File = Name.txt')));
  t.true(await pathExists(join(UNPACK_PATH, SRC_DIR_NAME, 'Brasileirão de Seleções.txt')));

  // Check that other files were NOT extracted
  t.false(await pathExists(join(UNPACK_PATH, SRC_DIR_NAME, 'dir1', '-СлаваУкраїні!')));
  t.false(await pathExists(join(UNPACK_PATH, SRC_DIR_NAME, 'ウクライナ.txt')));

  t.is(typeof output, 'string');
});

// ensure that filename which starts with `-` not interpreted as a switch
test.serial('unpackSome filename which starts with `-`', async (t) => {
  await remove(UNPACK_PATH);
  t.false(await pathExists(UNPACK_PATH));

  const filesToExtract = ['-СлаваУкраїні!'];
  const output = await _7z.unpackSome(ARCH_PATH, filesToExtract, UNPACK_PATH);
  t.true(await pathExists(join(UNPACK_PATH, SRC_DIR_NAME, 'dir1', '-СлаваУкраїні!')));
  t.is(typeof output, 'string');
});

test.serial('unpackSome to the current path', async (t) => {
  await remove(UNPACK_IN_CURRENT_PATH);
  t.false(await pathExists(UNPACK_IN_CURRENT_PATH));

  const filesToExtract = ['dir1']; // Extract entire directory

  const output = await _7z.unpackSome(ARCH_PATH, filesToExtract);

  // Check that dir1 and its contents were extracted
  t.true(await pathExists(join(UNPACK_IN_CURRENT_PATH, 'dir1')));
  t.true(await pathExists(join(UNPACK_IN_CURRENT_PATH, 'dir1', 'Some = File = Name.txt')));
  t.true(await pathExists(join(UNPACK_IN_CURRENT_PATH, 'dir1', '-СлаваУкраїні!')));

  // Check that other files at the root level were NOT extracted
  t.false(await pathExists(join(UNPACK_IN_CURRENT_PATH, 'Brasileirão de Seleções.txt')));
  t.false(await pathExists(join(UNPACK_IN_CURRENT_PATH, 'ウクライナ.txt')));

  t.is(typeof output, 'string');
});

test.serial('unpackSome with wildcard patterns to the current path', async (t) => {
  await remove(UNPACK_IN_CURRENT_PATH);
  t.false(await pathExists(UNPACK_IN_CURRENT_PATH));

  // Extract a specific file with wildcard pattern
  const filesToExtract = ['*.txt'];

  const output = await _7z.unpackSome(ARCH_PATH, filesToExtract);

  // txt files should be extracted
  t.true(await pathExists(join(UNPACK_IN_CURRENT_PATH, 'Brasileirão de Seleções.txt')));
  t.true(await pathExists(join(UNPACK_IN_CURRENT_PATH, 'ウクライナ.txt')));
  t.true(await pathExists(join(UNPACK_IN_CURRENT_PATH, 'dir1', 'Some = File = Name.txt')));

  t.false(await pathExists(join(UNPACK_IN_CURRENT_PATH, 'dir1', '-СлаваУкраїні!')));

  t.is(typeof output, 'string');
});

test.serial('unpackSome throws if filesToUnpack is not an array', async (t) => {
  const error = await t.throwsAsync(async () => {
    await _7z.unpackSome(ARCH_PATH, 'not-an-array', UNPACK_PATH);
  });
  t.is(error.message, 'filesToUnpack must be an array');
});

test.serial('unpackSome throws if filesToUnpack is empty', async (t) => {
  const error = await t.throwsAsync(async () => {
    await _7z.unpackSome(ARCH_PATH, [], UNPACK_PATH);
  });
  t.is(error.message, 'No files to unpack specified');
});

test.serial('pack with "cmd"', async (t) => {
  await remove(ARCH_PATH);
  t.false(await pathExists(ARCH_PATH));

  const output = await _7z.cmd(['a', ARCH_PATH, SRC_DIR_PATH]);
  const exists = await pathExists(ARCH_PATH);
  t.true(exists);
  t.is(typeof output, 'string');
});

test.serial('pack a path that does not exist', async (t) => {
  const wrongPath = join(__dirname, 'noPath');
  const error = await t.throwsAsync(async () => {
    await _7z.pack(join(wrongPath), ARCH_PATH);
  });
  // the error output should contain a wrong path
  const hasWrongPathMentioning = error.stderr.includes(wrongPath);
  t.true(hasWrongPathMentioning);
});

test.serial('custom binary path that does not exist', async (t) => {
  const oldSettings = _7z.getConfig();
  _7z.config({
    binaryPath: '**/wrong/path/to/7z**',
  });
  const error = await t.throwsAsync(async () => {
    await _7z.unpack(ARCH_PATH, UNPACK_PATH);
  });
  _7z.config(oldSettings);
  t.true(error.message.includes('ENOENT'));
});

test.serial('custom binary path that exists', async (t) => {
  const oldSettings = _7z.getConfig();
  _7z.config({
    binaryPath: CUSTOM_BINARY_PATH,
  });
  const output = await _7z.unpack(ARCH_PATH, UNPACK_PATH);
  _7z.config(oldSettings);
  const unpackSrcPath = join(UNPACK_PATH, SRC_DIR_NAME);
  t.deepEqual(...(await getFilesList(unpackSrcPath)));
  t.is(typeof output, 'string');
});

test.serial('config throws when passed a non-object', (t) => {
  const badInputs = [null, undefined, 'string', 123, [], true];
  for (const inp of badInputs) {
    t.throws(() => _7z.config(inp), { instanceOf: TypeError });
  }
});

test.serial('config throws when binaryPath property is present but invalid', (t) => {
  t.throws(() => _7z.config({ binaryPath: null }), { instanceOf: TypeError });
  t.throws(() => _7z.config({ binaryPath: '' }), { instanceOf: TypeError });
  t.throws(() => _7z.config({ binaryPath: 123 }), { instanceOf: TypeError });
});

test.serial('config accepts a valid binaryPath and getConfig reflects it', (t) => {
  const old = _7z.getConfig();
  _7z.config({ binaryPath: CUSTOM_BINARY_PATH });
  const updated = _7z.getConfig();
  t.is(updated.binaryPath, CUSTOM_BINARY_PATH);
  // restore
  _7z.config(old);
});

test.serial('error object contains code, stdout, and stderr', async (t) => {
  const wrongPath = join(__dirname, 'noPath.7z');
  const error = await t.throwsAsync(async () => {
    await _7z.list(wrongPath);
  });
  t.is(typeof error.code, 'number');
  t.true(error.code !== 0);
  t.is(typeof error.stdout, 'string');
  t.is(typeof error.stderr, 'string');
  t.true(error.stderr.length > 0);
});

test.after.always('cleanup', async () => {
  await remove(SRC_DIR_PATH);
  await remove(ARCH_PATH);
  await remove(UNPACK_PATH);
  await remove(UNPACK_IN_CURRENT_PATH);
});
