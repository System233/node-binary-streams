// Copyright (c) 2023 System233
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Writable } from "node:stream";
import { NullOfEncoding, SizeOfType } from "./constants.js";
import { IBinaryHelperConstructor, Constructor, IBinaryHelper } from "./hepler.js";
import { WritableEvent } from "./events.js";

export const IBinaryWriteStreamMixins = <
  T extends IBinaryHelperConstructor<Writable>
>(
  Base: T
) =>
  class IBinaryWriteStreamImpl extends Base {
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
  class IBinaryWritableImpl extends Base implements Writable {
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
      callback: (error?: Error | null) => void
    ): void {
      return this.stream._write(chunk, encoding, callback);
    }

    get _writev() {
      return this.stream._writev;
    }
    set _writev(value) {
      this.stream._writev = value;
    }
    get _construct() {
      return this.stream._construct;
    }
    set _construct(value) {
      this.stream._construct = value;
    }
    _destroy(
      error: Error | null,
      callback: (error?: Error | null) => void
    ): void {
      return this.stream._destroy(error, callback);
    }
    _final(callback: (error?: Error | null) => void): void {
      return this.stream._final(callback);
    }
    write(chunk: any, callback?: (error: Error | null) => void): boolean;
    write(
      chunk: any,
      encoding: BufferEncoding,
      callback?: (error: Error | null) => void
    ): boolean;
    write(chunk: any, encoding?: any, callback?: any): boolean {
      return this.stream.write(chunk, encoding, callback);
    }
    setDefaultEncoding(encoding: BufferEncoding): this {
      this.stream.setDefaultEncoding(encoding);
      return this;
    }
    end(cb?: () => void): this;
    end(chunk: any, cb?: () => void): this;
    end(chunk: any, encoding: BufferEncoding, cb?: () => void): this;
    end(chunk?: any, encoding?: any, cb?: any): this {
      this.stream.end(chunk, encoding, cb);
      return this;
    }
    cork(): void {
      return this.stream.cork();
    }
    uncork(): void {
      return this.stream.uncork();
    }
    destroy(error?: Error): this {
      this.stream.destroy(error);
      return this;
    }

    addListener<T extends keyof WritableEvent>(
      event: T,
      listener: WritableEvent[T]
    ): this {
      this.stream.addListener(event, listener);
      return this;
    }
    emit<T extends keyof WritableEvent>(
      event: T,
      ...args: Parameters<WritableEvent[T]>
    ): boolean {
      return this.stream.emit(event, ...args);
    }
    on<T extends keyof WritableEvent>(
      event: T,
      listener: WritableEvent[T]
    ): this {
      this.stream.on(event, listener);
      return this;
    }
    once<T extends keyof WritableEvent>(
      event: T,
      listener: WritableEvent[T]
    ): this {
      this.stream.once(event, listener);
      return this;
    }
    prependListener<T extends keyof WritableEvent>(
      event: T,
      listener: WritableEvent[T]
    ): this {
      this.stream.prependListener(event, listener);
      return this;
    }
    prependOnceListener<T extends keyof WritableEvent>(
      event: T,
      listener: WritableEvent[T]
    ): this {
      this.stream.prependOnceListener(event, listener);
      return this;
    }

    removeListener<T extends keyof WritableEvent>(
      event: T,
      listener: WritableEvent[T]
    ): this {
      this.stream.removeListener(event, listener);
      return this;
    }
    pipe<T extends NodeJS.WritableStream>(
      destination: T,
      options?: { end?: boolean | undefined }
    ): T {
      return this.stream.pipe(destination, options);
    }

    off<T extends keyof WritableEvent>(
      event: T,
      listener: WritableEvent[T]
    ): this {
      this.stream.off(event, listener);
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
      return this.listeners(eventName);
    }
    rawListeners(eventName: string | symbol): Function[] {
      return this.rawListeners(eventName);
    }
    listenerCount(eventName: string | symbol, listener?: Function): number {
      return this.listenerCount(eventName, listener);
    }
    eventNames(): (string | symbol)[] {
      return this.eventNames();
    }
  };

export const BinaryWriteStreamMixins = <
  T extends Constructor<IBinaryHelper<Writable>>
>(
  Base: T
) => IBinaryWriteStreamMixins(IBinaryWritableMixins(Base));

export class BinaryWriteStream extends BinaryWriteStreamMixins(
  IBinaryHelper<Writable>
) {
  static from(...args: ConstructorParameters<typeof BinaryWriteStream>) {
    return new this(...args);
  }
}
