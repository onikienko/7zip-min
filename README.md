7zip-min
========

Minimal cross-platform pack/unpack with 7-zip. 
This package includes standalone **7za** version of **7-Zip** (uses precompiled binaries from [7zip-bin](https://github.com/develar/7zip-bin) package).

Install
-------

`npm i 7zee`

Usage
-----

Only `pack` and `unpack` are supporting without any options

```js
let _7z = require('7zip-min');

// unpack
_7z.unpack('path/to/archive.7z', 'where/to/unpack', err => {
    // done
});

// pack
_7z.pack('path/to/dir/or/file', 'path/to/archive.7z', err => {
    // done
});
```

Test
----

`npm test`
