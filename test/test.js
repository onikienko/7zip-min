'use strict';

const _7z = require('../src/index.js');
const test = require('ava');
const { remove, pathExists, mkdtemp, writeFile, readFile, ensureDir } = require('fs-extra');
const { join, relative } = require('path');

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

// Exercise special leading characters without changing the process working directory.
async function withArgumentTestDirectory(run, prefix = '-') {
  const dir = await mkdtemp(join(process.cwd(), prefix + '7zip-args-'));
  try {
    await run(dir, relative(process.cwd(), dir));
  } finally {
    await remove(dir);
  }
}

test.serial('argument handling: pack does not interpret a source as an include switch', async (t) => {
  await withArgumentTestDirectory(async (dir) => {
    const normal = join(dir, 'normal.txt');
    const secret = join(dir, 'CANARY_SECRET.txt');
    const controlArchive = join(dir, 'control.7z');
    const attackArchive = join(dir, 'attack.7z');
    await writeFile(normal, 'NORMAL FILE');
    await writeFile(secret, 'TEST SECRET - NOT REAL DATA');

    await _7z.pack(normal, controlArchive);
    t.deepEqual(
      (await _7z.list(controlArchive)).map((item) => item.name),
      ['normal.txt'],
    );

    // This path does not exist. It must not select the existing canary via -ir!.
    await t.throwsAsync(_7z.pack('-ir!' + secret, attackArchive));
    // 7za can create an empty archive even when it reports a missing input file.
    if (await pathExists(attackArchive)) {
      const entries = await _7z.list(attackArchive);
      t.false(entries.some((item) => item.name.includes('CANARY_SECRET.txt')));
    }
  });
});

for (const positional of ['source', 'archive']) {
  test.serial(`argument handling: pack accepts a leading-dash ${positional} path`, async (t) => {
    await withArgumentTestDirectory(async (dir, relativeDir) => {
      const source = join(dir, 'notes.txt');
      const archive = join(dir, 'archive.7z');
      await writeFile(source, 'LEADING DASH PATH');
      await _7z.pack(
        positional === 'source' ? join(relativeDir, 'notes.txt') : source,
        positional === 'archive' ? join(relativeDir, 'archive.7z') : archive,
      );
      const expectedName = positional === 'source' ? join(relativeDir, 'notes.txt') : 'notes.txt';
      t.deepEqual(
        (await _7z.list(archive)).map((item) => item.name),
        [expectedName],
      );
    });
  });
}

for (const operation of ['list', 'unpack', 'unpackSome']) {
  test.serial(`argument handling: ${operation} accepts a leading-dash archive path`, async (t) => {
    await withArgumentTestDirectory(async (dir, relativeDir) => {
      const source = join(dir, '-notes.txt');
      const other = join(dir, 'other.txt');
      const archive = join(dir, 'archive.7z');
      const destination = join(dir, 'output');
      await writeFile(source, 'LEADING DASH FILE');
      await writeFile(other, 'OTHER FILE');
      await _7z.pack(source, archive);
      await _7z.pack(other, archive);
      const relativeArchive = join(relativeDir, 'archive.7z');

      if (operation === 'list') {
        t.deepEqual((await _7z.list(relativeArchive)).map((item) => item.name).sort(), ['-notes.txt', 'other.txt']);
      } else {
        if (operation === 'unpackSome') {
          await _7z.unpackSome(relativeArchive, ['-notes.txt'], destination);
        } else {
          await _7z.unpack(relativeArchive, destination);
        }
        t.is(await readFile(join(destination, '-notes.txt'), 'utf8'), 'LEADING DASH FILE');
        t.is(await pathExists(join(destination, 'other.txt')), operation === 'unpack');
      }
    });
  });
}

test.serial('listfile handling: pack does not read source paths from a local listfile', async (t) => {
  await withArgumentTestDirectory(async (dir) => {
    const canary = join(dir, 'CANARY.txt');
    const listfile = join(dir, 'files.txt');
    const archive = join(dir, 'archive.7z');
    await writeFile(canary, 'DUMMY CANARY');
    await writeFile(listfile, canary + '\n');

    await t.throwsAsync(_7z.pack('@' + listfile, archive));
    if (await pathExists(archive)) {
      t.false((await _7z.list(archive)).some((item) => item.name.includes('CANARY.txt')));
    }
  });
});

