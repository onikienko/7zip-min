/**
 * Configuration settings for 7zip-min.
 */
export interface ConfigSettings {
  /**
   * Path to the 7z binary.
   */
  binaryPath?: string;
}

/**
 * Represents an item within an archive.
 */
export interface ListItem {
  /**
   * Path to the file or directory.
   */
  name: string;
  /**
   * Uncompressed size in bytes (string as returned by 7z).
   */
  size?: string;
  /**
   * Compressed (packed) size in bytes (string as returned by 7z).
   */
  compressed?: string;
  /**
   * Modified date.
   */
  date?: string;
  /**
   * Modified time.
   */
  time?: string;
  /**
   * File or directory attributes.
   */
  attr?: string;
  /**
   * CRC checksum.
   */
  crc?: string;
  /**
   * Indicates if the item is encrypted.
   */
  encrypted?: string;
  /**
   * Compression method used.
   */
  method?: string;
  /**
   * Block number.
   */
  block?: string;
}

/**
 * Error object returned by 7zip-min commands.
 */
export interface SevenZipMinError extends Error {
  /**
   * The exit code of the 7z process.
   */
  code?: number | string;
  /**
   * The stdout output of the 7z command.
   */
  stdout?: string;
  /**
   * The stderr output of the 7z command.
   */
  stderr?: string;
}

/**
 * Callback function for general commands.
 * @param err Error object if the command failed, or null if successful.
 * @param output The stdout output of the 7z command.
 */
export type CallbackFn = (err: SevenZipMinError | null, output?: string) => void;

/**
 * Callback function for the list command.
 * @param err Error object if the command failed, or null if successful.
 * @param listItems Array of items found in the archive.
 */
export type ListCallbackFn = (err: SevenZipMinError | null, listItems?: ListItem[]) => void;

/**
 * Returns the current configuration settings.
 */
export function getConfig(): ConfigSettings;

/**
 * Updates the configuration settings.
 * @param cfg New configuration settings.
 * @example
 * _7z.config({ binaryPath: 'path/to/7za' });
 */
export function config(cfg: ConfigSettings): void;

/**
 * Unpacks an archive.
 * @param pathToArch Path to the archive file.
 * @param destPath Optional destination path. If not provided, unpacks to the current directory.
 * @returns A promise that resolves with the 7z command output.
 * @example
 * await _7z.unpack('archive.7z', 'target/path');
 */
export function unpack(pathToArch: string, destPath?: string): Promise<string>;
/**
 * Unpacks an archive using a callback.
 * @param pathToArch Path to the archive file.
 * @param cb Callback function called when unpacking is complete.
 */
export function unpack(pathToArch: string, cb: CallbackFn): void;
/**
 * Unpacks an archive to a specific destination using a callback.
 * @param pathToArch Path to the archive file.
 * @param destPath Destination path where the archive will be unpacked.
 * @param cb Callback function called when unpacking is complete.
 */
export function unpack(pathToArch: string, destPath: string, cb: CallbackFn): void;

/**
 * Unpacks specific files or directories from an archive.
 * @param pathToArch Path to the archive file.
 * @param filesToUnpack Array of file/directory paths to extract from the archive.
 * @param destPath Optional destination path. If not provided, unpacks to the current directory.
 * @returns A promise that resolves with the 7z command output.
 * @example
 * await _7z.unpackSome('archive.7z', ['file1.txt', 'dir1'], 'target/path');
 */
export function unpackSome(pathToArch: string, filesToUnpack: string[], destPath?: string): Promise<string>;
/**
 * Unpacks specific files or directories from an archive using a callback.
 * @param pathToArch Path to the archive file.
 * @param filesToUnpack Array of file/directory paths to extract from the archive.
 * @param cb Callback function called when unpacking is complete.
 */
export function unpackSome(pathToArch: string, filesToUnpack: string[], cb: CallbackFn): void;
/**
 * Unpacks specific files or directories from an archive to a destination using a callback.
 * @param pathToArch Path to the archive file.
 * @param filesToUnpack Array of file/directory paths to extract from the archive.
 * @param destPath Destination path where the files will be unpacked.
 * @param cb Callback function called when unpacking is complete.
 */
export function unpackSome(pathToArch: string, filesToUnpack: string[], destPath: string, cb: CallbackFn): void;

/**
 * Packs files or directories into an archive.
 * @param pathToSrc Path to the source file or directory.
 * @param pathToArch Path where the archive will be created.
 * @returns A promise that resolves with the 7z command output.
 * @example
 * await _7z.pack('source/path', 'archive.7z');
 */
export function pack(pathToSrc: string, pathToArch: string): Promise<string>;
/**
 * Packs files or directories into an archive using a callback.
 * @param pathToSrc Path to the source file or directory.
 * @param pathToArch Path where the archive will be created.
 * @param cb Callback function called when packing is complete.
 */
export function pack(pathToSrc: string, pathToArch: string, cb: CallbackFn): void;

/**
 * Lists the contents of an archive.
 * @param pathToArch Path to the archive file.
 * @returns A promise that resolves with an array of archive items.
 * @example
 * const items = await _7z.list('archive.7z');
 */
export function list(pathToArch: string): Promise<ListItem[]>;
/**
 * Lists the contents of an archive using a callback.
 * @param pathToArch Path to the archive file.
 * @param cb Callback function called with the list of archive items.
 */
export function list(pathToArch: string, cb: ListCallbackFn): void;

/**
 * Runs a custom 7-zip command.
 * @param paramsArr Array of command-line parameters to pass to 7za.
 * @returns A promise that resolves with the 7z command output.
 * @example
 * await _7z.cmd(['a', 'archive.7z', 'file.txt']);
 */
export function cmd(paramsArr: string[]): Promise<string>;
/**
 * Runs a custom 7-zip command using a callback.
 * @param paramsArr Array of command-line parameters to pass to 7za.
 * @param cb Callback function called with the command output.
 */
export function cmd(paramsArr: string[], cb: CallbackFn): void;
