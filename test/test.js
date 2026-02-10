'use strict';

const _7z = require('../index');
const {glob} = require('glob');
const test = require('ava');
const {remove, pathExists} = require('fs-extra');
const {join, resolve} = require('path');

const SRC_DIR_NAME = 'testDir';
const SRC_DIR_PATH = join(__dirname, SRC_DIR_NAME);
const ARCH_PATH = join(__dirname, 'testDir.7z');
const UNPACK_PATH = join(__dirname, 'unpackDir');
const UNPACK_IN_CURRENT_PATH = join(process.cwd(), SRC_DIR_NAME);
const CUSTOM_BINARY_PATH = require('7zip-bin').path7za;     // we still use the path exported from 7zip-bin package - this is only to test the settings feature

const fsify = require('fsify')({
    cwd: __dirname,
});

const folderStructure = [
    {
        type: fsify.DIRECTORY,
        name: SRC_DIR_NAME,
        contents: [
            {
                type: fsify.DIRECTORY,
                name: 'dir1',
                contents: [
                    {
                        type: fsify.FILE,
                        name: 'Some = File = Name.txt',
                        contents: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vel odio nunc.',
                    },
                    {
                        type: fsify.FILE,
                        name: 'СлаваУкраїні!', // file name in non-latin characters (Ukrainian, cyrillic)
                        contents: 'Glory to Ukraine!',
                    },
                ],
            },
            {
                type: fsify.FILE,
                name: 'Brasileirão de Seleções.txt', // Portuguese, with accents
                contents: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            },
            {
                type: fsify.FILE,
                name: 'ウクライナ.txt',
            },
        ],
    },
];

test.before('create a folder', async () => {
    await fsify(folderStructure);
});

test.serial('pack', async t => {
    const output = (await t2p(cb => {
        _7z.pack(SRC_DIR_PATH, ARCH_PATH, cb);
    }))[0];
    const exists = await pathExists(ARCH_PATH);
    t.true(exists);
    t.is(typeof output, 'string');
});

test.serial('pack (async)', async t => {
    await remove(ARCH_PATH); // remove the archive created in previous tests
    t.false(await pathExists(ARCH_PATH)); // ensure that the archive does not exist

    const output = await _7z.pack(SRC_DIR_PATH, ARCH_PATH);
    const exists = await pathExists(ARCH_PATH);
    t.true(exists);
    t.is(typeof output, 'string');
});

test.serial('list', async t => {
    const result = (await t2p(cb => {
        _7z.list(ARCH_PATH, cb);
    }))[0];
    const names = result.map(el => el.name).sort();
    const expectedNames = getExpectedPathsFromStructure(folderStructure).sort();
    t.deepEqual(names, expectedNames, 'Listed file names do not match expected names.');
});

test.serial('list (async)', async t => {
    const result = await _7z.list(ARCH_PATH);
    const names = result.map(el => el.name).sort();
    const expectedNames = getExpectedPathsFromStructure(folderStructure).sort();
    t.deepEqual(names, expectedNames, 'Listed file names do not match expected names.');
});

test.serial('list with empty archive', async t => {
    const emptyArchPath = join(__dirname, 'empty.7z');
    await _7z.pack(join(__dirname, 'nonexistent*'), emptyArchPath);

    const result = await _7z.list(emptyArchPath);
    t.is(result.length, 0, 'Empty archive should return an empty array');

    await remove(emptyArchPath);
});

test.serial('unpack', async t => {
    const output = (await t2p(cb => {
        _7z.unpack(ARCH_PATH, UNPACK_PATH, cb);
    }))[0];
    const unpackSrcPath = join(UNPACK_PATH, SRC_DIR_NAME);
    t.deepEqual(...await getFilesList(unpackSrcPath));
    t.is(typeof output, 'string');
});

test.serial('unpack (async)', async t => {
    await remove(UNPACK_PATH);
    t.false(await pathExists(UNPACK_PATH));

    const output = await _7z.unpack(ARCH_PATH, UNPACK_PATH);
    const unpackSrcPath = join(UNPACK_PATH, SRC_DIR_NAME);
    t.deepEqual(...await getFilesList(unpackSrcPath));
    t.is(typeof output, 'string');
});

test.serial('unpack to the current path', async t => {
    const output = (await t2p(cb => {
        _7z.unpack(ARCH_PATH, cb);
    }))[0];
    t.deepEqual(...await getFilesList(UNPACK_IN_CURRENT_PATH));
    t.is(typeof output, 'string');
});

