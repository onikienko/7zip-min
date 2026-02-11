import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const cjs = require('./index.js');

export const { getConfig, config, unpack, unpackSome, pack, list, cmd } = cjs;
export default cjs;
