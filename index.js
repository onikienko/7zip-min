"use strict";

const spawn = require('child_process').spawn;
const path7za = require('7zip-bin').path7za;

/**
 * Unpack archive.
 * @param {string} pathToPack - path to archive you want to unpack.
 * @param {string} destPath - destination path. Where to unpack.
 * @param {function} cb - callback function. Will be called once unpack is done. If no errors, first parameter will contain `null`
 */
function unpack(pathToPack, destPath, cb) {
    run(path7za, ['x', pathToPack, '-y', '-o' + destPath], cb);
}

/**
 * Pack file or folder to archive.
 * @param {string} pathToSrc - path to file or folder you want to compress.
 * @param {string} pathToDest - path to archive you want to create.
 * @param {function} cb - callback function. Will be called once pack is done. If no errors, first parameter will contain `null`.
 */
function pack(pathToSrc, pathToDest, cb) {
    run(path7za, ['a', pathToDest, pathToSrc], cb);
}

/**
 * Get an array with compressed file contents.
 * @param {string} pathToSrc - path to file its content you want to list.
 * @param {function} cb - callback function. Will be called once list is done. If no errors, first parameter will contain `null`.
 */
function list(pathToSrc, cb) {
    run(path7za, ['l', pathToSrc], cb);
}

/**
 * Run 7za with parameters specified in `paramsArr`.
 * @param {array} paramsArr - array of parameter. Each array item is one parameter.
 * @param {function} cb - callback function. Will be called once command is done. If no errors, first parameter will contain `null`. If no output, second parameter will be `null`.
 */
function cmd(paramsArr, cb) {
    run(path7za, paramsArr, cb);
}

function run(bin, args, cb) {
    cb = onceify(cb);
    const proc = spawn(bin, args);
    let output = '';
    proc.on('error', function (err) {
        cb(err);
    });
    proc.on('exit', function (code) {
        let result = null;
        if (args[0] === 'l') {
            result = parseListCmd(output);
        }
        cb(code ? new Error('Exited with code ' + code) : null, result);
    });
    proc.stdout.on('data', (chunk) => {
        output += chunk.toString();
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

function parseListCmd(output) {
    const regex = /(?:(\d{4}-\d{2}-\d{2}) +(\d{2}:\d{2}:\d{2}) +((?:[D.]){1}(?:[R.]){1}(?:[H.]){1}(?:[S.]){1}(?:[A.]){1}) +(\d{1,12}) +(\d{1,12}) +(.+))\n*/g;
    let result = [];
    let m;
    while ((m = regex.exec(output)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        let date = "";
        let time = "";
        let attr = "";
        let size = 0;
        let compressed = 0;
        let name = "";

        m.forEach((match, groupIndex) => {
            switch (groupIndex) {
                case 1:
                    date = match;
                    break;
                case 2:
                    time = match;
                    break;
                case 3:
                    attr = match.replace(/\./g, '');
                    break;
                case 4:
                    size = match;
                    break;
                case 5:
                    compressed = match;
                    break;
                case 6:
                    name = match;

                    result.push({
                        date: date,
                        time: time,
                        attr: attr,
                        size: size,
                        compressed: compressed,
                        name: name,
                    });
                    break;
            }
        });
    }
    return result;
}

exports.unpack = unpack;
exports.pack = pack;
exports.list = list;
exports.cmd = cmd;