test.serial('unpack to the current path (async)', async t => {
    await remove(UNPACK_IN_CURRENT_PATH);
    t.false(await pathExists(UNPACK_IN_CURRENT_PATH));

    const output = await _7z.unpack(ARCH_PATH);
    t.deepEqual(...await getFilesList(UNPACK_IN_CURRENT_PATH));
    t.is(typeof output, 'string');
});

test.serial('unpackSome', async t => {
    await remove(UNPACK_PATH);
    t.false(await pathExists(UNPACK_PATH));

    const filesToExtract = ['Some = File = Name.txt', 'Brasileirão de Seleções.txt'];

    const output = (await t2p(cb => {
        _7z.unpackSome(ARCH_PATH, filesToExtract, UNPACK_PATH, cb);
    }))[0];

    // Check if the specific files were extracted
    t.true(await pathExists(join(UNPACK_PATH, SRC_DIR_NAME, 'dir1', 'Some = File = Name.txt')));
    t.true(await pathExists(join(UNPACK_PATH, SRC_DIR_NAME, 'Brasileirão de Seleções.txt')));

    // Check that other files were NOT extracted
    t.false(await pathExists(join(UNPACK_PATH, SRC_DIR_NAME, 'dir1', 'СлаваУкраїні!')));
    t.false(await pathExists(join(UNPACK_PATH, SRC_DIR_NAME, 'ウクライナ.txt')));

    t.is(typeof output, 'string');
});

test.serial('unpackSome (async)', async t => {
    // Clean up unpack directory
    await remove(UNPACK_PATH);
    t.false(await pathExists(UNPACK_PATH));

    // Select different files to extract
    const filesToExtract = ['СлаваУкраїні!', 'ウクライナ.txt'];

    const output = await _7z.unpackSome(ARCH_PATH, filesToExtract, UNPACK_PATH);

    // Check if the specific files were extracted
    t.true(await pathExists(join(UNPACK_PATH, SRC_DIR_NAME, 'dir1', 'СлаваУкраїні!')));
    t.true(await pathExists(join(UNPACK_PATH, SRC_DIR_NAME, 'ウクライナ.txt')));

    // Check that other files were NOT extracted
    t.false(await pathExists(join(UNPACK_PATH, SRC_DIR_NAME, 'dir1', 'Some = File = Name.txt')));
    t.false(await pathExists(join(UNPACK_PATH, SRC_DIR_NAME, 'Brasileirão de Seleções.txt')));

    t.is(typeof output, 'string');
});

test.serial('unpackSome to the current path', async t => {
    // Clean up any previous extraction in the current directory
    await remove(UNPACK_IN_CURRENT_PATH);
    t.false(await pathExists(UNPACK_IN_CURRENT_PATH));

    const filesToExtract = ['dir1'];  // Extract entire directory

    const output = (await t2p(cb => {
        _7z.unpackSome(ARCH_PATH, filesToExtract, cb);
    }))[0];

    // Check that dir1 and its contents were extracted
    t.true(await pathExists(join(UNPACK_IN_CURRENT_PATH, 'dir1')));
    t.true(await pathExists(join(UNPACK_IN_CURRENT_PATH, 'dir1', 'Some = File = Name.txt')));
    t.true(await pathExists(join(UNPACK_IN_CURRENT_PATH, 'dir1', 'СлаваУкраїні!')));

    // Check that other files at the root level were NOT extracted
    t.false(await pathExists(join(UNPACK_IN_CURRENT_PATH, 'Brasileirão de Seleções.txt')));
    t.false(await pathExists(join(UNPACK_IN_CURRENT_PATH, 'ウクライナ.txt')));

    t.is(typeof output, 'string');
});

test.serial('unpackSome to the current path (async)', async t => {
    // Clean up any previous extraction
    await remove(UNPACK_IN_CURRENT_PATH);
    t.false(await pathExists(UNPACK_IN_CURRENT_PATH));

    // Extract a specific file with wildcard pattern
    const filesToExtract = ['*.txt'];

    const output = await _7z.unpackSome(ARCH_PATH, filesToExtract);

    // txt files should be extracted
    t.true(await pathExists(join(UNPACK_IN_CURRENT_PATH, 'Brasileirão de Seleções.txt')));
    t.true(await pathExists(join(UNPACK_IN_CURRENT_PATH, 'ウクライナ.txt')));
    t.true(await pathExists(join(UNPACK_IN_CURRENT_PATH, 'dir1', 'Some = File = Name.txt')));

    t.false(await pathExists(join(UNPACK_IN_CURRENT_PATH, 'dir1', 'СлаваУкраїні!')));

    t.is(typeof output, 'string');
});

