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

test.after('cleanup', async t => {
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
