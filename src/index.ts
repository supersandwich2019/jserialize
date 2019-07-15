
import { Reader, Writer, Long } from 'protobufjs';

const enum TYPE {
  NULL,
  UNDEFINED,
  BOOL,
  INT32,
  INT,
  DOUBLE,
  INT64,
  STRING,
  BYTES,
  DATE,
  ARRAY,
  MAP
}

function bigint2Long(value: bigint) {
  if (value <= Number.MAX_SAFE_INTEGER && value >= Number.MIN_SAFE_INTEGER) {
    return Number.parseInt(<any>value);
  } else {
    return value.toString();
  }
}

function long2Bigint(value: Long) {
  return BigInt(value.low) + (BigInt(value.high) << 32n);
}

function long2Number(value: Long) {
  const v = long2Bigint(value);
  return Number.parseInt(<any>v);
}

function long2Date(value: Long) {
  return new Date(long2Number(value));
}

export function write(value: any, writer?: Writer | null | undefined, deep = 0): Writer {
  if (deep > 100) {
    throw new Error('Serialize too deep');
  }
  if (null == writer) {
    writer = Writer.create();
  }
  if (value === null) {
    writer.uint32(TYPE.NULL);
  } else if (value === undefined) {
    writer.uint32(TYPE.UNDEFINED);
  } else {

    switch (typeof value) {
      case 'number':
        if ((value | 0) === value) {
          writer.uint32(TYPE.INT32).int32(value);
        } else if (Number.isInteger(value)) {
          writer.uint32(TYPE.INT).int64(value);
        } else {
          writer.uint32(TYPE.DOUBLE).double(value);
        }
        break;
      case 'string':
        writer.uint32(TYPE.STRING).string(value);
        break;
      case 'bigint':
        writer.uint32(TYPE.INT64).int64(bigint2Long(value));
        break;
      case 'boolean':
        writer.uint32(TYPE.BOOL).bool(value);
        break;
      case 'object':
        writeObject(value, writer, deep + 1);
        break;
    }
  }
  return writer;
}

export function writeArray(array: any[], writer?: Writer | null | undefined, deep = 0): Writer {
  if (writer == null) {
    writer = Writer.create();
  }
  writer.uint32(array.length);
  for (const v of array) {
    write(v, writer, deep + 1);
  }
  return writer;
}

export function writeMap(value: any, writer?: Writer | null | undefined, deep = 0): Writer {
  if (writer == null) {
    writer = Writer.create();
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


export function writeObject(value: any, writer: Writer, deep: number) {
  if (value instanceof Buffer || value instanceof Uint8Array) {
    writer.uint32(TYPE.BYTES).bytes(value);
  } else if (value instanceof Date) {
    writer.uint32(TYPE.DATE).int64(value.getTime());
  } else if (value instanceof Array) {
    writeArray(value, writer.uint32(TYPE.ARRAY), deep + 1);
  } else {
    writeMap(value, writer.uint32(TYPE.MAP), deep + 1);
  }
}


export function read(reader: Reader | Uint8Array) {
  if (!(reader instanceof Reader)) {
    reader = Reader.create(reader);
  }
  const tag = reader.uint32();
  switch (tag) {
    case TYPE.NULL:
      return null;
    case TYPE.UNDEFINED:
      return undefined;
    case TYPE.BOOL:
      return reader.bool();
    case TYPE.INT32:
      return reader.int32();
    case TYPE.INT:
      return long2Number(reader.int64());
    case TYPE.DOUBLE:
      return reader.double();
    case TYPE.INT64:
      return long2Bigint(reader.int64());
    case TYPE.STRING:
      return reader.string();
    case TYPE.BYTES:
      return reader.bytes();
    case TYPE.DATE:
      return long2Date(reader.int64());
    case TYPE.ARRAY:
      return readArray(reader);
    case TYPE.MAP:
      return readMap(reader);

  }
}


export function readArray(reader: Reader | Uint8Array): any[] {
  if (!(reader instanceof Reader)) {
    reader = Reader.create(reader);
  }
  const items = [];
  const count = reader.uint32();
  for (let i = 0; i < count; ++i) {
    items.push(read(reader));
  }
  return items;
}


export function readMap(reader: Reader | Uint8Array): { [k: string]: any } {
  if (!(reader instanceof Reader)) {
    reader = Reader.create(reader);
  }
  const map: any = {};
  const count = reader.uint32();
  for (let i = 0; i < count; ++i) {
    map[reader.string()] = read(reader);
  }
  return map;
}

export function serialize(value: any): Uint8Array {
  return write(value).finish();
}

export function deserialize(data: Uint8Array): any {
  return read(data);
}
