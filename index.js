'use strict';

const promisify = require('util').promisify;
const spawn = require('child_process').spawn;
const path7za = require('7zip-bin').path7za;


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
        && process.argv[1]?.includes('app.asar');

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
 * Unpack archive.
 * @param {string} pathToPack - path to archive you want to unpack.
 * @param {string|callbackFn} destPathOrCb - Either:
 * - (i) destination path, where to unpack.
 * - (ii) callback function, in case no destPath to be specified
 * @param {callbackFn} [cb] - callback function. Will be called once unpack is done. If no errors, first parameter will contain `null`
 *
 * NOTE: Providing a destination path is optional. In case it is not provided, cb is expected as the second argument to function.
 */
function unpack(pathToPack, destPathOrCb, cb) {
    if (typeof destPathOrCb === 'function' && cb === undefined) {
        cb = destPathOrCb;
        run(['x', pathToPack, '-y'], cb);
    } else {
        run(['x', pathToPack, '-y', '-o' + destPathOrCb], cb);
    }
}

/**
 * Pack file or folder to archive.
 * @param {string} pathToSrc - path to file or folder you want to compress.
 * @param {string} pathToDest - path to archive you want to create.
 * @param {callbackFn} cb - callback function. Will be called once pack is done. If no errors, first parameter will contain `null`.
 */
function pack(pathToSrc, pathToDest, cb) {
    run(['a', pathToDest, pathToSrc], cb);
}

/**
 * Get an array with compressed file contents.
 * @param {string} pathToSrc - path to file its content you want to list.
 * @param {listCallbackFn} cb - callback function. Will be called once list is done. If no errors, first parameter will contain `null`.
 */
function list(pathToSrc, cb) {
    run(['l', '-slt', '-ba', pathToSrc], cb);
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
    cb = onceify(cb);
    const proc = spawn(configSettings.binaryPath, args, {windowsHide: true});
    let output = '';
    proc.on('error', function (err) {
        cb(err);
    });
    proc.on('exit', function (code) {
        if (code) {
            cb(new Error(`7-zip exited with code ${code}\n${output}`));
        } else if (args[0] === 'l') {
            cb(null, parseListOutput(output));
        } else {
            cb(null, output);
        }
    });
    proc.stdout.on('data', (chunk) => {
        output += chunk.toString();
    });
    proc.stderr.on('data', (chunk) => {
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
        fn.apply(this, Array.prototype.slice.call(arguments)); // slice arguments
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
            const data = line.split(/ = (.*)/s);
            if (data.length !== 3) continue;
            const name = data[0].trim();
            const val = data[1].trim();
            if (LIST_MAP[name]) {
                if (LIST_MAP[name] === 'dateTime') {
                    const dtArr = val.split(' ');
                    if (dtArr.length !== 2) continue;
                    obj['date'] = dtArr[0];
                    obj['time'] = dtArr[1];
                } else {
                    obj[LIST_MAP[name]] = val;
                }
            }
        }
        if (Object.keys(obj).length) res.push(obj);
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
exports.pack = universalCall(pack);
exports.list = universalCall(list);
exports.cmd = universalCall(cmd);
