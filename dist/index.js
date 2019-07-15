"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const protobufjs_1 = require("protobufjs");
function bigint2Long(value) {
    if (value <= Number.MAX_SAFE_INTEGER && value >= Number.MIN_SAFE_INTEGER) {
        return Number.parseInt(value);
    }
    else {
        return value.toString();
    }
}
function long2Bigint(value) {
    return BigInt(value.low) + (BigInt(value.high) << 32n);
}
function long2Number(value) {
    const v = long2Bigint(value);
    return Number.parseInt(v);
}
function long2Date(value) {
    return new Date(long2Number(value));
}
function write(value, writer, deep = 0) {
    if (deep > 100) {
        throw new Error('Serialize too deep');
    }
    if (null == writer) {
        writer = protobufjs_1.Writer.create();
    }
    if (value === null) {
        writer.uint32(0 /* NULL */);
    }
    else if (value === undefined) {
        writer.uint32(1 /* UNDEFINED */);
    }
    else {
        switch (typeof value) {
            case 'number':
                if ((value | 0) === value) {
                    writer.uint32(3 /* INT32 */).int32(value);
                }
                else if (Number.isInteger(value)) {
                    writer.uint32(4 /* INT */).int64(value);
                }
                else {
                    writer.uint32(5 /* DOUBLE */).double(value);
                }
                break;
            case 'string':
                writer.uint32(7 /* STRING */).string(value);
                break;
            case 'bigint':
                writer.uint32(6 /* INT64 */).int64(bigint2Long(value));
                break;
            case 'boolean':
                writer.uint32(2 /* BOOL */).bool(value);
                break;
            case 'object':
                writeObject(value, writer, deep + 1);
                break;
        }
    }
    return writer;
}
exports.write = write;
function writeArray(array, writer, deep = 0) {
    if (writer == null) {
        writer = protobufjs_1.Writer.create();
    }
    writer.uint32(array.length);
    for (const v of array) {
        write(v, writer, deep + 1);
    }
    return writer;
}
exports.writeArray = writeArray;
function writeMap(value, writer, deep = 0) {
    if (writer == null) {
        writer = protobufjs_1.Writer.create();
    }
    const keys = Object.keys(value);
    writer.uint32(keys.length);
    for (const k of keys) {
        const v = value[k];
        writer.string(k);
        write(v, writer, deep + 1);
    }
    return writer;
}
exports.writeMap = writeMap;
function writeObject(value, writer, deep) {
    if (value instanceof Buffer || value instanceof Uint8Array) {
        writer.uint32(8 /* BYTES */).bytes(value);
    }
    else if (value instanceof Date) {
        writer.uint32(9 /* DATE */).int64(value.getTime());
    }
    else if (value instanceof Array) {
        writeArray(value, writer.uint32(10 /* ARRAY */), deep + 1);
    }
    else {
        writeMap(value, writer.uint32(11 /* MAP */), deep + 1);
    }
}
exports.writeObject = writeObject;
function read(reader) {
    if (!(reader instanceof protobufjs_1.Reader)) {
        reader = protobufjs_1.Reader.create(reader);
    }
    const tag = reader.uint32();
    switch (tag) {
        case 0 /* NULL */:
            return null;
        case 1 /* UNDEFINED */:
            return undefined;
        case 2 /* BOOL */:
            return reader.bool();
        case 3 /* INT32 */:
            return reader.int32();
        case 4 /* INT */:
            return long2Number(reader.int64());
        case 5 /* DOUBLE */:
            return reader.double();
        case 6 /* INT64 */:
            return long2Bigint(reader.int64());
        case 7 /* STRING */:
            return reader.string();
        case 8 /* BYTES */:
            return reader.bytes();
        case 9 /* DATE */:
            return long2Date(reader.int64());
        case 10 /* ARRAY */:
            return readArray(reader);
        case 11 /* MAP */:
            return readMap(reader);
    }
}
exports.read = read;
function readArray(reader) {
    if (!(reader instanceof protobufjs_1.Reader)) {
        reader = protobufjs_1.Reader.create(reader);
    }
    const items = [];
    const count = reader.uint32();
    for (let i = 0; i < count; ++i) {
        items.push(read(reader));
    }
    return items;
}
exports.readArray = readArray;
function readMap(reader) {
    if (!(reader instanceof protobufjs_1.Reader)) {
        reader = protobufjs_1.Reader.create(reader);
    }
    const map = {};
    const count = reader.uint32();
    for (let i = 0; i < count; ++i) {
        map[reader.string()] = read(reader);
    }
    return map;
}
exports.readMap = readMap;
function serialize(value) {
    return write(value).finish();
}
exports.serialize = serialize;
function deserialize(data) {
    return read(data);
}
exports.deserialize = deserialize;
