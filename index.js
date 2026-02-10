'use strict';

const { promisify } = require('util');
const { spawn } = require('child_process');
const { path7za } = require('7zip-bin');


/**
 * Get the default binary path.
 * @returns {string}
 */
function getDefaultBinaryPath() {
    // Handling `path7za` in case of usage inside electron app
    // More details -
    // https://github.com/sindresorhus/electron-util/blob/6c37341e43cdaa890e9145d6065f14b864c8befc/source/node/index.ts#L38
    const isUsingAsar = 'electron' in process.versions
        && process.argv.length > 1
        && process.argv[1].includes('app.asar');

    return isUsingAsar ? path7za.replace('app.asar', 'app.asar.unpacked') : path7za;
}

/**
 * @typedef {Object} ConfigSettings
 * @property {string | undefined} binaryPath - path to binary `7za` or `7za.exe`
 */

// Default config settings
const configSettings = {
    binaryPath: getDefaultBinaryPath()
}

/**
 * Get current configuration settings.
 * @returns {ConfigSettings} cfg - configuration settings.
 */
function getConfig() {
    // spread operator is good until the structure does not contain nested objects
    return {...configSettings};
}

/**
 * Change configuration settings.
 * @param {ConfigSettings} cfg - configuration settings.
 */
function config(cfg) {
    Object.assign(configSettings, cfg);
}


/**
 * @typedef {Object} ListItem
 * @property {string} name - path to file/dir
 * @property {string} size - size
 * @property {string} compressed - packed size
 * @property {string} date - modified date
 * @property {string} time - modified time
 * @property {string} attr - attributes
 * @property {string} crc - CRC
 * @property {string} encrypted - encrypted
 * @property {string} method - compression method
 * @property {string} block - block
 */

/**
 * @callback callbackFn
 * @param {Error|null} err - error object. Will be `null` if no errors.
 * @param {string} [output] - output of the 7z command execution if no errors
 * @returns {void}
 */

/**
 * @callback listCallbackFn
 * @param {Error|null} err - error object. Will be `null` if no errors.
 * @param {ListItem[]} [output] - result of list command execution if no errors
 * @returns {void}
 */

/**
 * Helper to handle optional destination path and callback adjustment.
 * @param {string[]} args - The arguments array to push to.
 * @param {string|function} destPathOrCb - Destination path or callback.
 * @param {function} [cb] - Callback.
 * @returns {function} The resolved callback.
 */
function resolveOptionalDest(args, destPathOrCb, cb) {
    let destPath = destPathOrCb;
    if (typeof destPathOrCb === 'function' && cb === undefined) {
        cb = destPathOrCb;
        destPath = undefined;
    }
    if (destPath) {
        args.push('-o' + destPath);
    }
    return cb;
}

/**
 * Unpack archive.
 * @param {string} pathToArch - path to archive you want to unpack.
 * @param {string|callbackFn} destPathOrCb - Either:
 * - (i) destination path, where to unpack.
 * - (ii) callback function, in case no destPath to be specified
 * @param {callbackFn} [cb] - callback function. Will be called once unpack is done. If no errors, first parameter will contain `null`
 *
 * NOTE: Providing a destination path is optional. In case it is not provided, cb is expected as the second argument to function.
 */
function unpack(pathToArch, destPathOrCb, cb) {
    const args = ['x', pathToArch, '-y'];
    cb = resolveOptionalDest(args, destPathOrCb, cb);
    run(args, cb);
}

/**
 * Unpack a specific file (or files) from an archive, recursively.
 * @param {string} pathToArch - path to archive you want to unpack.
 * @param {string[]} filesToUnpack - array of file/directory names to unpack from the archive.
 * @param {string|callbackFn} destPathOrCb - Either:
 * - (i) destination path, where to unpack.
 * - (ii) callback function, in case no destPath to be specified
 * @param {callbackFn} [cb] - callback function. Will be called once unpack is done. If no errors, first parameter will contain `null`
 *
 * NOTE: Providing a destination path is optional. In case it is not provided, cb is expected as the third argument to function.
 */
function unpackSome(pathToArch, filesToUnpack, destPathOrCb, cb) {
    const args = ['x', pathToArch, '-y', '-r'];
    cb = resolveOptionalDest(args, destPathOrCb, cb);

    if (!Array.isArray(filesToUnpack)) {
        return cb(new Error('filesToUnpack must be an array'));
    }

    if (filesToUnpack.length === 0) {
        return cb(new Error('No files to unpack specified'));
    }

    run(args.concat(filesToUnpack), cb);
}

/**
 * Pack file or folder to archive.
 * @param {string} pathToSrc - path to file or folder you want to compress.
 * @param {string} pathToArch - path to archive you want to create.
 * @param {callbackFn} cb - callback function. Will be called once pack is done. If no errors, first parameter will contain `null`.
 */
