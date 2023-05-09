// Copyright (c) 2023 System233
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Writable } from "node:stream";
import { NullOfEncoding, SizeOfType } from "./constants";
import { IBinaryHelperConstructor, Constructor, IBinaryHelper } from "./hepler";
import { Readable } from "stream";

export const BinaryWriteStreamMixins = <
  T extends IBinaryHelperConstructor<Writable>
>(
  Base: T
) =>
  class IBinaryWriter extends Base {
    alloc(size: number, writer: (buffer: Buffer) => void) {
      const buffer = Buffer.alloc(size);
      writer(buffer);
      this.writeBytes(buffer);
      return this;
    }

    writeBytes(chunk: Buffer) {
      this.write(chunk);
      return this;
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
      return this.writeString(value, encoding).writeBytes(
        NullOfEncoding[encoding]
      );
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
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
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
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
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
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
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
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
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
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
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
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
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
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
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
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
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
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
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
      if (littleEndian === void 0 ? this.littleEndian : littleEndian) {
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
export const IBinaryWritableMixins = <
  T extends Constructor<IBinaryHelper<Writable>>
>(
  Base: T
) =>
  class IBinaryWriter extends Base implements Writable {
    get writable() {
      return this.stream.writable;
    }
    get writableEnded() {
      return this.stream.writableEnded;
    }
    get writableFinished() {
      return this.stream.writableFinished;
    }
    get writableHighWaterMark() {
      return this.stream.writableHighWaterMark;
    }
    get writableLength() {
      return this.stream.writableLength;
    }
    get writableObjectMode() {
      return this.stream.writableObjectMode;
    }
    get writableCorked() {
      return this.stream.writableCorked;
    }
    get destroyed() {
      return this.stream.destroyed;
    }
    get closed() {
      return this.stream.closed;
    }
    get errored() {
      return this.stream.errored;
    }
    get writableNeedDrain() {
      return this.stream.writableNeedDrain;
    }
    _write(
      chunk: any,
      encoding: BufferEncoding,
      callback: (error?: Error | null | undefined) => void
    ): void {
      return this.stream._write(chunk, encoding, callback);
    }
    _writev?(
      chunks: { chunk: any; encoding: BufferEncoding }[],
      callback: (error?: Error | null | undefined) => void
    ): void {
      return this.stream._writev?.(chunks, callback);
    }
    _construct?(callback: (error?: Error | null | undefined) => void): void {
      return this.stream._construct?.(callback);
    }
    _destroy(
      error: Error | null,
      callback: (error?: Error | null | undefined) => void
    ): void {
      return this.stream._destroy(error, callback);
    }
    _final(callback: (error?: Error | null | undefined) => void): void {
      return this.stream._final(callback);
    }
    write(
      chunk: any,
      callback?: ((error: Error | null | undefined) => void) | undefined
    ): boolean;
    write(
      chunk: any,
      encoding: BufferEncoding,
      callback?: ((error: Error | null | undefined) => void) | undefined
    ): boolean;
    write(chunk: any, encoding?: any, callback?: any): boolean {
      return this.stream.write(chunk, encoding, callback);
    }
    setDefaultEncoding(encoding: BufferEncoding): this {
      this.stream.setDefaultEncoding(encoding);
      return this;
    }
    end(cb?: (() => void) | undefined): this;
    end(chunk: any, cb?: (() => void) | undefined): this;
    end(
      chunk: any,
      encoding: BufferEncoding,
      cb?: (() => void) | undefined
    ): this;
    end(chunk?: unknown, encoding?: unknown, cb?: unknown): this {
      this.stream.end(chunk);
      return this;
    }
    cork(): void {
      return this.stream.cork();
    }
    uncork(): void {
      return this.stream.uncork();
    }
    destroy(error?: Error | undefined): this {
      this.stream.destroy(error);
      return this;
    }
    addListener(event: "close", listener: () => void): this;
    addListener(event: "drain", listener: () => void): this;
    addListener(event: "error", listener: (err: Error) => void): this;
    addListener(event: "finish", listener: () => void): this;
    addListener(event: "pipe", listener: (src: Readable) => void): this;
    addListener(event: "unpipe", listener: (src: Readable) => void): this;
    addListener(
      event: string | symbol,
      listener: (...args: any[]) => void
    ): this {
      this.stream.addListener(event, listener);
      return this;
    }
    emit(event: "close"): boolean;
    emit(event: "drain"): boolean;
    emit(event: "error", err: Error): boolean;
    emit(event: "finish"): boolean;
    emit(event: "pipe", src: Readable): boolean;
    emit(event: "unpipe", src: Readable): boolean;
    emit(event: string | symbol, ...args: any[]): boolean {
      return this.stream.emit(event, ...args);
    }
    on(event: "close", listener: () => void): this;
    on(event: "drain", listener: () => void): this;
    on(event: "error", listener: (err: Error) => void): this;
    on(event: "finish", listener: () => void): this;
    on(event: "pipe", listener: (src: Readable) => void): this;
    on(event: "unpipe", listener: (src: Readable) => void): this;
    on(event: string | symbol, listener: (...args: any[]) => void): this {
      this.stream.on(event, listener);
      return this;
    }
    once(event: "close", listener: () => void): this;
    once(event: "drain", listener: () => void): this;
    once(event: "error", listener: (err: Error) => void): this;
    once(event: "finish", listener: () => void): this;
    once(event: "pipe", listener: (src: Readable) => void): this;
    once(event: "unpipe", listener: (src: Readable) => void): this;
    once(event: string | symbol, listener: (...args: any[]) => void): this {
      this.stream.once(event, listener);
      return this;
    }
    prependListener(event: "close", listener: () => void): this;
    prependListener(event: "drain", listener: () => void): this;
    prependListener(event: "error", listener: (err: Error) => void): this;
    prependListener(event: "finish", listener: () => void): this;
    prependListener(event: "pipe", listener: (src: Readable) => void): this;
    prependListener(event: "unpipe", listener: (src: Readable) => void): this;
    prependListener(
      event: string | symbol,
      listener: (...args: any[]) => void
    ): this {
      this.stream.prependListener(event, listener);
      return this;
    }
    prependOnceListener(event: "close", listener: () => void): this;
    prependOnceListener(event: "drain", listener: () => void): this;
    prependOnceListener(event: "error", listener: (err: Error) => void): this;
    prependOnceListener(event: "finish", listener: () => void): this;
    prependOnceListener(event: "pipe", listener: (src: Readable) => void): this;
    prependOnceListener(
      event: "unpipe",
      listener: (src: Readable) => void
    ): this;
    prependOnceListener(
      event: string | symbol,
      listener: (...args: any[]) => void
    ): this {
      this.stream.prependOnceListener(event, listener);
      return this;
    }
    removeListener(event: "close", listener: () => void): this;
    removeListener(event: "drain", listener: () => void): this;
    removeListener(event: "error", listener: (err: Error) => void): this;
    removeListener(event: "finish", listener: () => void): this;
    removeListener(event: "pipe", listener: (src: Readable) => void): this;
    removeListener(event: "unpipe", listener: (src: Readable) => void): this;
    removeListener(
      event: string | symbol,
      listener: (...args: any[]) => void
    ): this {
      this.stream.removeListener(event, listener);
      return this;
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
      return this.listeners(eventName);
    }
    rawListeners(eventName: string | symbol): Function[] {
      return this.rawListeners(eventName);
    }
    listenerCount(
      eventName: string | symbol,
      listener?: Function | undefined
    ): number {
      return this.listenerCount(eventName, listener);
    }
    eventNames(): (string | symbol)[] {
      return this.eventNames();
    }
  };
export class BinaryWriteStream extends BinaryWriteStreamMixins(
  IBinaryWritableMixins(IBinaryHelper<Writable>)
) {
  static from(...args: ConstructorParameters<typeof BinaryWriteStream>) {
    return new this(...args);
  }
}
