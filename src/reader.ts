// Copyright (c) 2023 System233
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Readable } from "node:stream";
import { SizeOfEncoding, NullOfEncoding, SizeOfType } from "./constants";
import { IBinaryHelperConstructor, Constructor, IBinaryHelper } from "./hepler";

export const BinaryReadStreamMixins = <
  T extends IBinaryHelperConstructor<Readable>
>(
  Base: T
) =>
  class IBinaryReader extends Base {
    async read(size: number) {
      if (!this.readable) {
        throw new Error("stream not readable");
      }
      if (size <= this.stream.readableLength) {
        const data = this.stream.read(size) as Buffer;
        return data;
      }
      let current = 0;
      const chunks: Buffer[] = [];
      while (current < size) {
        await new Promise<void>((resolve, reject) => {
          const error = () => {
            reject(new Error("stream ended"));
            this.stream.off("readable", success);
            this.stream.off("end", error);
            this.stream.off("close", error);
          };
          const success = () => {
            resolve();
            this.stream.off("end", error);
            this.stream.off("close", error);
          };
          this.stream.once("readable", success);
          this.stream.once("close", error);
          this.stream.once("end", error);
        });
        const len = Math.min(size - current, this.stream.readableLength);
        const chunk = this.stream.read(len);
        if (chunk) {
          chunks.push(chunk);
          current += len;
        }
      }
      return Buffer.concat(chunks);
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
      littleEndian = littleEndian === void 0 ? this.littleEndian : littleEndian;
      if (littleEndian) {
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
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
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
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
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
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
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
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
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
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
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
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
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
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
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
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
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
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
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

export const IBinaryReadableMixins = <
  T extends Constructor<IBinaryHelper<Readable>>
>(
  Base: T
) =>
  class IBinaryReader extends Base implements Readable {
    get readableAborted() {
      return this.stream.readableAborted;
    }
    get readable() {
      return this.stream.readable;
    }
    get readableDidRead() {
      return this.stream.readableDidRead;
    }
    get readableEncoding() {
      return this.stream.readableEncoding;
    }
    get readableEnded() {
      return this.stream.readableEnded;
    }
    get readableFlowing() {
      return this.stream.readableFlowing;
    }
    get readableHighWaterMark() {
      return this.stream.readableHighWaterMark;
    }
    get readableObjectMode() {
      return this.stream.readableObjectMode;
    }
    get destroyed() {
      return this.stream.destroyed;
    }
    get readableLength() {
      return this.stream.readableLength;
    }
    get errored() {
      return this.stream.errored;
    }
    get closed() {
      return this.stream.closed;
    }
    _construct?(callback: (error?: Error | null | undefined) => void): void {
      this.stream._construct?.(callback);
    }
    _read(size: number): void {
      this.stream._read(size);
    }
    read(size?: number | undefined) {
      return this.stream.read(size);
    }
    setEncoding(encoding: BufferEncoding): this {
      this.stream.setEncoding(encoding);
      return this;
    }
    pause(): this {
      this.stream.pause();
      return this;
    }
    resume(): this {
      this.stream.resume();
      return this;
    }
    isPaused(): boolean {
      return this.stream.isPaused();
    }
    unpipe(destination?: NodeJS.WritableStream | undefined): this {
      this.stream.unpipe(destination);
      return this;
    }
    unshift(chunk: any, encoding?: BufferEncoding | undefined): void {
      this.stream.unshift(chunk, encoding);
    }
    wrap(stream: NodeJS.ReadableStream): this {
      this.stream.wrap(stream);
      return this;
    }
    push(chunk: any, encoding?: BufferEncoding | undefined): boolean {
      return this.stream.push(chunk, encoding);
    }
    _destroy(
      error: Error | null,
      callback: (error?: Error | null | undefined) => void
    ): void {
      this.stream._destroy(error, callback);
    }
    destroy(error?: Error | undefined): this {
      this.stream.destroy(error);
      return this;
    }
    addListener(event: "close", listener: () => void): this;
    addListener(event: "data", listener: (chunk: any) => void): this;
    addListener(event: "end", listener: () => void): this;
    addListener(event: "error", listener: (err: Error) => void): this;
    addListener(event: "pause", listener: () => void): this;
    addListener(event: "readable", listener: () => void): this;
    addListener(event: "resume", listener: () => void): this;
    addListener(
      event: string | symbol,
      listener: (...args: any[]) => void
    ): this {
      this.stream.addListener(event, listener);
      return this;
    }
    emit(event: "close"): boolean;
    emit(event: "data", chunk: any): boolean;
    emit(event: "end"): boolean;
    emit(event: "error", err: Error): boolean;
    emit(event: "pause"): boolean;
    emit(event: "readable"): boolean;
    emit(event: "resume"): boolean;
    emit(event: string | symbol, ...args: any[]): boolean {
      return this.stream.emit(event, ...args);
    }
    on(event: "close", listener: () => void): this;
    on(event: "data", listener: (chunk: any) => void): this;
    on(event: "end", listener: () => void): this;
    on(event: "error", listener: (err: Error) => void): this;
    on(event: "pause", listener: () => void): this;
    on(event: "readable", listener: () => void): this;
    on(event: "resume", listener: () => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this {
      this.stream.on(event, listener);
      return this;
    }
    once(event: "close", listener: () => void): this;
    once(event: "data", listener: (chunk: any) => void): this;
    once(event: "end", listener: () => void): this;
    once(event: "error", listener: (err: Error) => void): this;
    once(event: "pause", listener: () => void): this;
    once(event: "readable", listener: () => void): this;
    once(event: "resume", listener: () => void): this;
    once(event: string | symbol, listener: (...args: any[]) => void): this {
      this.stream.once(event, listener);
      return this;
    }
    prependListener(event: "close", listener: () => void): this;
    prependListener(event: "data", listener: (chunk: any) => void): this;
    prependListener(event: "end", listener: () => void): this;
    prependListener(event: "error", listener: (err: Error) => void): this;
    prependListener(event: "pause", listener: () => void): this;
    prependListener(event: "readable", listener: () => void): this;
    prependListener(event: "resume", listener: () => void): this;
    prependListener(
      event: string | symbol,
      listener: (...args: any[]) => void
    ): this {
      this.stream.prependListener(event, listener);
      return this;
    }
    prependOnceListener(event: "close", listener: () => void): this;
    prependOnceListener(event: "data", listener: (chunk: any) => void): this;
    prependOnceListener(event: "end", listener: () => void): this;
    prependOnceListener(event: "error", listener: (err: Error) => void): this;
    prependOnceListener(event: "pause", listener: () => void): this;
    prependOnceListener(event: "readable", listener: () => void): this;
    prependOnceListener(event: "resume", listener: () => void): this;
    prependOnceListener(
      event: string | symbol,
      listener: (...args: any[]) => void
    ): this {
      this.stream.prependOnceListener(event, listener);
      return this;
    }
    removeListener(event: "close", listener: () => void): this;
    removeListener(event: "data", listener: (chunk: any) => void): this;
    removeListener(event: "end", listener: () => void): this;
    removeListener(event: "error", listener: (err: Error) => void): this;
    removeListener(event: "pause", listener: () => void): this;
    removeListener(event: "readable", listener: () => void): this;
    removeListener(event: "resume", listener: () => void): this;
    removeListener(
      event: string | symbol,
      listener: (...args: any[]) => void
    ): this {
      this.stream.removeListener(event, listener);
      return this;
    }
    [Symbol.asyncIterator](): AsyncIterableIterator<any> {
      return this.stream[Symbol.asyncIterator]();
    }
    pipe<T extends NodeJS.WritableStream>(
      destination: T,
      options?: { end?: boolean | undefined } | undefined
    ): T {
      return this.stream.pipe(destination, options);
    }
    off(eventName: string | symbol, listener: (...args: any[]) => void): this {
      this.stream.off(eventName, listener);
      return this;
    }
    removeAllListeners(event?: string | symbol | undefined): this {
      this.stream.removeAllListeners(event);
      return this;
    }
    setMaxListeners(n: number): this {
      this.stream.setMaxListeners(n);
      return this;
    }
    getMaxListeners(): number {
      return this.stream.getMaxListeners();
    }
    listeners(eventName: string | symbol): Function[] {
      return this.stream.listeners(eventName);
    }
    rawListeners(eventName: string | symbol): Function[] {
      return this.stream.rawListeners(eventName);
    }
    listenerCount(
      eventName: string | symbol,
      listener?: Function | undefined
    ): number {
      return this.stream.listenerCount(eventName, listener);
    }
    eventNames(): (string | symbol)[] {
      return this.stream.eventNames();
    }
  };
export class BinaryReadStream extends BinaryReadStreamMixins(
  IBinaryReadableMixins(IBinaryHelper<Readable>)
) {
  static from(...args: ConstructorParameters<typeof BinaryReadStream>) {
    return new this(...args);
  }
}
