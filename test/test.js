'use strict';

const _7z = require('../index');
const glob = require('glob');

const test = require('ava');
const fs = require('fs-extra-promise');
const {join, normalize} = require('path');

const SRC_DIR_NAME = 'testDir';
const SRC_DIR_PATH = join(__dirname, SRC_DIR_NAME);
const ARCH_PATH = join(__dirname, 'testDir.7z');
const UNPACK_PATH = join(__dirname, 'unpackDir');
const UNPACK_IN_CURRENT_PATH = join(process.cwd(), SRC_DIR_NAME);

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
                        name: 'testDir_dir1_file1.txt',
                        contents: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vel odio nunc.',
                    },
                    {
                        type: fsify.FILE,
                        name: 'testDir_dir1_file2.txt',
                        contents: 'Lorem ipsum dolor sit amet.',
                    },
                ],
            },
            {
                type: fsify.FILE,
                name: 'testDir_file1.txt',
                contents: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            },
            {
                type: fsify.FILE,
                name: 'testDir_file2_empty.txt',
            },
        ],
    },
];

test.before('create a folder', async t => {
    await fsify(folderStructure);
});

test.serial('pack', async t => {
    await t2p(cb => {
        _7z.pack(SRC_DIR_PATH, ARCH_PATH, cb);
    });
    const exists = await fs.existsAsync(ARCH_PATH);
    t.true(exists);
});

test.serial('list', async t => {
    const content = (await t2p(cb => {
        _7z.list(ARCH_PATH, cb);
    }))[0];
    t.is(content.length, 6);
});

test.serial('unpack', async t => {
    await t2p(cb => {
        _7z.unpack(ARCH_PATH, UNPACK_PATH, cb);
    });

    const unpackSrcPath = join(UNPACK_PATH, SRC_DIR_NAME);
    t.deepEqual(...await getFilesList(unpackSrcPath));
});

test.serial('unpack to current path', async t => {
    await t2p(cb => {
        _7z.unpack(ARCH_PATH, cb);
    });

    t.deepEqual(...await getFilesList(UNPACK_IN_CURRENT_PATH));
});

test.serial('pack with "cmd"', async t => {
    // remove archive created in previous tests
    await remove(ARCH_PATH);
    // check that archive does not exist
    t.false(await fs.existsAsync(ARCH_PATH));

    await t2p(cb => {
        _7z.cmd(['a', ARCH_PATH, SRC_DIR_PATH], cb);
    });

    const exists = await fs.existsAsync(ARCH_PATH);
    t.true(exists);
});

test.after.always('cleanup', async t => {
    await remove(SRC_DIR_PATH);
    await remove(ARCH_PATH);
    await remove(UNPACK_PATH);
    await remove(UNPACK_IN_CURRENT_PATH);
});

// get list of paths for unpackSrcPath and for SRC_DIR_PATH to be compared
async function getFilesList(unpackSrcPath) {
    const unpackedFiles = (await t2p(cb => {
        glob(unpackSrcPath + '/**/*', cb);
    }))[0].map(p => normalize(p).replace(unpackSrcPath, ''));

    const sourceFiles = (await t2p(cb => {
        glob(SRC_DIR_PATH + '/**/*', cb);
    }))[0].map(p => normalize(p).replace(SRC_DIR_PATH, ''));

    return [unpackedFiles, sourceFiles];
}

// util: remove file if exists
async function remove(file) {
    if (await fs.existsAsync(file)) {
        await fs.removeAsync(file);
    }
}

// util: thunk to promise
function t2p(thunk) {
    return new Promise((rs, rj) => {
        thunk((err, ...args) => {
            err ? rj(err) : rs(args);
        });
    });
}
