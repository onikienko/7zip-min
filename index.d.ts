export interface ConfigSettings {
    binaryPath?: string;
}

export interface ListItem {
    name: string; // name of file/dir (path
    size: string; // size
    compressed: string; // packed size
    date: string; // modified date
    time: string; // modified time
    attr: string; // attributes
    crc: string; // CRC
    encrypted: string; // encrypted
    method: string; // compression method
    block: string; // block
}

export type CallbackFn = (err: Error | null, output?: string) => void;
export type ListCallbackFn = (err: Error | null, listItems?: ListItem[]) => void;

export function getConfig(): ConfigSettings;
export function config(cfg: ConfigSettings): void;

export function unpack(pathToPack: string, destPath?: string): Promise<string>;
export function unpack(pathToPack: string, cb: CallbackFn): void;
export function unpack(pathToPack: string, destPath: string, cb: CallbackFn): void;

export function pack(pathToSrc: string, pathToDest: string): Promise<string>;
export function pack(pathToSrc: string, pathToDest: string, cb: CallbackFn): void;

export function list(pathToSrc: string): Promise<ListItem[]>;
export function list(pathToSrc: string, cb: ListCallbackFn): void;

export function cmd(paramsArr: string[]): Promise<string>;
export function cmd(paramsArr: string[], cb: CallbackFn): void;