function pack(pathToSrc, pathToArch, cb) {
    run(['a', pathToArch, pathToSrc], cb);
}

/**
 * Get an array with compressed file contents.
 * @param {string} pathToArch - path to file its content you want to list.
 * @param {listCallbackFn} cb - callback function. Will be called once list is done. If no errors, first parameter will contain `null`.
 */
function list(pathToArch, cb) {
    run(['l', '-slt', '-ba', '-sccUTF-8', pathToArch], cb);
}

/**
 * Run 7za with parameters specified in `paramsArr`.
 * @param {array} paramsArr - array of parameter. Each array item is one parameter.
 * @param {callbackFn} cb - callback function. Will be called once command is done. If no errors, first parameter will contain `null`. If no output, second parameter will be `null`.
 */
function cmd(paramsArr, cb) {
    run(paramsArr, cb);
}

function run(args, cb) {
    cb = onceify(cb)
    const proc = spawn(configSettings.binaryPath, args, {windowsHide: true});
    const stdoutChunks = [];
    const stderrChunks = [];
    let spawnError;

    proc.on('error', (err) => {
        spawnError = err;
    });

    proc.stdout.on('data', (chunk) => {
        stdoutChunks.push(chunk);
    });

    proc.stderr.on('data', (chunk) => {
        stderrChunks.push(chunk);
    });

    proc.on('close', (code) => {
        if (spawnError) {
            return cb(spawnError);
        }

        // Guard Buffer.concat: Buffer.concat([]) throws, use empty string fallback
        const stdout = stdoutChunks.length ? Buffer.concat(stdoutChunks).toString() : '';
        const stderr = stderrChunks.length ? Buffer.concat(stderrChunks).toString() : '';

        // 7zip exited with an error code
        if (code !== 0) {
            const errorMessage = `7-zip exited with code ${code}.\nRaw Error Output:\n${stderr}\nRaw Output:\n${stdout}`;
            return cb(new Error(errorMessage));
        }

        // Successful execution:
        // The command was 'list', parse the stdout
        if (args[0] === 'l') {
            try {
                return cb(null, parseListOutput(stdout));
            } catch (parseError) {
                return cb(new Error(`Failed to parse 7-zip list output: ${parseError.message}\nRaw Error output:\n${stderr}\nRaw Output:\n${stdout}`));
            }
        }
        // all other cases of successful execution
        cb(null, stdout);
    });
}

// http://stackoverflow.com/questions/30234908/javascript-v8-optimisation-and-leaking-arguments
// javascript V8 optimisation and “leaking arguments”
// making callback to be invoked only once
function onceify(fn) {
    if (typeof fn !== 'function') {
        return function () {};
    }
    let called = false;
    return function (...args) {
        if (called) return;
        called = true;
        fn.apply(this, args);
    };
}

function parseListOutput(str) {
    if (!str.length) return [];
    str = str.replace(/(\r\n|\n|\r)/gm, '\n');
    const items = str.split(/^\s*$/m);
    const res = [];
    const LIST_MAP = {
        'Path': 'name',
        'Size': 'size',
        'Packed Size': 'compressed',
        'Attributes': 'attr',
        'Modified': 'dateTime',
        'CRC': 'crc',
        'Method': 'method',
        'Block': 'block',
        'Encrypted': 'encrypted',
    };

    if (!items.length) return [];

    for (let item of items) {
        if (!item.length) continue;
        const obj = {};
        const lines = item.split('\n');
        if (!lines.length) continue;
        for (let line of lines) {
            // Split by first " = " occurrence. This will also add an empty 3rd elm to the array. Just ignore it
            const data = line.split(/ = (.*)/);
            if (data.length !== 3) continue;
            const name = data[0].trim();
            const val = data[1].trim();
            if (LIST_MAP[name]) {
                if (LIST_MAP[name] === 'dateTime') {
                    const dtArr = val.split(/\s+/);
                    if (dtArr.length >= 2) {
                        obj['date'] = dtArr[0];
                        obj['time'] = dtArr[1];
                    }
                } else {
                    obj[LIST_MAP[name]] = val;
                }
            }
        }
        if (Object.keys(obj).length) {
            // Guarantee that the item always have a `name` property
            if (!obj.name) obj.name = '';
            res.push(obj);
        }
    }
    return res;
}

function universalCall(fn) {
    return function (...args) {
        const cb = args.length >= 1 && typeof args[args.length - 1] === 'function';
        if (cb) {
            return fn.apply(this, args);
        } else {
            return promisify(fn).apply(this, args);
        }
    };
}

exports.getConfig = getConfig;
exports.config = config;
exports.unpack = universalCall(unpack);
exports.unpackSome = universalCall(unpackSome);
exports.pack = universalCall(pack);
exports.list = universalCall(list);
exports.cmd = universalCall(cmd);
