# Changelog

## [3.0.1](https://github.com/onikienko/7zip-min/compare/v3.0.0...v3.0.1) (2026-03-01)

### Bug Fixes

* correct ESM type resolution ([4d6b175](https://github.com/onikienko/7zip-min/commit/4d6b175846037433bc8b3135bb58ccf33b976df3)), closes [#136](https://github.com/onikienko/7zip-min/issues/136)

### Build System and Dependencies

* add type checking script using `@arethetypeswrong/cli` ([40b243d](https://github.com/onikienko/7zip-min/commit/40b243d76e98046d9319c57c6d09e3831e8260b0))

## [3.0.0](https://github.com/onikienko/7zip-min/compare/v2.1.0...v3.0.0) (2026-02-25)

### ⚠ BREAKING CHANGES

* enhance error handling by introducing SevenZipMinError interface and updating callback signatures
* **types:** all props except "name" are optional for ListItem
* it changes an Error message

### Features

* add unpackSome() function ([76e3ddd](https://github.com/onikienko/7zip-min/commit/76e3dddfa28ef58c1c48e431cbebcb433d192658)), closes [#71](https://github.com/onikienko/7zip-min/issues/71)
* enhance error handling by introducing SevenZipMinError interface and updating callback signatures ([c9a1df0](https://github.com/onikienko/7zip-min/commit/c9a1df0a24f10c8c8f8e3fdeb5573d0fe7d3f53c))
* support for ESM import ([9ac13eb](https://github.com/onikienko/7zip-min/commit/9ac13eb1b472ba74db28061727158d5348f11d4e))

### Bug Fixes

* add type check for function in onceify() ([0e8a2c2](https://github.com/onikienko/7zip-min/commit/0e8a2c271e210d4f2cb3cbeb264702b76628a758))
* additional check for parseListOutput ([eeb13c8](https://github.com/onikienko/7zip-min/commit/eeb13c8cd04f784138836a05d88e1d60bdd95d12))
* cleaner regex for parseListOutput ([5231ec7](https://github.com/onikienko/7zip-min/commit/5231ec78f29af45e37b3e99ccd3b012f83557908))
* early callback on error in process execution ([a3cebfc](https://github.com/onikienko/7zip-min/commit/a3cebfc9619410f321e53700112706b801a6207e))
* enhance dateTime parsing for list() to handle multiple spaces ([5eee737](https://github.com/onikienko/7zip-min/commit/5eee7372a18887ebf529c474131bc852bb06fa6b))
* ensure list res items have a name property ([e6cba73](https://github.com/onikienko/7zip-min/commit/e6cba7395ce6ad79bd5a3d5471983d59065953be))
* guard Buffer.concat in run() ([16ab46b](https://github.com/onikienko/7zip-min/commit/16ab46b0d6a0d5bd1c64b3f4e70a7e0d406cbfda))
* handle names starting with `-` for unpackSome ([f081746](https://github.com/onikienko/7zip-min/commit/f081746a8d41b7e5aa34a6e1856cb0b84b09949c))
* improve run() ([f7c6fb8](https://github.com/onikienko/7zip-min/commit/f7c6fb8ebd8228275965992e36517ec4bf92dd62))
* improve stdout and stderr handling in run() function ([0d6e2f3](https://github.com/onikienko/7zip-min/commit/0d6e2f3f82e177f9136f6147892a250e5d1d845f))
* support for non-Latin filenames in the list() function ([2d91e60](https://github.com/onikienko/7zip-min/commit/2d91e60050c1df7532d7f11c0e0e1d27c4b9896a)), closes [#86](https://github.com/onikienko/7zip-min/issues/86)
* **types:** all props except "name" are optional for ListItem ([fa4a0b6](https://github.com/onikienko/7zip-min/commit/fa4a0b6fcfe6ce2cefae16f04525c624a114dd73))
* validate config input and binaryPath property ([5f6ee76](https://github.com/onikienko/7zip-min/commit/5f6ee768737bfdaf6c6a9b44bae19ad29a9e7179))

### Documentation

* enhance type definitions and documentation ([b2e5204](https://github.com/onikienko/7zip-min/commit/b2e5204b0fff192357b44b35a9f42c6fe8625628))
* update error handling section to include detailed error properties ([2d60aba](https://github.com/onikienko/7zip-min/commit/2d60aba2b710eacaff62579496a88b49b266d3f9))
* update Features section ([3d79656](https://github.com/onikienko/7zip-min/commit/3d796564cd945ac1cad039ff61cf1cdba2d58640))
* update README to improve clarity ([72882d7](https://github.com/onikienko/7zip-min/commit/72882d70a80ace469f892db1912d012f762bfd66))
* update README to specify support for Node.js v10+ ([e9a23ae](https://github.com/onikienko/7zip-min/commit/e9a23ae66f3487f5bc6e44a190fa0b851286b9ad))
* update README with enhanced features, usage examples, and API methods ([cbfd3ab](https://github.com/onikienko/7zip-min/commit/cbfd3ab4836c14c8d1f1e99993c358cbafa66943))

### Build System and Dependencies

* **deps:** bump `ava` to v6.4.1 ([cf9c8da](https://github.com/onikienko/7zip-min/commit/cf9c8dab242304e67bd43cd41a9f187e8a8344bd))
* **deps:** bump `brace-expansion`, `js-yaml`, and `lodash` ([ec54019](https://github.com/onikienko/7zip-min/commit/ec54019d8604d0636fbec9e524b1e9d104f073db))
* **deps:** bump `dotenv-cli` to v11.0.0 ([16fb748](https://github.com/onikienko/7zip-min/commit/16fb748ffe36d2f4ec49773552e41841c8cfe9cb))
* **deps:** bump `fs-extra` to v11.3.3 ([f121831](https://github.com/onikienko/7zip-min/commit/f121831c99a5e5b1a1e0bef32ff3d507254df33c))
* **deps:** bump `release-it` and `conventional-changelog` deps ([a2b5cb8](https://github.com/onikienko/7zip-min/commit/a2b5cb89df1b7f4ec3ec2df07e921326eef676ca))
* **deps:** npm audit fix ([d17b47e](https://github.com/onikienko/7zip-min/commit/d17b47e5cb2cd8a13ccdae5b01b6a65b5ad983b0))
* remove Dependabot configuration file ([88be6c5](https://github.com/onikienko/7zip-min/commit/88be6c54ccbccd4fb682732f2f726e2983289723))
* update release-it configuration ([f96378f](https://github.com/onikienko/7zip-min/commit/f96378f497d874ecc084dd473634df2b4493d13b))

## [2.1.0](https://github.com/onikienko/7zip-min/compare/v2.0.0...v2.1.0) (2025-04-11)

### Features

* custom binary path setting ([#106](https://github.com/onikienko/7zip-min/issues/106)) ([dfb864d](https://github.com/onikienko/7zip-min/commit/dfb864d0db8abc8b339a60271df5dab5735330e2))

### Documentation

* example usage of `getConfig` and `config` methods ([490ac6e](https://github.com/onikienko/7zip-min/commit/490ac6e2a809d40eba73394127fd35d5a9be165b))
* fix example url ([a2a3cb8](https://github.com/onikienko/7zip-min/commit/a2a3cb8702425dd119db160fcf65eb9c6a951abd))

### Build System and Dependencies

* **deps-dev:** bump release-it from 18.1.1 to 18.1.2 ([8db6b38](https://github.com/onikienko/7zip-min/commit/8db6b387fc87dd71d49f4ae7ed7e61bd238df52f))
* **deps:** upgrade `release-it` to v18.1.2 ([6d9d806](https://github.com/onikienko/7zip-min/commit/6d9d8066bc8b307105ae23ae0cb01765360cf66e))

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
