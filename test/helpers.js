'use strict';

const {resolve, join} = require('path');
// for compatibility with Node 10+
const {readdir, stat} = require('fs').promises;

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

async function walkFolder(folderPath) {
  // do not use recursive: true for Node v10 support
  const items = await readdir(folderPath);
  const files = [];
  for (const item of items) {
    const itemPath = resolve(folderPath, item);
    const isDir = (await stat(itemPath)).isDirectory();
    isDir ? files.push(...await walkFolder(itemPath)) : files.push(itemPath);
  }
  return files;
}

// Returns two arrays: [unpackedFiles, sourceFiles] where each entry is a POSIX-style relative path
async function getFilesList(unpackSrcPath) {
    const unpacked = (await walkFolder(unpackSrcPath))
        .map(p => toPosixRelative(unpackSrcPath, p));

    const source = (await walkFolder(SRC_DIR_PATH))
        .map(p => toPosixRelative(SRC_DIR_PATH, p));

    return [unpacked, source];
}

// Recursively generate posix-style relative paths from a fsify-like structure
function getExpectedPathsFromStructure(items, parentPath = '') {
  if (!Array.isArray(items)) return [];
  let paths = [];
  for (const item of items) {
    if (!item || typeof item.name === 'undefined') continue;
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
