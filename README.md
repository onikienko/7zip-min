7zip-min
========

Minimal cross-platform pack/unpack (and any command) with **7-zip** for Node.js.   
It does not require **7zip** to be installed in your system. 
This package includes a standalone **7za** version of **7-Zip** (uses precompiled binaries from [7zip-bin](https://github.com/develar/7zip-bin) package).


Supporting archive formats
--------------------------

According to [Command Line Version User's Guide](https://web.mit.edu/outland/arch/i386_rhel4/build/p7zip-current/DOCS/MANUAL/) page, 7za supports only **7z**, **lzma**, **cab**, **zip**, **gzip**, **bzip2**, **Z** and **tar** formats. 


Supporting platforms
--------------------

- win (32/64)
- mac
  - arm64 (Apple Silicon)
  - x64 
- linux
  - arm
  - arm64
  - ia32
  - x64

To get more details, check [7zip-bin](https://github.com/develar/7zip-bin) package repo. 

Package should work with Electron. 
You will have to unpack the binary ([`asarUnpack`](https://www.electron.build/configuration#asarunpack) option if you use `electron-builder`.) 

Usage
-----

You may use `pack` and `unpack` methods for simple packing/unpacking. 

You can also use `list` to get an array with the file content properties (includes date, time, attr, size, compressed, and name)

Or use `cmd` to run 7za with custom parameters (see [Command Line Version User's Guide](https://web.mit.edu/outland/arch/i386_rhel4/build/p7zip-current/DOCS/MANUAL/))

You can use package with callbacks and in async way (with promises).

### Basic examples

```javaScript
const _7z = require('7zip-min');

// .......
await _7z.pack('path/to/dir/or/file', 'path/to/archive.7z');
await _7z.unpack('path/to/archive.7z', 'where/to/unpack');
const list = await _7z.list('path/to/archive.7z'); // list of items inside archive
const output = await _7z.cmd(['a', 'path/to/archive.7z', 'path/to/dir/or/file']); // run custom command
```

### Examples with callbacks and promises

#### unpack()

```javaScript
// unpack with callback
_7z.unpack('path/to/archive.7z', 'where/to/unpack', (err, output) => {
    if (err) {
        console.error('Error', err.message);
    } else {
        // everything is Ok
        console.log('stdout of the 7za command execution', output); // output just in case you need it
    }
});

// unpack with promise
_7z.unpack('path/to/archive.7z', 'where/to/unpack')
    .then(output => console.log('stdout of the 7za command execution', output))
    .catch(err => console.error('Error', err.message));

// unpack with async/await
(async () => {
    try {
        const output = await _7z.unpack('path/to/archive.7z', 'where/to/unpack');
        console.log('stdout of the 7za command execution', output);
    } catch (err) {
        console.error('Error', err.message);
    }
})();

// if no output directroy specified, it will unpack into the current directory (process.cwd())
_7z.unpack('path/to/archive.7z')
    .then(output => console.log('stdout of the 7za command execution', output))
    .catch(err => console.error('Error', err.message));
```

#### pack()

```javaScript
// pack with callback
_7z.pack('path/to/dir/or/file', 'path/to/archive.7z', (err, output) => {
    if (err) {
        console.error('Error', err.message);
    } else {
        // everything is Ok
        console.log('stdout of the 7za command execution', output);
    }
});

// pack with promise
_7z.pack('path/to/dir/or/file', 'path/to/archive.7z')
    .then(output => console.log('stdout of the 7za command execution', output))
    .catch(err => console.error('Error', err.message));

// pack with async/await
(async () => {
    try {
        const output = await _7z.pack('path/to/dir/or/file', 'path/to/archive.7z');
        console.log('stdout of the 7za command execution', output);
    } catch (err) {
        console.error('Error', err.message);
    }
})();
```

#### list()

```javaScript
// list with callback
_7z.list('path/to/archive.7z', (err, list) => {
    if (err) {
        console.error('Error', err.message);
    } else {
        console.log('List of items inside the archive', list);
        // For each element in the archive you will have:
        // name, date, time, attr, size (in bytes), compressed (compressed size in bytes), crc, method, encrypted, block
        // Depending on the archive type some values may be empty or missed
    }
});

// list with promise
_7z.list('path/to/archive.7z')
    .then(list => console.log('List of items inside the archive', list))
    .catch(err => console.error('Error', err.message));

// list with async/await
(async () => {
    try {
        const list = await _7z.list('path/to/archive.7z');
        console.log('List of items inside the archive', list);
    } catch (err) {
        console.error('Error', err.message);
    }
})();
```

#### cmd()

```javaScript
// cmd with callback
// in the first parameter you have to provide an array of parameters
// check 7z's Command Line Version User's Guide - https://web.mit.edu/outland/arch/i386_rhel4/build/p7zip-current/DOCS/MANUAL/
// the bellow command is equal to `7za a path/to/archive.7z path/to/dir/or/file` and will add `path/to/dir/or/file` to `path/to/archive.7z` archive
_7z.cmd(['a', 'path/to/archive.7z', 'path/to/dir/or/file'], (err, output) => {
    if (err) {
        console.error('Error', err.message);
    } else {
        // Execution finished succesfully
        console.log('stdout of the 7za command execution', output);
    }
});

// cmd with promise
_7z.cmd(['a', 'path/to/archive.7z', 'path/to/dir/or/file'])
    .then(output => console.log('stdout of the 7za command execution', output))
    .catch(err => console.error('Error', err.message));

// cmd with async/await
(async () => {
    try {
        const output = await _7z.cmd(['a', 'path/to/archive.7z', 'path/to/dir/or/file']);
        console.log('stdout of the 7za command execution', output);
    } catch (err) {
        console.error('Error', err.message);
    }
})();
```

### Custom 7za path

Sometimes, you may want to use a custom path to the 7za binary. See https://github.com/onikienko/7zip-min/pull/106 for more details.

```javaScript
// To find out the path to the 7za binary, you can use the getConfig() method
const config = _7z.getConfig();
console.log(`Path to 7za binary: ${config.binaryPath}`); 

// To set a custom path to the 7za binary, you can use the config() method
_7z.config({
    binaryPath: 'path/to/custom/7za'
});
```

Test
----

`npm test`
