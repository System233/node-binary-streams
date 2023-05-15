// Copyright (c) 2023 System233
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Readable } from "node:stream";
import { SizeOfEncoding, NullOfEncoding, SizeOfType } from "./constants.js";
import { Constructor, IBinaryHelper } from "./hepler.js";
import { ReadableEvent } from "./events.js";

export interface IBinaryReadStream {
  get(size: number): Promise<Buffer>;
  readUntil(until: Buffer): Promise<Buffer>;
  readBytes(size: number): Promise<Buffer>;
  readLine(encoding?: BufferEncoding): Promise<string>;
  readCString(encoding?: BufferEncoding): Promise<string>;
  readString(size: number, encoding?: BufferEncoding): Promise<string>;
  readUTF8(size: number): Promise<string>;
  readBase64(size: number): Promise<Buffer>;
  readHex(size: number): Promise<Buffer>;
  readInt(byteLength: number, littleEndian?: boolean): Promise<number>;
  readIntLE(byteLength: number): Promise<number>;
  readIntBE(byteLength: number): Promise<number>;
  readUint(byteLength: number, littleEndian?: boolean): Promise<number>;
  readUintLE(byteLength: number): Promise<number>;
  readUintBE(byteLength: number): Promise<number>;
  readInt8(): Promise<number>;
  readInt16(littleEndian?: boolean): Promise<number>;
  readInt16LE(): Promise<number>;
  readInt16BE(): Promise<number>;
  readInt32(littleEndian?: boolean): Promise<number>;
  readInt32LE(): Promise<number>;
  readInt32BE(): Promise<number>;
  readBigInt64(littleEndian?: boolean): Promise<bigint>;
  readBigInt64LE(): Promise<bigint>;
  readBigInt64BE(): Promise<bigint>;
  readUint8(): Promise<number>;
  readUint16(littleEndian?: boolean): Promise<number>;
  readUint16LE(): Promise<number>;
  readUint16BE(): Promise<number>;
  readUint32(littleEndian?: boolean): Promise<number>;
  readUint32LE(): Promise<number>;
  readUint32BE(): Promise<number>;
  readBigUint64(littleEndian?: boolean): Promise<bigint>;
  readBigUint64LE(): Promise<bigint>;
  readBigUint64BE(): Promise<bigint>;
  readFloat(littleEndian?: boolean): Promise<number>;
  readFloatLE(): Promise<number>;
  readFloatBE(): Promise<number>;
  readDouble(littleEndian?: boolean): Promise<number>;
  readDoubleLE(): Promise<number>;
  readDoubleBE(): Promise<number>;
}

export const IBinaryReadStreamMixins = <T extends Readable>(
  Base: Constructor<IBinaryHelper<T> & Readable>
): Constructor<IBinaryHelper<T> & Readable & IBinaryReadStream> =>
  class IBinaryReadStreamImpl extends Base {
    async get(size: number) {
      if (!this.readable) {
        throw new Error("stream not readable");
      }
      if (size <= this.readableLength) {
        const data = this.read(size) as Buffer;
        return data;
      }
      let current = 0;
      const chunks: Buffer[] = [];
      while (current < size) {
        await new Promise<void>((resolve, reject) => {
          const error = () => {
            reject(new Error(`stream ${this.closed ? "closed" : "ended"}`));
            this.off("readable", success);
            this.off(this.closed ? "end" : "closed", error);
          };
          const success = () => {
            resolve();
            this.off("end", error);
            this.off("close", error);
          };
          this.once("readable", success);
          this.once("close", error);
          this.once("end", error);
        });
        const len = Math.min(size - current, this.readableLength);
        const chunk = this.read(len);
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
        const chunk = await this.get(until.length);
        chunks.push(chunk);
        if (!Buffer.compare(chunk, until)) {
          return Buffer.concat(chunks);
        }
      } while (true);
    }
    async readBytes(size: number) {
      return await this.get(size);
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
      const x = await this.get(byteLength);
      return x.readIntLE(0, byteLength);
    }
    async readIntBE(byteLength: number) {
      const x = await this.get(byteLength);
      return x.readIntBE(0, byteLength);
    }

    async readUint(byteLength: number, littleEndian?: boolean) {
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
        return await this.readUintLE(byteLength);
      }
      return await this.readUintBE(byteLength);
    }
    async readUintLE(byteLength: number) {
      const x = await this.get(byteLength);
      return x.readUintLE(0, byteLength);
    }
    async readUintBE(byteLength: number) {
      const x = await this.get(byteLength);
      return x.readUintBE(0, byteLength);
    }

    async readInt8() {
      const x = await this.get(SizeOfType.Int8);
      return x.readInt8();
    }

    async readInt16(littleEndian?: boolean) {
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
        return await this.readInt16LE();
      }
      return await this.readInt16BE();
    }
    async readInt16LE() {
      const x = await this.get(SizeOfType.Int16);
      return x.readInt16LE();
    }
    async readInt16BE() {
      const x = await this.get(SizeOfType.Int16);
      return x.readInt16BE();
    }
    async readInt32(littleEndian?: boolean) {
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
        return await this.readInt32LE();
      }
      return await this.readInt32BE();
    }
    async readInt32LE() {
      const x = await this.get(SizeOfType.Int32);
      return x.readInt32LE();
    }
    async readInt32BE() {
      const x = await this.get(SizeOfType.Int32);
      return x.readInt32BE();
    }

    async readBigInt64(littleEndian?: boolean) {
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
        return await this.readBigInt64LE();
      }
      return await this.readBigInt64BE();
    }
    async readBigInt64LE() {
      const x = await this.get(SizeOfType.BigInt64);
      return x.readBigInt64LE();
    }
    async readBigInt64BE() {
      const x = await this.get(SizeOfType.BigInt64);
      return x.readBigInt64BE();
    }

    async readUint8() {
      const x = await this.get(SizeOfType.Int8);
      return x.readUint8();
    }
    async readUint16(littleEndian?: boolean) {
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
        return await this.readUint16LE();
      }
      return await this.readUint16BE();
    }
    async readUint16LE() {
      const x = await this.get(SizeOfType.Int16);
      return x.readUint16LE();
    }
    async readUint16BE() {
      const x = await this.get(SizeOfType.Int16);
      return x.readUint16BE();
    }
    async readUint32(littleEndian?: boolean) {
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
        return await this.readUint32LE();
      }
      return await this.readUint32BE();
    }
    async readUint32LE() {
      const x = await this.get(SizeOfType.Int32);
      return x.readUint32LE();
    }
    async readUint32BE() {
      const x = await this.get(SizeOfType.Int32);
      return x.readUint32BE();
    }
    async readBigUint64(littleEndian?: boolean) {
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
        return await this.readBigUint64LE();
      }
      return await this.readBigUint64BE();
    }
    async readBigUint64LE() {
      const x = await this.get(SizeOfType.BigInt64);
      return x.readBigUint64LE();
    }
    async readBigUint64BE() {
      const x = await this.get(SizeOfType.BigInt64);
      return x.readBigUint64BE();
    }
    async readFloat(littleEndian?: boolean) {
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
        return await this.readFloatLE();
      }
      return await this.readFloatBE();
    }
    async readFloatLE() {
      const x = await this.get(SizeOfType.Float);
      return x.readFloatLE();
    }
    async readFloatBE() {
      const x = await this.get(SizeOfType.Float);
      return x.readFloatBE();
    }
    async readDouble(littleEndian?: boolean) {
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
        return await this.readDoubleLE();
      }
      return await this.readDoubleBE();
    }
    async readDoubleLE() {
      const x = await this.get(SizeOfType.Double);
      return x.readDoubleLE();
    }
    async readDoubleBE() {
      const x = await this.get(SizeOfType.Double);
      return x.readDoubleBE();
    }
  };

