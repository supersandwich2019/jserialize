import { Reader, Writer } from 'protobufjs';
export declare function write(value: any, writer?: Writer | null | undefined, deep?: number): Writer;
export declare function writeArray(array: any[], writer?: Writer | null | undefined, deep?: number): Writer;
export declare function writeMap(value: any, writer?: Writer | null | undefined, deep?: number): Writer;
export declare function writeObject(value: any, writer: Writer, deep: number): void;
export declare function read(reader: Reader | Uint8Array): string | number | bigint | boolean | {
    [k: string]: any;
} | null | undefined;
export declare function readArray(reader: Reader | Uint8Array): any[];
export declare function readMap(reader: Reader | Uint8Array): {
    [k: string]: any;
};
export declare function serialize(value: any): Uint8Array;
export declare function deserialize(data: Uint8Array): any;
