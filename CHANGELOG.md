# Changelog

## [2.0.0](https://github.com/onikienko/7zip-min/compare/v1.4.5...v2.0.0) (2025-01-23)

### Features

* ability to use the same API in async way ([e8a9106](https://github.com/onikienko/7zip-min/commit/e8a91065819aa9db29c53d745567d82ab1f70c01)), closes [#24](https://github.com/onikienko/7zip-min/issues/24)
* add types definition `index.d.ts` ([578c33a](https://github.com/onikienko/7zip-min/commit/578c33aeab18b29ae7c3901995032fcae14b8243))
* return stdout/stderr output printed by 7z ([a563837](https://github.com/onikienko/7zip-min/commit/a563837eb8c4d2e20ef910c664675e820f79433d)), closes [#38](https://github.com/onikienko/7zip-min/issues/38)
* support electron (app.assar.unpacked) ([3f1c867](https://github.com/onikienko/7zip-min/commit/3f1c867d6d4dc5935cf2985c31e6585d1a05a2f5)), closes [#98](https://github.com/onikienko/7zip-min/issues/98)

### Documentation

* more detailed jsdoc comments ([ad0df9d](https://github.com/onikienko/7zip-min/commit/ad0df9dd8c551e1fd3f051b9cbe3056bf9369a1b))
* update CHANGELOG.md ([60da359](https://github.com/onikienko/7zip-min/commit/60da35915b1f9439f2d0152b720de578a8248be1))
* update date in LICENSE ([a54ab60](https://github.com/onikienko/7zip-min/commit/a54ab60caf8ce0f29020f484310611657857f919))
* update README.md with new ways to use API ([b9bb08e](https://github.com/onikienko/7zip-min/commit/b9bb08e8879573bcb6da8914a3b986e62cbb81d3))

### Build System and Dependencies

* add "files" prop to package.json ([f1c8cc7](https://github.com/onikienko/7zip-min/commit/f1c8cc7fc64487e7aa06cc9019f96ed0675f22de))
* add `pack` and `unpack` keywords to package.json ([bb57846](https://github.com/onikienko/7zip-min/commit/bb57846bfa8044e3be6cc48d5792fd985c434eee))
* **dev-deps:** `ava 6.2.0` ([a914f9c](https://github.com/onikienko/7zip-min/commit/a914f9caeb34efc0ab35710e0f9e4df94ea3bda3))
* **dev-deps:** `fs-extra v11.3.0` ([12c061e](https://github.com/onikienko/7zip-min/commit/12c061eacd060dbcc2ce0a1c1dc12622fa9912b6))
* **dev-deps:** `globe v11.0.1` and usage in test.js ([8ba8aaf](https://github.com/onikienko/7zip-min/commit/8ba8aaf77b9d0c286319b465402aeb0fe6001be5))
* **dev-deps:** add `@types/fs-extra v11.0.4` ([4eba204](https://github.com/onikienko/7zip-min/commit/4eba20485481ead0637a3a5a3c8ca677d090a7bd))
* use `release-it` instead of `np` ([4dded46](https://github.com/onikienko/7zip-min/commit/4dded467e30a95e18140a558a981e6ed707d3b5b))

## v1.4.5

- build: update .gitignore
- docs: update README.md

## v1.4.4

- fix error with 'list' command if file contains " = " in the name
- bump dependencies
- add test to check filename with " = " for list command

## v1.4.2

- bump dependencies
- update README.md
- use 2fa for npm releases

## v1.4.1

- use fs-extra for tests instead of obsolete fs-extra-promise package
- homepage points to README https://github.com/onikienko/7zip-min#readme
- bump glob from 7.1.7 to 7.2.0

## v1.4.0

- add 7z output to error object (you will have more ideas on why 7z failed)
- add spawn option `{windowsHide: true}` (it will hide the subprocess console window that would normally be created on Windows systems.)

Thanks [@milahu](https://github.com/milahu) for that features.

## v1.3.3

- Bump path-parse from 1.0.6 to 1.0.7
- Bump normalize-url from 4.5.0 to 4.5.1
- Bump glob-parent from 5.1.1 to 5.1.2

## v1.3.2

- Bump hosted-git-info from 2.8.8 to 2.8.9

## v1.3.1

- Bump 7zip-bin from 5.0.3 to 5.1.1
- Bump fsify from 4.0.1 to 4.0.2
- [Security] Bump lodash from 4.17.20 to 4.17.21
- Bump glob from 7.1.6 to 7.1.7
- Update package.json
- [dev] Upgrade to GitHub-native Dependabot

## [v1.3.0](https://github.com/onikienko/7zip-min/tree/v1.3.0) (2021-01-18)

- Fix `list` command for nested `7zip` archives
- Add new props for `list` output (crc, method, block, encrypted). Props may depend on archive type and platform.
- Update README.md
- (dev) Bump ava from v3.14.0 to v3.15.0
- (dev) Tests with nested folders structure
- (dev) Test for `cmd` command

## [v1.2.1](https://github.com/onikienko/7zip-min/tree/v1.2.1) (2020-12-23)

- [Security] Bump ini from 1.3.5 to 1.3.7
- Bump ava from v3.8.1 to v3.14.0

## [v1.2.0](https://github.com/onikienko/7zip-min/tree/v1.2.0) (2020-10-13)

- Make output path for `.unpack` optional (if not provided will unpack in the current dir)
- Bump ava from 3.12.1 to 3.13.0

## [v1.1.3](https://github.com/onikienko/7zip-min/tree/v1.1.3) (2020-09-02)

- Bump ava from 3.8.1 to 3.12.1
- Bump lodash to 4.17.19

## [v1.1.2](https://github.com/onikienko/7zip-min/tree/v1.1.2) (2020-05-05)

- Bump ava from 2.4.0 to 3.8.1

## [v1.1.1](https://github.com/onikienko/7zip-min/tree/v1.1.1) (2019-10-02)

- Update dependencies

## [v1.1.0](https://github.com/onikienko/7zip-min/tree/v1.1.0) (2019-08-30)

- Added `list` command

## [v1.0.1](https://github.com/onikienko/7zip-min/tree/v1.0.1) (2018-10-14)

- Added CHANGELOG.md file
- Updated README.md

## [v1.0.0](https://github.com/onikienko/7zip-min/tree/v1.0.0) (2018-10-14)

- Added `cmd` method (running **7za** with user defined parameters)
- `jsdoc` for methods
- Updated README.md

## [v0.0.2](https://github.com/onikienko/7zip-min/tree/v0.0.2) (2018-09-27)

- Cleanup the code
- Updated README.md

## [v0.0.1](https://github.com/onikienko/7zip-min/tree/v0.0.1) (2018-09-27)

- Initial version with only `pack` and `unpack` methods
