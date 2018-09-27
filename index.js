"use strict";

const spawn = require('child_process').spawn;
const path7za = require('7zip-bin').path7za;

function unpack(pathToPack, destPath, cb) {
    run(path7za, ['x', pathToPack, '-y', '-o' + destPath], cb);
}

function pack(pathToSrc, pathToDest, cb) {
    run(path7za, ['a', pathToDest, pathToSrc], cb);
}

function run(bin, args, cb) {
    cb = onceify(cb);
    const proc = spawn(bin, args);
    proc.on('error', function (err) {
        cb(err);
    });
    proc.on('exit', function (code) {
        cb(code ? new Error('Exited with code ' + code) : null);
    });
}

// http://stackoverflow.com/questions/30234908/javascript-v8-optimisation-and-leaking-arguments
// javascript V8 optimisation and “leaking arguments”
// making callback to be invoked only once
function onceify(fn) {
    let called = false;
    return function () {
        if (called) return;
        called = true;
        fn.apply(this, Array.prototype.slice.call(arguments)) // slice arguments
    }
}

exports.unpack = unpack;
exports.pack = pack;