test.serial('listfile handling: unpackSome does not read selectors from a local listfile', async (t) => {
  await withArgumentTestDirectory(async (dir) => {
    const canary = join(dir, 'CANARY.txt');
    const listfile = join(dir, 'selectors.txt');
    const archive = join(dir, 'archive.7z');
    const destination = join(dir, 'output');
    await writeFile(canary, 'DUMMY CANARY');
    await writeFile(listfile, 'CANARY.txt\n');
    await _7z.pack(canary, archive);

    await _7z.unpackSome(archive, ['@' + listfile], destination);
    t.false(await pathExists(join(destination, 'CANARY.txt')));
  });
});

test.serial('listfile handling: pack accepts a literal leading-at source path', async (t) => {
  await withArgumentTestDirectory(async (dir, relativeDir) => {
    const source = join(dir, '@notes.txt');
    const archive = join(dir, 'archive.7z');
    await writeFile(source, 'LITERAL AT PATH');
    await _7z.pack(join(relativeDir, '@notes.txt'), archive);
    t.deepEqual(
      (await _7z.list(archive)).map((item) => item.name),
      ['@notes.txt'],
    );
  }, '@');
});

test.serial('listfile handling: helpers accept a literal leading-at archive path', async (t) => {
  await withArgumentTestDirectory(async (dir, relativeDir) => {
    const source = join(dir, 'notes.txt');
    const archive = join(relativeDir, 'archive.7z');
    await writeFile(source, 'LITERAL AT ARCHIVE');
    await _7z.pack(source, archive);
    t.deepEqual(
      (await _7z.list(archive)).map((item) => item.name),
      ['notes.txt'],
    );
    const fullDestination = join(dir, 'full');
    const selectedDestination = join(dir, 'selected');
    await _7z.unpack(archive, fullDestination);
    await _7z.unpackSome(archive, ['notes.txt'], selectedDestination);
    t.is(await readFile(join(fullDestination, 'notes.txt'), 'utf8'), 'LITERAL AT ARCHIVE');
    t.is(await readFile(join(selectedDestination, 'notes.txt'), 'utf8'), 'LITERAL AT ARCHIVE');
  }, '@');
});

for (const [label, selectors] of [
  ['literal', ['@notes.txt']],
  ['wildcard', ['@*.txt']],
  ['mixed', ['@notes.txt', 'normal.txt']],
]) {
  test.serial(`listfile handling: unpackSome preserves ${label} leading-at selectors`, async (t) => {
    await withArgumentTestDirectory(async (dir) => {
      const source = join(dir, 'source');
      const nested = join(source, 'nested');
      const archive = join(dir, 'archive.7z');
      const destination = join(dir, 'output');
      await ensureDir(nested);
      await writeFile(join(nested, '@notes.txt'), 'LITERAL AT FILE');
      await writeFile(join(source, 'normal.txt'), 'NORMAL');
      await writeFile(join(source, 'unselected.txt'), 'UNSELECTED');
      await _7z.pack(source, archive);

      await _7z.unpackSome(archive, selectors, destination);
      t.is(await readFile(join(destination, 'source', 'nested', '@notes.txt'), 'utf8'), 'LITERAL AT FILE');
      t.is(await pathExists(join(destination, 'source', 'normal.txt')), label === 'mixed');
      t.false(await pathExists(join(destination, 'source', 'unselected.txt')));
    });
  });
}

