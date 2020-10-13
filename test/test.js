"use strict";

let _7z = require('../index');

let test = require('ava');
let fs = require('fs-extra-promise');
let {join, basename, normalize} = require('path');

let srcFolder = join(__dirname, 'test-folder');
let srcFile = join(srcFolder, 'test-file.txt');
let archPath = join(__dirname, 'pack.7z');
let destPath = join(__dirname, 'pack_dest');

let srcFolder1 = join(__dirname, "test-folder1");
let srcFile1 = join(srcFolder1, "test-file.txt");
let archPath1 = join(__dirname, "pack1.7z");
let destPath1 = join(process.cwd(), "test-folder1");

test.serial('pack', async t => {
    // compress
    await t2p(cb => {
        _7z.pack(srcFolder, archPath, cb)
    });
    // verify
    let exists = await fs.existsAsync(archPath);
    t.true(exists);
});

test.serial('list', async t => {
    // list
    let content = (await t2p((cb) => {
        _7z.list(archPath, cb);
    }))[0];

    // verify
    let expectedName = ['test-folder', 'test-folder/test-file.txt'];
    let expectedAttr = ['D', 'A'];
    let expectedSize = ['0', fs.statSync(srcFile)['size'].toString()];
    // let expectedCompr = ['0', '685'];

    t.is(content[0].attr, expectedAttr[0]);
    t.is(content[0].size, expectedSize[0]);
    // t.is(content[0].compressed, expectedCompr[0]);
    t.is(content[0].name, expectedName[0]);

    t.is(content[1].attr, expectedAttr[1]);
    t.is(content[1].size, expectedSize[1]);
    // t.is(content[1].compressed, expectedCompr[1]);
    t.is(normalize(content[1].name), normalize(expectedName[1]));
});

test.serial('unpack', async t => {
    // decompress
    await t2p(cb => {
        _7z.unpack(archPath, destPath, cb)
    });
    // verify
    let files = await fs.readdirAsync(destPath);
    let expected = [basename(srcFolder)];
    t.deepEqual(files, expected);
});

test.serial("unpack_to_current_path", async (t) => {
    // decompress
    await fs.copyAsync(srcFolder, srcFolder1);
    await t2p((cb) => {
        _7z.pack(srcFolder1, archPath1, cb);
    });
    await fs.removeAsync(srcFolder1);
    await t2p((cb) => {
        _7z.unpack(archPath1, cb);
    });
    // verify
    let exists = await fs.existsAsync(destPath1);
    t.true(exists);
    let files = await fs.readdirAsync(destPath1);
    let expected = [basename(srcFile1)];
    t.deepEqual(files, expected);

});

test.after.always('cleanup', async t => {
    await remove(destPath);
    await remove(archPath);
    await remove(destPath1);
    await remove(archPath1);
});

// util: remove file if exists
async function remove(file) {
    if (await fs.existsAsync(file)) {
        await fs.removeAsync(file)
    }
}

// util: thunk to promise
function t2p(thunk) {
    return new Promise((rs, rj) => {
        thunk((err, ...args) => {
            err ? rj(err) : rs(args)
        })
    })
}
