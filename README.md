# 7zip-min

[![npm version](https://img.shields.io/npm/v/7zip-min.svg)](https://www.npmjs.com/package/7zip-min)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Minimal cross-platform pack/unpack (and any command) with **7-zip** for Node.js.   
It does not require **7zip** to be installed on your system. 
This package includes a standalone **7za** version of **7-Zip** (uses precompiled binaries from [7zip-bin](https://github.com/develar/7zip-bin) package).

## Features

- **No external dependencies**: Includes precompiled 7za binaries from [7zip-bin](https://github.com/develar/7zip-bin)
- **TypeScript ready**: Full type definitions included
- **Cross-platform**: Works on Windows, macOS, and Linux
- **Electron compatible**: Works with Electron apps
- **Flexible API**: Supports Promises and callbacks

## Quick Start

```bash
npm install 7zip-min
```

```javascript
import _7z from '7zip-min';

// Create an archive
await _7z.pack('myFolder', 'archive.7z');

// Extract an archive
await _7z.unpack('archive.7z', 'outputFolder');

// List archive contents
const files = await _7z.list('archive.7z');
console.log(files);
```
> 💡 **Tip:** You can also extract specific files with [`unpackSome()`](#unpacksomepathtoarch-filestounpack-destpath-callback) or run custom 7z commands with [`cmd()`](#cmdparamsarr-callback). See the [API Methods](#api-methods) section for details.

## Table of Contents

- [Supported Archive Formats](#supported-archive-formats)
- [Supported Platforms](#supported-platforms)
- [Import](#import)
- [API Methods](#api-methods)
- [Configuration](#configuration)
- [Examples](#examples)
- [Electron Usage](#electron-usage)
- [Error Handling](#error-handling)

## Supported Archive Formats

According to the [7-Zip documentation](https://web.mit.edu/outland/arch/i386_rhel4/build/p7zip-current/DOCS/MANUAL/), 7za supports:

**7z** · **lzma** · **cab** · **zip** · **gzip** · **bzip2** · **Z** · **tar** 


## Supported Platforms

| Platform | Architectures |
|----------|---------------|
| **Windows** | x86, x64 |
| **macOS** | Apple Silicon (arm64), Intel (x64) |
| **Linux** | arm, arm64, ia32, x64 |

**Node.js**: v10 and above  
**Electron**: Supported (see [Electron usage](#electron-usage) below)

For more platform details, see the [7zip-bin](https://github.com/develar/7zip-bin) repository. 


## Import

```javascript
// ES6 Module syntax
import _7z from '7zip-min';

// Named imports also supported
import { unpack, pack, list, cmd, config, getConfig } from '7zip-min';

// or use CommonJS syntax, if you prefer
const _7z = require('7zip-min');
```

## API Methods

All methods return a `Promise` and also support standard Node.js callbacks as the last argument. The Promise resolves with the standard output (stdout) of the 7z command (except `list()` which returns an array of objects).

### `pack(pathToSrc, pathToArch, [callback])`

Creates an archive from a file or directory.

**Parameters:**
- `pathToSrc` (string): Path to file or directory to compress
- `pathToArch` (string): Path to archive to create
- `callback` (function, optional): Node.js callback function

**Returns:** Promise\<string\> - stdout of 7z command

```javascript
await _7z.pack('path/to/dir', 'archive.7z');
await _7z.pack('path/to/file.txt', 'backup.zip');
```

### `unpack(pathToArch, [destPath], [callback])`

Extracts an archive to a destination directory.

**Parameters:**
- `pathToArch` (string): Path to archive file
- `destPath` (string, optional): Where to extract files (defaults to current directory)
- `callback` (function, optional): Node.js callback function

**Returns:** Promise\<string\> - stdout of 7z command

```javascript
// Unpack to specific directory
await _7z.unpack('archive.7z', 'output/folder');

// Unpack to current directory
await _7z.unpack('archive.zip');
```

### `unpackSome(pathToArch, filesToUnpack, [destPath], [callback])`

Extracts specific files or directories from an archive.

**Parameters:**
- `pathToArch` (string): Path to archive file
- `filesToUnpack` (string[]): Array of file/directory names or patterns to extract
- `destPath` (string, optional): Where to extract files (defaults to current directory)
- `callback` (function, optional): Node.js callback function

**Returns:** Promise\<string\> - stdout of 7z command

```javascript
// Extract specific files to a directory
await _7z.unpackSome('archive.7z', ['file1.txt', 'dir1'], 'output');

// Extract with pattern to current directory
await _7z.unpackSome('archive.7z', ['*.txt']);
```

### `list(pathToArch, [callback])`

Lists contents of an archive.

**Parameters:**
- `pathToArch` (string): Path to archive file
- `callback` (function, optional): Node.js callback function

**Returns:** Promise\<ListItem[]\> - Array of items in the archive

Each `ListItem` object has the following properties:
- `name` (string): **[guaranteed]** File/directory path (always present)
- `size` (string, optional): Uncompressed size
- `compressed` (string, optional): Compressed size
- `date` (string, optional): Modified date
- `time` (string, optional): Modified time
- `attr` (string, optional): File attributes
- `crc` (string, optional): CRC checksum
- `method` (string, optional): Compression method
- `encrypted` (string, optional): Encryption status

> **Note:** Only the `name` property is guaranteed to be present. Other properties depend on the archive format and 7z output.

```javascript
const items = await _7z.list('archive.7z');
items.forEach(item => {
  console.log(`${item.name}${item.size ? ` - ${item.size} bytes` : ''}`);
});
```

### `cmd(paramsArr, [callback])`

Runs any 7z command with custom parameters. This is a low-level method that gives you full control over 7z and returns the raw command output.

**Parameters:**
- `paramsArr` (string[]): Array of command-line arguments for 7z
- `callback` (function, optional): Node.js callback function

**Returns:** Promise\<string\> - stdout of 7z command (raw output that you can parse or process)

```javascript
// Custom compression with ultra settings
const output = await _7z.cmd(['a', '-mx=9', 'ultra.7z', 'folder']);
console.log(output); // Raw 7z output

// Test archive integrity and get detailed report
const testResult = await _7z.cmd(['t', 'archive.7z']);
if (testResult.includes('Everything is Ok')) {
  console.log('Archive is valid');
}

// Extract with password
await _7z.cmd(['x', 'protected.7z', '-pMyPassword', '-ooutput']);
```

## Configuration

### `getConfig()`

Returns the current configuration settings.

**Returns:** ConfigSettings object with:
- `binaryPath` (string): Current path to 7za binary

```javascript
const config = _7z.getConfig();
console.log(`Using 7za binary at: ${config.binaryPath}`);
```

### `config(settings)`

Updates configuration settings.

**Parameters:**
- `settings` (object): Configuration object
  - `binaryPath` (string, optional): Custom path to 7za binary

```javascript
// Use a custom 7za binary
_7z.config({
  binaryPath: '/custom/path/to/7za'
});
```

### Custom Binary Path

Sometimes you may want to use a custom path to the 7za binary. Common use cases include:

- **Electron apps**: When bundling with a custom location
- **Custom builds**: Using a specific version of 7za
- **Non-standard installations**: When 7za is installed in a custom location

Use the `getConfig()` and `config()` methods shown above to get or set the binary path. For more details, see [#106](https://github.com/onikienko/7zip-min/pull/106).

## Examples

### Handling Output

Capture the standard output from the 7z command for logging or analysis:

```javascript
const stdout = await _7z.pack('myFolder', 'archive.7z'); 
console.log(stdout); // Prints 7z command output
```

### Alternative Syntax

All methods are compatible with standard Node.js callbacks and `.then()` chains:

**Callback style:**
```javascript
_7z.unpack('archive.7z', 'output', (err, output) => {
  if (err) return console.error(err);
  console.log('Unpacked!', output);
});
```

**Promise style:**
```javascript
_7z.list('archive.7z')
  .then(list => console.log(list))
  .catch(err => console.error(err));
```

## Electron Usage

This package works with Electron. The package automatically detects when running inside an Electron app and adjusts the binary path from `app.asar` to `app.asar.unpacked`.

When using `electron-builder`, you need to ensure the 7za binaries are unpacked from the .asar archive using the [`asarUnpack`](https://www.electron.build/configuration#asarunpack) option:

```json
{
  "build": {
    "asarUnpack": [
      "node_modules/7zip-bin/**/*"
    ]
  }
}
```
Alternatively, you can set a custom binary path if you prefer to bundle the binary differently:

```javascript
_7z.config({
  binaryPath: '/custom/path/to/7za'
});
```

## Error Handling

All methods throw errors (or pass them to callbacks) when operations fail. The error object is an extended `Error` with
additional properties:

- `message`: Error message
- `stderr`: Standard error output from 7z
- `stdout`: Standard output from 7z (if any)
- `code`: Exit code from 7z process

```javascript
try {
  await _7z.unpack('nonexistent.7z');
} catch (err) {
  console.error('Error message:', err.message);
  console.log('Exit code', err.code);
  console.error('Standard error:', err.stderr);
  console.error('Standard output:', err.stdout);
}
```

## See Also

- [7zip-bin](https://github.com/develar/7zip-bin) - Precompiled 7za binaries
- [7-Zip](https://www.7-zip.org/) - Official 7-Zip website
- [Command Line Version User's Guide](https://web.mit.edu/outland/arch/i386_rhel4/build/p7zip-current/DOCS/MANUAL/) - 7z command-line documentation
