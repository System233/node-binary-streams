// Copyright (c) 2023 System233
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { after, before, describe, it } from "node:test";
import { Server, connect } from "node:net";
import { AddressInfo, createServer } from "node:net";
import { BinaryDuplexStream } from "../src/index.js";
import assert from "node:assert";
import { CASES, CASES_TEXT } from "./utils.js";
import { NullOfEncoding, SizeOfEncoding } from "../src/constants.js";

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
  it("init/end", async () => {
    const socket = connect(target);
    const stream = new BinaryDuplexStream(socket);
    assert.equal(stream.readable, true);
    assert.equal(stream.writable, true);

    const breakRead = new Promise<void>((resolve, reject) => {
      stream.readInt8().then(reject).catch(resolve);
      setTimeout(() => reject(new Error("Break Read timeout")), 1000);
    });

    await new Promise<void>((resolve, reject) => {
      setTimeout(() => reject(new Error("disconnect timeout")), 1000);
      socket.end(resolve);
    });
    await breakRead;
    assert.equal(stream.readable, false);
    assert.equal(stream.writable, false);
  });
  type OneArg<T> = T extends (value: infer R) => any ? R : never;
  type IsOneArg<T, X, Y = never> = T extends (value: any) => any ? X : Y;
  type FindTest = Exclude<
    {
      [K in keyof BinaryDuplexStream]: K extends `write${infer R}LE`
        ? IsOneArg<BinaryDuplexStream[K], R>
        : never;
    }[keyof BinaryDuplexStream],
    undefined
  >;
  type FindTestType<T extends FindTest> = OneArg<
    BinaryDuplexStream[`write${T}LE`]
  >;
  const start = async (
    callback: (stream: BinaryDuplexStream) => Promise<void>
  ) => {
    const stream = BinaryDuplexStream.from(connect(target));
    try {
      await callback(stream);
    } finally {
      stream.destroy();
    }
  };
  const MakeTestInt8 = (type: "Int8" | "Uint8", value: number) => {
    it(`read${type}/write${type}`, async () =>
      start(async (stream) => {
        (
          stream[`write${type}`] as (
            this: BinaryDuplexStream,
            value: number
          ) => BinaryDuplexStream
        )(value);
        const result = await stream[`read${type}`]();
        assert.equal(result, value);
      }));
  };
  const MakeTestNum = <T extends FindTest>(type: T, value: FindTestType<T>) => {
    it(`read${type}LE/write${type}LE`, async () =>
      start(async (stream) => {
        (
          stream[`write${type}LE`] as (
            this: BinaryDuplexStream,
            value: FindTestType<T>
          ) => BinaryDuplexStream
        )(value);
        const result = await stream[`read${type}LE`]();
        assert.equal(result, value);
      }));
    it(`read${type}BE/write${type}BE`, async () =>
      start(async (stream) => {
        (
          stream[`write${type}BE`] as (
            this: BinaryDuplexStream,
            value: FindTestType<T>
          ) => BinaryDuplexStream
        )(value);
        const result = await stream[`read${type}BE`]();
        assert.equal(result, value);
      }));
  };
  const MakeTestText = (text: string, encoding: BufferEncoding) => {
    it(`readString/writeString.${encoding}`, async () =>
      start(async (stream) => {
        const [value, buffer] = CASES_TEXT[encoding];
        stream.writeString(text, encoding);
        const result = await stream.readString(buffer.byteLength, encoding);
        assert.equal(result, value);
      }));
    it(`readCString/writeCString.${encoding}`, async () =>
      start(async (stream) => {
        const [value, buffer] = CASES_TEXT[encoding];
        stream.writeCString(text, encoding);
        const result = await stream.readCString(encoding);
        assert.equal(result, value);
      }));

    it(`readString/writeBytes.${encoding}`, async () =>
      start(async (stream) => {
        const [value, buffer] = CASES_TEXT[encoding];
        stream.writeBytes(buffer);
        const result = await stream.readString(buffer.byteLength, encoding);
        assert.equal(result, value);
      }));
    it(`readCString/writeBytes.${encoding}`, async () =>
      start(async (stream) => {
        const [value, buffer] = CASES_TEXT[encoding];
        stream.writeBytes(buffer).writeBytes(NullOfEncoding[encoding]);
        const result = await stream.readCString(encoding);
        assert.equal(result, value);
      }));

    it(`readBytes/writeString.${encoding}`, async () =>
      start(async (stream) => {
        const [value, buffer] = CASES_TEXT[encoding];
        stream.writeString(value, encoding);
        const result = await stream.readBytes(buffer.byteLength);
        assert.equal(Buffer.compare(result, buffer), 0);
      }));

    it(`readBytes/writeCString.${encoding}`, async () =>
      start(async (stream) => {
        const [value, buffer] = CASES_TEXT[encoding];
        stream.writeCString(value, encoding);
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
      }));

    it(`readBytes/writeBytes.${encoding}`, async () =>
      start(async (stream) => {
        const [value, buffer] = CASES_TEXT[encoding];
        stream.writeBytes(buffer);
        const result = await stream.readBytes(buffer.byteLength);
        assert.equal(Buffer.compare(result, buffer), 0);
      }));
    it(`read/write.${encoding}`, async () =>
      start(async (stream) => {
        const [value, buffer] = CASES_TEXT[encoding];
        stream.write(buffer);
        const result = await stream.get(buffer.byteLength);
        assert.equal(Buffer.compare(result, buffer), 0);
      }));
    it(`readBase64/writeBase64.${encoding}`, async () =>
      start(async (stream) => {
        const [value, buffer] = CASES_TEXT[encoding];
        const data = Buffer.from(buffer.toString("base64"));
        stream.writeBase64(buffer);
        const result = await stream.readBase64(data.byteLength);
        assert.equal(Buffer.compare(result, buffer), 0);
      }));
    it(`readHex/writeHex.${encoding}`, async () =>
      start(async (stream) => {
        const [value, buffer] = CASES_TEXT[encoding];
        stream.writeHex(buffer);
        const result = await stream.readHex(buffer.byteLength * 2);
        assert.equal(Buffer.compare(result, buffer), 0);
      }));
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
