# Changelog

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