export const IBinaryReadableMixins = <T extends Readable>(
  Base: Constructor<IBinaryHelper<T>>
): Constructor<IBinaryHelper<T> & Readable> =>
  class IBinaryReadableImpl extends Base implements Readable {
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
    get _construct() {
      return this.stream._construct;
    }
    set _construct(value) {
      this.stream._construct = value;
    }
    _read(size: number): void {
      this.stream._read(size);
    }
    read(size?: number) {
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
    unpipe(destination?: NodeJS.WritableStream): this {
      this.stream.unpipe(destination);
      return this;
    }
    unshift(chunk: any, encoding?: BufferEncoding): void {
      this.stream.unshift(chunk, encoding);
    }
    wrap(stream: NodeJS.ReadableStream): this {
      this.stream.wrap(stream);
      return this;
    }
    push(chunk: any, encoding?: BufferEncoding): boolean {
      return this.stream.push(chunk, encoding);
    }
    _destroy(
      error: Error | null,
      callback: (error?: Error | null) => void
    ): void {
      this.stream._destroy(error, callback);
    }
    destroy(error?: Error): this {
      this.stream.destroy(error);
      return this;
    }
    addListener<T extends keyof ReadableEvent>(
      event: T,
      listener: ReadableEvent[T]
    ): this {
      this.stream.addListener(event, listener);
      return this;
    }
    emit<T extends keyof ReadableEvent>(
      event: T,
      ...args: Parameters<ReadableEvent[T]>
    ): boolean {
      return this.stream.emit(event, ...args);
    }
    on<T extends keyof ReadableEvent>(
      event: T,
      listener: ReadableEvent[T]
    ): this {
      this.stream.on(event, listener);
      return this;
    }
    once<T extends keyof ReadableEvent>(
      event: T,
      listener: ReadableEvent[T]
    ): this {
      this.stream.once(event, listener);
      return this;
    }
    prependListener<T extends keyof ReadableEvent>(
      event: T,
      listener: ReadableEvent[T]
    ): this {
      this.stream.prependListener(event, listener);
      return this;
    }
    prependOnceListener<T extends keyof ReadableEvent>(
      event: T,
      listener: ReadableEvent[T]
    ): this {
      this.stream.prependOnceListener(event, listener);
      return this;
    }
    removeListener<T extends keyof ReadableEvent>(
      event: T,
      listener: ReadableEvent[T]
    ): this {
      this.stream.removeListener(event, listener);
      return this;
    }
    [Symbol.asyncIterator](): AsyncIterableIterator<any> {
      return this.stream[Symbol.asyncIterator]();
    }
    pipe<T extends NodeJS.WritableStream>(
      destination: T,
      options?: { end?: boolean | undefined }
    ): T {
      return this.stream.pipe(destination, options);
    }
    off(eventName: string | symbol, listener: (...args: any[]) => void): this {
      this.stream.off(eventName, listener);
      return this;
    }
    removeAllListeners(event?: string | symbol): this {
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
    listenerCount(eventName: string | symbol, listener?: Function): number {
      return this.stream.listenerCount(eventName, listener);
    }
    eventNames(): (string | symbol)[] {
      return this.stream.eventNames();
    }
  };

export const BinaryReadStreamMixins = <T extends Readable>(
  Base: Constructor<IBinaryHelper<T>>
) => IBinaryReadStreamMixins(IBinaryReadableMixins(Base));

export class BinaryReadStream extends BinaryReadStreamMixins(
  IBinaryHelper<Readable>
) {
  static from(...args: ConstructorParameters<typeof IBinaryHelper<Readable>>) {
    return new this(...args);
  }
}
