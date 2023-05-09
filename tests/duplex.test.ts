// Copyright (c) 2023 System233
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { after, before, describe, it } from "node:test";
import { Server, connect } from "node:net";
import { AddressInfo, createServer } from "node:net";
import { BinaryDuplex } from "../src";
import assert from "node:assert";
import { CASES, CASES_TEXT } from "./utils";
import { NullOfEncoding, SizeOfEncoding } from "../src/constants";

const TEST_TEXT = "测试文本";
const TEST_DATA = Buffer.from(TEST_TEXT);
describe("BinaryDuplex", async () => {
  let server: Server;
  let target: { host: string; port: number };
  before(async () => {
    server = createServer((socket) => {
      socket.pipe(socket);
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "localhost", 0, resolve)
    );
    const { address: host, port } = server.address() as AddressInfo;
    target = { host, port };
    console.log("target", target);
  });
  after(async () => {
    await new Promise<Error | undefined>((resolve) => server.close(resolve));
  });
  it("connect/disconnect", async () => {
    const socket = connect(target);
    const stream = new BinaryDuplex();
    assert.equal(stream.readable, false);
    assert.equal(stream.writable, false);
    assert.equal(stream.connected, false);
    stream.connect(socket);
    assert.equal(stream.readable, true);
    assert.equal(stream.writable, true);
    assert.equal(stream.connected, true);
    stream.disconnect();
    assert.equal(stream.readable, false);
    assert.equal(stream.writable, false);
    assert.equal(stream.connected, false);
    stream.connect(socket);
    assert.equal(stream.readable, true);
    assert.equal(stream.writable, true);
    assert.equal(stream.connected, true);

    const breakRead=new Promise<void>((resolve,reject)=>{
      stream.readInt8().then(reject).catch(resolve);
      setTimeout(()=>reject(new Error('Break Read timeout')),1000);
    });

    await new Promise<void>((resolve, reject) => {
      socket.end(() =>
        setTimeout(() => reject(new Error("disconnect timeout")), 1000)
      );
      stream.on("disconnect", resolve);
    });
    await breakRead;
    assert.equal(stream.readable, false);
    assert.equal(stream.writable, false);
    assert.equal(stream.connected, false);
  });
  type OneArg<T> = T extends (value: infer R) => any ? R : never;
  type IsOneArg<T, X, Y = never> = T extends (value: any) => any ? X : Y;
  type FindTest = {
    [K in keyof BinaryDuplex]: K extends `write${infer R}LE`
      ? IsOneArg<BinaryDuplex[K], R>
      : never;
  }[keyof BinaryDuplex];
  type FindTestType<T extends FindTest> = OneArg<BinaryDuplex[`write${T}LE`]>;
  const MakeTestInt8 = (type: "Int8" | "Uint8", value: number) => {
    it(`read${type}/write${type}`, async () => {
      const stream = BinaryDuplex.from(connect(target));
      (
        stream[`write${type}`] as (
          this: BinaryDuplex,
          value: number
        ) => BinaryDuplex
      )(value).flush();
      const result = await stream[`read${type}`]();
      assert.equal(result, value);
      stream.destroy();
    });
  };
  const MakeTestNum = <T extends FindTest>(type: T, value: FindTestType<T>) => {
    it(`read${type}LE/write${type}LE`, async () => {
      const stream = BinaryDuplex.from(connect(target));
      (
        stream[`write${type}LE`] as (
          this: BinaryDuplex,
          value: FindTestType<T>
        ) => BinaryDuplex
      )(value).flush();
      const result = await stream[`read${type}LE`]();
      assert.equal(result, value);
      stream.destroy();
    });
    it(`read${type}BE/write${type}BE`, async () => {
      const stream = BinaryDuplex.from(connect(target));
      (
        stream[`write${type}BE`] as (
          this: BinaryDuplex,
          value: FindTestType<T>
        ) => BinaryDuplex
      )(value).flush();
      const result = await stream[`read${type}BE`]();
      assert.equal(result, value);
      stream.destroy();
    });
  };
  const MakeTestText = (text: string, encoding: BufferEncoding) => {
    it(`readString/writeString.${encoding}`, async () => {
      const [value, buffer] = CASES_TEXT[encoding];
      const stream = BinaryDuplex.from(connect(target));
      stream.writeString(text, encoding).flush();
      const result = await stream.readString(buffer.byteLength, encoding);
      assert.equal(result, value);
      stream.destroy();
    });
    it(`readCString/writeCString.${encoding}`, async () => {
      const [value, buffer] = CASES_TEXT[encoding];
      const stream = BinaryDuplex.from(connect(target));
      stream.writeCString(text, encoding).flush();
      const result = await stream.readCString(encoding);
      assert.equal(result, value);
      stream.destroy();
    });

    it(`readString/writeBytes.${encoding}`, async () => {
      const [value, buffer] = CASES_TEXT[encoding];
      const stream = BinaryDuplex.from(connect(target));
      stream.writeBytes(buffer).flush();
      const result = await stream.readString(buffer.byteLength, encoding);
      assert.equal(result, value);
      stream.destroy();
    });
    it(`readCString/writeBytes.${encoding}`, async () => {
      const [value, buffer] = CASES_TEXT[encoding];
      const stream = BinaryDuplex.from(connect(target));
      stream.writeBytes(buffer).writeBytes(NullOfEncoding[encoding]).flush();
      const result = await stream.readCString(encoding);
      assert.equal(result, value);
      stream.destroy();
    });

    it(`readBytes/writeString.${encoding}`, async () => {
      const [value, buffer] = CASES_TEXT[encoding];
      const stream = BinaryDuplex.from(connect(target));
      stream.writeString(value, encoding).flush();
      const result = await stream.readBytes(buffer.byteLength);
      assert.equal(Buffer.compare(result, buffer), 0);
      stream.destroy();
    });

    it(`readBytes/writeCString.${encoding}`, async () => {
      const [value, buffer] = CASES_TEXT[encoding];
      const stream = BinaryDuplex.from(connect(target));
      stream.writeCString(value, encoding).flush();
      const result = await stream.readBytes(
        buffer.byteLength + SizeOfEncoding[encoding]
      );
      assert.equal(
        Buffer.compare(
          result,
          Buffer.concat([buffer, NullOfEncoding[encoding]])
        ),
        0
      );
      stream.destroy();
    });

    it(`readBytes/writeBytes.${encoding}`, async () => {
      const [value, buffer] = CASES_TEXT[encoding];
      const stream = BinaryDuplex.from(connect(target));
      stream.writeBytes(buffer).flush();
      const result = await stream.readBytes(buffer.byteLength);
      assert.equal(Buffer.compare(result, buffer), 0);
      stream.destroy();
    });
    it(`read/write.${encoding}`, async () => {
      const [value, buffer] = CASES_TEXT[encoding];
      const stream = BinaryDuplex.from(connect(target));
      stream.write(buffer).flush();
      const result = await stream.read(buffer.byteLength);
      assert.equal(Buffer.compare(result, buffer), 0);
      stream.destroy();
    });
    it(`readBase64/writeBase64.${encoding}`, async () => {
      const [value, buffer] = CASES_TEXT[encoding];
      const stream = BinaryDuplex.from(connect(target));
      const data = Buffer.from(buffer.toString("base64"));
      stream.writeBase64(buffer).flush();
      const result = await stream.readBase64(data.byteLength);
      assert.equal(Buffer.compare(result, buffer), 0);
      stream.destroy();
    });
    it(`readHex/writeHex.${encoding}`, async () => {
      const [value, buffer] = CASES_TEXT[encoding];
      const stream = BinaryDuplex.from(connect(target));
      stream.writeHex(buffer).flush();
      const result = await stream.readHex(buffer.byteLength * 2);
      assert.equal(Buffer.compare(result, buffer), 0);
      stream.destroy();
    });
  };

  for (const [type, [value]] of Object.entries(CASES)) {
    const t = type as keyof typeof CASES;
    if (t == "Int8" || t == "Uint8") {
      MakeTestInt8(type as any, value as number);
    } else {
      MakeTestNum(t, value);
    }
  }
  for (const [encoding, [text, buffer]] of Object.entries(CASES_TEXT)) {
    MakeTestText(text, encoding as BufferEncoding);
  }
});