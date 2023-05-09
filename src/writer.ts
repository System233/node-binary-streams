// Copyright (c) 2023 System233
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Writable } from "node:stream";
import { NullOfEncoding, SizeOfType } from "./constants";
import { Constructor, IBinaryHelper } from "./hepler";

export const BinaryWriterMixins = <T extends Constructor<Writable>>(Base: T) =>
  class IBinaryWriter extends Base {
    protected chunks: Buffer[] = [];
    protected _connect(stream: Writable): void {
      this.writable = true;
      super._connect(stream);
    }
    protected _disconnect(): void {
      this.writable = false;
      super._disconnect();
    }
    get() {
      return Buffer.concat(this.chunks);
    }
    clear() {
      this.chunks = [];
    }
    alloc(size: number, writer: (buffer: Buffer) => void) {
      const buffer = Buffer.alloc(size);
      writer(buffer);
      this.writeBytes(buffer);
      return this;
    }
    flush() {
      if (!this.writable) {
        throw new Error("stream not writable");
      }
      const data = this.get();
      this.stream.write(data);
      this.chunks = [];
      return this;
    }
    write(data: Buffer) {
      this.chunks.push(data);
      return this;
    }
    writeBytes(chunk: Buffer) {
      return this.write(chunk);
    }
    writeString(value: string, encoding?: BufferEncoding) {
      if (
        encoding == "base64" ||
        encoding == "base64url" ||
        encoding == "binary" ||
        encoding == "hex"
      ) {
        this.writeString(Buffer.from(value).toString(encoding));
        return this;
      }
      return this.writeBytes(Buffer.from(value, encoding));
    }
    writeCString(value: string, encoding?: BufferEncoding) {
      if (!encoding) {
        encoding = "utf8";
      }
      return this.writeString(value, encoding).write(NullOfEncoding[encoding]);
    }
    writeLine(line: string, end = "\n", encoding?: BufferEncoding) {
      return this.writeString(line, encoding).writeString(end, encoding);
    }
    writeUTF8(value: string) {
      return this.writeString(value, "utf-8");
    }
    writeBase64(value: Buffer) {
      return this.writeString(value.toString("base64"));
    }
    writeHex(value: Buffer) {
      return this.writeString(value.toString("hex"));
    }
    writeInt(value: number, byteLength: number, littleEndian?: boolean) {
      if (littleEndian !== false) {
        return this.writeIntLE(value, byteLength);
      }
      return this.writeIntBE(value, byteLength);
    }
    writeIntLE(value: number, byteLength: number) {
      return this.alloc(byteLength, (x) => x.writeIntLE(value, 0, byteLength));
    }
    writeIntBE(value: number, byteLength: number) {
      return this.alloc(byteLength, (x) => x.writeIntBE(value, 0, byteLength));
    }
    writeUint(value: number, byteLength: number, littleEndian?: boolean) {
      if (littleEndian) {
        return this.writeUintLE(value, byteLength);
      }
      return this.writeUintBE(value, byteLength);
    }
    writeUintLE(value: number, byteLength: number) {
      return this.alloc(byteLength, (x) => x.writeUintLE(value, 0, byteLength));
    }
    writeUintBE(value: number, byteLength: number) {
      return this.alloc(byteLength, (x) => x.writeUintBE(value, 0, byteLength));
    }

    writeInt8(value: number) {
      return this.alloc(SizeOfType.Int8, (x) => x.writeInt8(value));
    }
    writeInt16(value: number, littleEndian?: boolean) {
      if (littleEndian) {
        return this.writeInt16LE(value);
      }
      return this.writeInt16BE(value);
    }
    writeInt16LE(value: number) {
      return this.alloc(SizeOfType.Int16, (x) => x.writeInt16LE(value));
    }
    writeInt16BE(value: number) {
      return this.alloc(SizeOfType.Int16, (x) => x.writeInt16BE(value));
    }
    writeInt32(value: number, littleEndian?: boolean) {
      if (littleEndian) {
        return this.writeInt32LE(value);
      }
      return this.writeInt32BE(value);
    }
    writeInt32LE(value: number) {
      return this.alloc(SizeOfType.Int32, (x) => x.writeInt32LE(value));
    }
    writeInt32BE(value: number) {
      return this.alloc(SizeOfType.Int32, (x) => x.writeInt32BE(value));
    }
    writeBigInt64(value: bigint, littleEndian?: boolean) {
      if (littleEndian) {
        return this.writeBigInt64LE(value);
      }
      return this.writeBigInt64BE(value);
    }
    writeBigInt64LE(value: bigint) {
      return this.alloc(SizeOfType.BigInt64, (x) => x.writeBigInt64LE(value));
    }
    writeBigInt64BE(value: bigint) {
      return this.alloc(SizeOfType.BigInt64, (x) => x.writeBigInt64BE(value));
    }

    writeUint8(value: number) {
      return this.alloc(SizeOfType.Int8, (x) => x.writeUint8(value));
    }
    writeUint16(value: number, littleEndian?: boolean) {
      if (littleEndian) {
        return this.writeUint16LE(value);
      }
      return this.writeUint16BE(value);
    }
    writeUint16LE(value: number) {
      return this.alloc(SizeOfType.Int16, (x) => x.writeUint16LE(value));
    }
    writeUint16BE(value: number) {
      return this.alloc(SizeOfType.Int16, (x) => x.writeUint16BE(value));
    }
    writeUint32(value: number, littleEndian?: boolean) {
      if (littleEndian) {
        return this.writeUint32LE(value);
      }
      return this.writeUint32BE(value);
    }
    writeUint32LE(value: number) {
      return this.alloc(SizeOfType.Int32, (x) => x.writeUint32LE(value));
    }
    writeUint32BE(value: number) {
      return this.alloc(SizeOfType.Int32, (x) => x.writeUint32BE(value));
    }
    writeBigUint64(value: bigint, littleEndian?: boolean) {
      if (littleEndian) {
        return this.writeBigUint64LE(value);
      }
      return this.writeBigUint64BE(value);
    }
    writeBigUint64LE(value: bigint) {
      return this.alloc(SizeOfType.BigInt64, (x) => x.writeBigUint64LE(value));
    }
    writeBigUint64BE(value: bigint) {
      return this.alloc(SizeOfType.BigInt64, (x) => x.writeBigUint64BE(value));
    }
    writeFloat(value: number, littleEndian?: boolean) {
      if (littleEndian) {
        return this.writeFloatLE(value);
      }
      return this.writeFloatBE(value);
    }
    writeFloatLE(value: number) {
      return this.alloc(SizeOfType.Float, (x) => x.writeFloatLE(value));
    }
    writeFloatBE(value: number) {
      return this.alloc(SizeOfType.Float, (x) => x.writeFloatBE(value));
    }
    writeDouble(value: number, littleEndian?: boolean) {
      if (littleEndian) {
        return this.writeDoubleLE(value);
      }
      return this.writeDoubleBE(value);
    }
    writeDoubleLE(value: number) {
      return this.alloc(SizeOfType.Double, (x) => x.writeDoubleLE(value));
    }
    writeDoubleBE(value: number) {
      return this.alloc(SizeOfType.Double, (x) => x.writeDoubleBE(value));
    }
  };

export class BinaryWriter extends BinaryWriterMixins(IBinaryHelper<Writable>) {
  static from(
    stream: Writable,
    ...args: ConstructorParameters<typeof BinaryWriter>
  ) {
    const ss = new this(...args);
    ss.connect(stream);
    return ss;
  }
}
