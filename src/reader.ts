// Copyright (c) 2023 System233
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Readable } from "node:stream";
import { SizeOfEncoding, NullOfEncoding, SizeOfType } from "./constants";
import { Constructor, IBinaryHelper } from "./hepler";

// export interface BinaryTask {
//   resolve: (data: Buffer) => void;
//   reject: (reason: Error) => void;
//   size: number;
// }

export const BinaryReaderMixins = <T extends Constructor<Readable>>(Base: T) =>
  class IBinaryReader extends Base {
    protected _connect(stream: Readable): void {
      this.readable = true;
      super._connect(stream);
    }
    protected _disconnect(): void {
      this.readable = false;
      super._disconnect();
    }

    async read(size: number) {
      if (!this.readable) {
        throw new Error("stream not readable");
      }
      if (size <= this.stream.readableLength) {
        const data = this.stream.read(size) as Buffer;
        return data;
      }
      let current=0;
      const chunks:Buffer[]=[];
      while(current<size){
        await new Promise<void>((resolve,reject)=>{
          const error=()=>{
            reject(new Error("stream disconnected"));
            this.stream.off('readable',success)
          };
          const success=()=>{
            resolve();
            this.off('disconnect',error);
          }
          this.stream.once('readable',success);
          this.once('disconnect',error)
        })
        const len=Math.min(size-current,this.stream.readableLength);
        const chunk=this.stream.read(len);
        if(chunk){
          chunks.push(chunk);
          current+=len;
        }
      }
      return Buffer.concat(chunks)
    }
    async readUntil(until: Buffer) {
      const chunks: Buffer[] = [];
      do {
        const chunk = await this.read(until.length);
        chunks.push(chunk);
        if (!Buffer.compare(chunk, until)) {
          return Buffer.concat(chunks);
        }
      } while (true);
    }
    async readBytes(size: number) {
      return await this.read(size);
    }
    async readLine(encoding?: BufferEncoding) {
      const x = await this.readUntil(Buffer.from("\n", encoding));
      return x.toString(encoding);
    }
    async readCString(encoding?: BufferEncoding) {
      if (!encoding) {
        encoding = "utf8";
      }
      const size = SizeOfEncoding[encoding];
      const x = await this.readUntil(NullOfEncoding[encoding]);
      const data = x.subarray(0, x.length - size);
      if (
        encoding == "base64" ||
        encoding == "base64url" ||
        encoding == "hex" ||
        encoding == "binary"
      ) {
        return Buffer.from(data.toString(), encoding).toString();
      }
      return data.toString(encoding);
    }
    async readString(size: number, encoding?: BufferEncoding) {
      const x = await this.readBytes(size);
      if (
        encoding == "base64" ||
        encoding == "base64url" ||
        encoding == "hex" ||
        encoding == "binary"
      ) {
        return Buffer.from(x.toString(), encoding).toString();
      }
      return x.toString(encoding);
    }
    async readUTF8(size: number) {
      return await this.readString(size, "utf-8");
    }
    async readBase64(size: number) {
      const x = await this.readString(size);
      return Buffer.from(x, "base64");
    }
    async readHex(size: number) {
      const x = await this.readString(size);
      return Buffer.from(x, "hex");
    }

    async readInt(byteLength: number, littleEndian?: boolean) {
      if (littleEndian !== false) {
        return await this.readIntLE(byteLength);
      }
      return await this.readIntBE(byteLength);
    }
    async readIntLE(byteLength: number) {
      const x = await this.read(byteLength);
      return x.readIntLE(0, byteLength);
    }
    async readIntBE(byteLength: number) {
      const x = await this.read(byteLength);
      return x.readIntBE(0, byteLength);
    }

    async readUint(byteLength: number, littleEndian?: boolean) {
      if (littleEndian) {
        return await this.readUintLE(byteLength);
      }
      return await this.readUintBE(byteLength);
    }
    async readUintLE(byteLength: number) {
      const x = await this.read(byteLength);
      return x.readUintLE(0, byteLength);
    }
    async readUintBE(byteLength: number) {
      const x = await this.read(byteLength);
      return x.readUintBE(0, byteLength);
    }

    async readInt8() {
      const x = await this.read(SizeOfType.Int8);
      return x.readInt8();
    }

    async readInt16(littleEndian?: boolean) {
      if (littleEndian) {
        return await this.readInt16LE();
      }
      return await this.readInt16BE();
    }
    async readInt16LE() {
      const x = await this.read(SizeOfType.Int16);
      return x.readInt16LE();
    }
    async readInt16BE() {
      const x = await this.read(SizeOfType.Int16);
      return x.readInt16BE();
    }
    async readInt32(littleEndian?: boolean) {
      if (littleEndian) {
        return await this.readInt32LE();
      }
      return await this.readInt32BE();
    }
    async readInt32LE() {
      const x = await this.read(SizeOfType.Int32);
      return x.readInt32LE();
    }
    async readInt32BE() {
      const x = await this.read(SizeOfType.Int32);
      return x.readInt32BE();
    }

    async readBigInt64(littleEndian?: boolean) {
      if (littleEndian) {
        return await this.readBigInt64LE();
      }
      return await this.readBigInt64BE();
    }
    async readBigInt64LE() {
      const x = await this.read(SizeOfType.BigInt64);
      return x.readBigInt64LE();
    }
    async readBigInt64BE() {
      const x = await this.read(SizeOfType.BigInt64);
      return x.readBigInt64BE();
    }

    async readUint8() {
      const x = await this.read(SizeOfType.Int8);
      return x.readUint8();
    }
    async readUint16(littleEndian?: boolean) {
      if (littleEndian) {
        return await this.readUint16LE();
      }
      return await this.readUint16BE();
    }
    async readUint16LE() {
      const x = await this.read(SizeOfType.Int16);
      return x.readUint16LE();
    }
    async readUint16BE() {
      const x = await this.read(SizeOfType.Int16);
      return x.readUint16BE();
    }
    async readUint32(littleEndian?: boolean) {
      if (littleEndian) {
        return await this.readUint32LE();
      }
      return await this.readUint32BE();
    }
    async readUint32LE() {
      const x = await this.read(SizeOfType.Int32);
      return x.readUint32LE();
    }
    async readUint32BE() {
      const x = await this.read(SizeOfType.Int32);
      return x.readUint32BE();
    }
    async readBigUint64(littleEndian?: boolean) {
      if (littleEndian) {
        return await this.readBigUint64LE();
      }
      return await this.readBigUint64BE();
    }
    async readBigUint64LE() {
      const x = await this.read(SizeOfType.BigInt64);
      return x.readBigUint64LE();
    }
    async readBigUint64BE() {
      const x = await this.read(SizeOfType.BigInt64);
      return x.readBigUint64BE();
    }
    async readFloat(littleEndian?: boolean) {
      if (littleEndian) {
        return await this.readFloatLE();
      }
      return await this.readFloatBE();
    }
    async readFloatLE() {
      const x = await this.read(SizeOfType.Float);
      return x.readFloatLE();
    }
    async readFloatBE() {
      const x = await this.read(SizeOfType.Float);
      return x.readFloatBE();
    }
    async readDouble(littleEndian?: boolean) {
      if (littleEndian) {
        return await this.readDoubleLE();
      }
      return await this.readDoubleBE();
    }
    async readDoubleLE() {
      const x = await this.read(SizeOfType.Double);
      return x.readDoubleLE();
    }
    async readDoubleBE() {
      const x = await this.read(SizeOfType.Double);
      return x.readDoubleBE();
    }
  };
export class BinaryReader extends BinaryReaderMixins(IBinaryHelper<Readable>) {
  static from(
    stream: Readable,
    ...args: ConstructorParameters<typeof BinaryReader>
  ) {
    const ss = new this(...args);
    ss.connect(stream);
    return ss;
  }
}