for (const mode of ['promise', 'callback']) {
  test.serial(`input validation: invalid paths and selectors fail through the ${mode} API`, async (t) => {
    await withArgumentTestDirectory(async (dir) => {
      const oldConfig = _7z.getConfig();
      // Invalid inputs must fail validation, before even attempting to launch a binary.
      _7z.config({ binaryPath: join(dir, 'must-not-run') });
      const invalidValues = ['', undefined, null, false, 0, {}, [], ['normal.txt']];
      const cases = [];
      for (const value of invalidValues) {
        cases.push(
          ['pack', [value, 'archive.7z'], 'pathToSrc'],
          ['pack', ['normal.txt', value], 'pathToArch'],
          ['list', [value], 'pathToArch'],
          ['unpack', [value], 'pathToArch'],
          ['unpackSome', [value, ['normal.txt']], 'pathToArch'],
          ['unpackSome', ['archive.7z', [value]], 'filesToUnpack'],
        );
        if (value !== undefined && value !== '') {
          cases.push(
            ['unpack', ['archive.7z', value], 'destPath'],
            ['unpackSome', ['archive.7z', ['normal.txt'], value], 'destPath'],
          );
        }
      }
      cases.push(
        ['pack', [], 'pathToSrc'],
        ['pack', ['normal.txt'], 'pathToArch'],
        ['list', [], 'pathToArch'],
        ['unpack', [], 'pathToArch'],
        ['unpackSome', [], 'pathToArch'],
        ['unpackSome', ['archive.7z'], 'filesToUnpack'],
        ['unpackSome', ['archive.7z', new Array(1)], 'filesToUnpack'],
        ['unpackSome', ['archive.7z', ['normal.txt', '']], 'filesToUnpack'],
      );
      try {
        for (const [method, args, field] of cases) {
          if (mode === 'promise') {
            const error = await t.throwsAsync(_7z[method](...args), { instanceOf: TypeError });
            if (error) t.true(error.message.includes(field));
          } else {
            let calls = 0;
            const error = await new Promise((resolve) => {
              _7z[method](...args, (err) => {
                calls++;
                resolve(err);
              });
            });
            t.true(error instanceof TypeError);
            t.true(error.message.includes(field));
            t.is(calls, 1);
          }
        }
      } finally {
        _7z.config(oldConfig);
      }
    });
  });
}

test.serial('input validation: preserves spaces in filenames and allows an omitted destination', async (t) => {
  await withArgumentTestDirectory(async (dir, relativeDir) => {
    const name = ' notes.txt';
    const source = join(dir, name);
    const archive = join(dir, 'archive.7z');
    const destination = join(dir, ' output');
    await writeFile(source, 'SPACES ARE SIGNIFICANT');
    await _7z.pack(source, archive);
    await _7z.unpackSome(archive, [name], destination);
    t.is(await readFile(join(destination, name), 'utf8'), 'SPACES ARE SIGNIFICANT');

    // A relative input preserves its parent path, keeping default extraction inside this test directory.
    const relativeArchive = join(dir, 'relative.7z');
    await _7z.pack(join(relativeDir, name), relativeArchive);
    await remove(source);
    await _7z.unpack(relativeArchive, undefined);
    t.is(await readFile(source, 'utf8'), 'SPACES ARE SIGNIFICANT');
  });
});

for (const mode of ['promise', 'callback']) {
  test.serial(`input validation: extraction ${mode} API supports optional destinations`, async (t) => {
    await withArgumentTestDirectory(async (dir, relativeDir) => {
      const source = join(dir, 'notes.txt');
      const archive = join(dir, 'archive.7z');
      await writeFile(source, 'EXTRACTION CONTENT');
      await _7z.pack(join(relativeDir, 'notes.txt'), archive);
      for (const method of ['unpack', 'unpackSome']) {
        for (const destinationMode of ['omitted', 'undefined', 'empty', 'explicit']) {
          const args = method === 'unpack' ? [archive] : [archive, ['notes.txt']];
          let extracted = source;
          if (destinationMode === 'undefined') args.push(undefined);
          if (destinationMode === 'empty') args.push('');
          if (destinationMode === 'explicit') {
            const destination = join(dir, 'output');
            args.push(destination);
            extracted = join(destination, relativeDir, 'notes.txt');
          }
          await remove(extracted);
          const output =
            mode === 'promise'
              ? await _7z[method](...args)
              : await new Promise((resolve, reject) => {
                  _7z[method](...args, (err, result) => (err ? reject(err) : resolve(result)));
                });
          t.is(typeof output, 'string');
          t.is(await readFile(extracted, 'utf8'), 'EXTRACTION CONTENT');
        }
      }
    });
  });
}

test.after.always('cleanup', async () => {
  await remove(SRC_DIR_PATH);
  await remove(ARCH_PATH);
  await remove(UNPACK_PATH);
  await remove(UNPACK_IN_CURRENT_PATH);
});
