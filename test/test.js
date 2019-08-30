"use strict";

let _7z = require('../index');

let test = require('ava');
let fs = require('fs-extra-promise');
let { join, basename } = require('path');

let src = __dirname;
let archPath = join(__dirname, 'pack.7z');
let destPath = join(__dirname, 'pack_dest');

test.serial('pack', async t => {
    // compress
    await t2p(cb => {
        _7z.pack(src, archPath, cb)
    });
    // verify
    let exists = await fs.existsAsync(archPath);
    t.true(exists);
});

test.serial('list', async t => {
    // list
    let content;

    await t2p((cb) => {
        _7z.list(archPath, cb);
    })
    .then(result => {
        content = result[0];
    });
    // verify
    let expectedAttr = ['D', 'A'];
    let expectedSize = ['0', '1888'];
    let expectedCompr = ['0', '685'];
    let expectedName = ['test', 'test/test.js'];

    t.is(content[0].attr, expectedAttr[0]);
    t.is(content[0].size, expectedSize[0]);
    t.is(content[0].compressed, expectedCompr[0]);
    t.is(content[0].name, expectedName[0]);

    t.is(content[1].attr, expectedAttr[1]);
    t.is(content[1].size, expectedSize[1]);
    t.is(content[1].compressed, expectedCompr[1]);
    t.is(content[1].name, expectedName[1]);
});

test.serial('unpack', async t => {
    // decompress
    await t2p(cb => {
        _7z.unpack(archPath, destPath, cb)
    });
    // verify
    let files = await fs.readdirAsync(destPath);
    let expected = [basename(src)];
    t.deepEqual(files, expected);
});

test.after.always('cleanup', async t => {
    await remove(destPath);
    await remove(archPath);
});

// util: remove file if exists
async function remove (file) {
    if (await fs.existsAsync(file)) {
        await fs.removeAsync(file)
    }
}

// util: thunk to promise
function t2p (thunk) {
    return new Promise((rs, rj) => {
        thunk((err, ...args) => {
            err ? rj(err) : rs(args)
        })
    })
}