test.serial('unpackSome throws if filesToUnpack is not an array', async t => {
    const error = await t.throwsAsync(async () => {
        await _7z.unpackSome(ARCH_PATH, 'not-an-array', UNPACK_PATH);
    });
    t.is(error.message, 'filesToUnpack must be an array');
});

test.serial('unpackSome throws if filesToUnpack is empty', async t => {
    const error = await t.throwsAsync(async () => {
        await _7z.unpackSome(ARCH_PATH, [], UNPACK_PATH);
    });
    t.is(error.message, 'No files to unpack specified');
});

test.serial('pack with "cmd"', async t => {
    // remove the archive created in previous tests
    await remove(ARCH_PATH);
    // check that the archive does not exist
    t.false(await pathExists(ARCH_PATH));

    const output = (await t2p(cb => {
        _7z.cmd(['a', ARCH_PATH, SRC_DIR_PATH], cb);
    }))[0];
    const exists = await pathExists(ARCH_PATH);
    t.true(exists);
    t.is(typeof output, 'string');
});

test.serial('pack with "cmd" (async)', async t => {
    await remove(ARCH_PATH);
    t.false(await pathExists(ARCH_PATH));

    const output = await _7z.cmd(['a', ARCH_PATH, SRC_DIR_PATH]);
    const exists = await pathExists(ARCH_PATH);
    t.true(exists);
    t.is(typeof output, 'string');
});

test.serial('pack a path that does not exist', async t => {
    const wrongPath = join(__dirname, 'noPath');
    const error = await t.throwsAsync(async () => {
        await t2p(cb => {
            _7z.pack(join(wrongPath), ARCH_PATH, cb);
        });
    });
    // the error output should contain a wrong path
    const hasWrongPathMentioning = error.message.includes(wrongPath);
    t.true(hasWrongPathMentioning);
});

test.serial('pack a path that does not exist (async)', async t => {
    const wrongPath = join(__dirname, 'noPathAsync');
    const error = await t.throwsAsync(async () => {
        await _7z.pack(join(wrongPath), ARCH_PATH);
    });
    const hasWrongPathMentioning = error.message.includes(wrongPath);
    t.true(hasWrongPathMentioning);
});

test.serial('custom binary path that does not exist', async t => {
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

test.serial('custom binary path that exists', async t => {
    const oldSettings = _7z.getConfig();
    _7z.config({
        binaryPath: CUSTOM_BINARY_PATH
    });
    const output =  await _7z.unpack(ARCH_PATH, UNPACK_PATH);
    _7z.config(oldSettings);
    const unpackSrcPath = join(UNPACK_PATH, SRC_DIR_NAME);
    t.deepEqual(...await getFilesList(unpackSrcPath));
    t.is(typeof output, 'string');
});

test.after.always('cleanup', async () => {
    await remove(SRC_DIR_PATH);
    await remove(ARCH_PATH);
    await remove(UNPACK_PATH);
    await remove(UNPACK_IN_CURRENT_PATH);
});

// get a list of paths for unpackSrcPath and for SRC_DIR_PATH to be compared
async function getFilesList(unpackSrcPath) {
    const normalizePath = (path) => resolve(path).normalize('NFC');
    const unpackedFiles = (await glob(unpackSrcPath + '/**/*'))
        .map(p => normalizePath(p).replace(unpackSrcPath, ''));

    const sourceFiles = (await glob(SRC_DIR_PATH + '/**/*'))
        .map(p => normalizePath(p).replace(SRC_DIR_PATH, ''));

    return [unpackedFiles, sourceFiles];
}

/**
 * Recursively generates a flat list of expected paths from the fsify structure.
 * @param {Array} items - The array of fsify structure items (files/directories).
 * @param {string} parentPath - The path of the parent directory.
 * @returns {Array<string>} A flat list of relative paths.
 */
function getExpectedPathsFromStructure(items, parentPath = '') {
    let paths = [];
    for (const item of items) {
        const currentPath = parentPath ? join(parentPath, item.name) : item.name;
        paths.push(currentPath);
        if (item.type === fsify.DIRECTORY && item.contents && item.contents.length > 0) {
            paths = paths.concat(getExpectedPathsFromStructure(item.contents, currentPath));
        }
    }
    return paths;
}

// util: thunk to promise
function t2p(thunk) {
    return new Promise((rs, rj) => {
        thunk((err, ...args) => {
            err ? rj(err) : rs(args);
        });
    });
}
