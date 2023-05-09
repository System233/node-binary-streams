// Copyright (c) 2023 System233
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import EventEmitter from "node:events";
import { Readable, Writable, Duplex } from "node:stream";
export type Constructor<T extends Readable | Writable | Duplex> = new (
  ...args: any[]
) => IBinaryHelper<T>;
export class IBinaryHelper<
  T extends Readable | Writable | Duplex
> extends EventEmitter {
  protected stream: T = null as any;
  private _connected = false;
  private _readable = false;
  private _writable = false;
  private _onclose = () => this._disconnect();
  get connected() {
    return this._connected;
  }
  protected set connected(value: boolean) {
    this._connected = value;
  }
  get readable() {
    return this._readable;
  }
  protected set readable(value: boolean) {
    this._readable = value;
  }
  get writable() {
    return this._writable;
  }
  protected set writable(value: boolean) {
    this._writable = value;
  }
  protected _connect(stream: T) {
    stream.once("close", this._onclose);
    this.stream = stream;
    this.connected = true;
    this.emit("connect", this.stream);
  }

  protected _disconnect() {
    this.emit("disconnect", this.stream);
    this.connected = false;
    this.stream.off("close", this._onclose);
    this.stream = null as any;
  }

  connect(stream: T) {
    if (this.connected) {
      throw new Error("stream already connected");
    }
    if (stream.closed) {
      throw new Error("stream closed");
    }
    this._connect(stream);
  }
  disconnect() {
    if (!this.connected) {
      throw new Error("stream not connect");
    }
    this._disconnect();
  }
  destroy(error?: Error) {
    this.stream.destroy(error);
  }
  emit(eventName: "connect", stream: T): boolean;
  emit(eventName: "disconnect", stream: T): boolean;
  emit(eventName: string | symbol, ...args: any): boolean {
    return super.emit(eventName, ...args);
  }
  on(eventName: "connect", listener: (stream: T) => void): this;
  on(eventName: "disconnect", listener: () => void): this;
  on(eventName: string | symbol, listener: (...args: any[]) => void) {
    return super.on(eventName, listener);
  }
  once(eventName: "connect", listener: (stream: T) => void): this;
  once(eventName: "disconnect", listener: () => void): this;
  once(eventName: string | symbol, listener: (...args: any[]) => void) {
    return super.once(eventName, listener);
  }

  off(eventName: "connect", listener: (stream: T) => void): this;
  off(eventName: "disconnect", listener: () => void): this;
  off(eventName: string | symbol, listener: (...args: any[]) => void) {
    return super.off(eventName, listener);
  }
}
