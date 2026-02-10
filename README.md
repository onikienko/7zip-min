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

All methods return a `Promise` (useable with `async/await`) and also support standard Node.js callbacks as the last argument. The Promise resolves with the standard output (stdout) of the 7z command (except `list()` which returns an array of objects).

```javascript
const _7z = require('7zip-min');
```

#### pack()
```javascript
await _7z.pack('path/to/dir/or/file', 'path/to/archive.7z');
```

#### unpack()
```javascript
await _7z.unpack('path/to/archive.7z', 'where/to/unpack');

// If no destination is specified, it unpacks into the current directory (process.cwd())
await _7z.unpack('path/to/archive.7z');
```

#### unpackSome()
Unpack specific files or directories from an archive.
```javascript
await _7z.unpackSome('path/to/archive.7z', ['file1.txt', 'dir1'], 'where/to/unpack');

// If no destination is specified, it unpacks into the current directory (process.cwd())
await _7z.unpackSome('path/to/archive.7z', ['*.txt']); // unpack all .txt files in the current dir
```

#### list()
```javascript
const list = await _7z.list('path/to/archive.7z');
// Items contain: name, size, compressed, date, time, attr, crc, method, etc.
```

#### cmd()
Run any 7z command with custom parameters.
```javascript
await _7z.cmd(['a', 'path/to/archive.7z', 'path/to/dir/or/file']);
```

#### Handling Output

You can capture the standard output from the 7z command for logging or analysis. 
```javascript 
const stdout = await _7z.pack('path/to/dir/or/file', 'path/to/archive.7z'); 
console.log(stdout);
```

### Alternative Syntax (Callbacks & Promises)

If you prefer not to use `async/await`, all methods are compatible with standard callbacks and `.then()` chains.

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

### Custom 7za path

Sometimes, you may want to use a custom path to the 7za binary. See https://github.com/onikienko/7zip-min/pull/106 for more details.

```javascript
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
