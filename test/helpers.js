'use strict';

const { glob } = require('glob');
const { resolve, join } = require('path');

const SRC_DIR_NAME = 'testDir';
const SRC_DIR_PATH = join(__dirname, SRC_DIR_NAME);
const ARCH_PATH = join(__dirname, 'testDir.7z');
const UNPACK_PATH = join(__dirname, 'unpackDir');
const UNPACK_IN_CURRENT_PATH = join(process.cwd(), SRC_DIR_NAME);
const CUSTOM_BINARY_PATH = require('7zip-bin').path7za;

// Convert an absolute path into a POSIX-style relative path based on `base`.
function toPosixRelative(base, fullPath) {
    const absBase = resolve(base);
    const abs = resolve(fullPath).normalize('NFC');
    let rel = abs.startsWith(absBase) ? abs.slice(absBase.length) : abs;
    // Convert backslashes to forward slashes and trim leading slashes
    rel = rel.replace(/\\/g, '/').replace(/^\/+/, '');
    return rel;
}

// Returns two arrays: [unpackedFiles, sourceFiles] where each entry is a POSIX-style relative path
async function getFilesList(unpackSrcPath) {
    const unpacked = (await glob(unpackSrcPath + '/**/*', { dot: true }))
        .map(p => toPosixRelative(unpackSrcPath, p));

    const source = (await glob(SRC_DIR_PATH + '/**/*', { dot: true }))
        .map(p => toPosixRelative(SRC_DIR_PATH, p));

    return [unpacked, source];
}

// Recursively generate posix-style relative paths from a fsify-like structure
function getExpectedPathsFromStructure(items, parentPath = '') {
    if (!Array.isArray(items)) return [];
    let paths = [];
    for (const item of items) {
        if (!item || typeof item.name === 'undefined') continue; // skip malformed entries
        const name = String(item.name);
        const currentPath = parentPath ? join(parentPath, name) : name;
        paths.push(currentPath);
        if (item.contents && Array.isArray(item.contents) && item.contents.length > 0) {
            paths = paths.concat(getExpectedPathsFromStructure(item.contents, currentPath));
        }
    }
    return paths;
}

module.exports = {
    SRC_DIR_NAME,
    SRC_DIR_PATH,
    ARCH_PATH,
    UNPACK_PATH,
    UNPACK_IN_CURRENT_PATH,
    CUSTOM_BINARY_PATH,
    getFilesList,
    getExpectedPathsFromStructure,
};
