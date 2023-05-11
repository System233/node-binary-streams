// Copyright (c) 2023 System233
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { after, describe, it } from "node:test";
import os from "node:os";
import { BinaryReadStream } from "../src/index.js";
import assert from "node:assert";
import fs from "node:fs";
import {
  AllNumberType,
  CASES,
  NumberType,
  CASES_TEXT,
  CloseStream,
} from "./utils.js";

import path from "node:path";
import { NullOfEncoding } from "../src/constants.js";
import { Readable } from "node:stream";

const tmpdir = os.tmpdir();
const temp = fs.mkdtempSync(path.join(tmpdir, "binary-streams"));
const createReadStream = (file: string, data: Buffer) => {
  const target = path.join(temp, file);
  fs.writeFileSync(target, data);
  return fs.createReadStream(path.join(temp, file));
};
describe("BinaryReader", async () => {
  after(() => {
    fs.rmSync(temp, { recursive: true });
  });
  it("init/end", async () => {
    const stream = new Readable({read(){}});
    const reader = new BinaryReadStream(stream);
    assert.ok(reader.readable);
    const breakRead=new Promise<void>((resolve,reject)=>{
      reader.readInt8().then(reject).catch(resolve);
      setTimeout(()=>reject(new Error('Break Read timeout')),1000);
    });
    stream.destroy();
    await breakRead;
    assert.ok(!reader.readable);
  });

  const MakeTest = (type: AllNumberType, mode: "LE" | "BE") => {
    const littleEndian = mode == "LE";
    if (type == "Int8" || type == "Uint8") {
      const name = `read${type}` as const;
      it(name, async () => {
        const path = type;
        const [value, le, be] = CASES[type];
        const rstream = createReadStream(path, littleEndian ? le : be);
        const result = await BinaryReadStream.from(rstream)[name]();
        await CloseStream(rstream);
        assert.equal(result, value);
      });
      return;
    }
    if (type === "BigInt64" || type === "BigUint64") {
      const name = `read${type}${mode}` as const;
      it(name, async () => {
        const path = type + mode;
        const [value, le, be] = CASES[type];
        const rstream = createReadStream(path, littleEndian ? le : be);
        const result = await BinaryReadStream.from(rstream)[name]();
        await CloseStream(rstream);
        assert.equal(result, value);
      });
      return;
    }
    const name = `read${type}${mode}` as const;
    it(name, async () => {
      const path = type + mode;
      const [value, le, be] = CASES[type];
      const rstream = createReadStream(path, littleEndian ? le : be);
      const result = await BinaryReadStream.from(rstream)[name]();
      await CloseStream(rstream);
      assert.equal(result, value);
    });
  };
  const MakeTestInt = (byteLength: 1 | 2 | 4, mode: "LE" | "BE") => {
    const name = "readInt." + byteLength + "." + mode;
    const littleEndian = mode == "LE";
    it(name, async () => {
      const key = ("Int" + byteLength * 8) as NumberType;
      const [value, le, be] = CASES[key];
      const rstream = createReadStream(name, littleEndian ? le : be);
      const result = await BinaryReadStream.from(rstream)[`readInt`](
        byteLength,
        littleEndian
      );
      await CloseStream(rstream);
      assert.equal(result, value);
    });
  };
  const MakeTestText = (encoding: BufferEncoding) => {
    {
      const name = "readString." + encoding;
      it(name, async () => {
        const [value, data] = CASES_TEXT[encoding];
        const rstream = createReadStream(name, data);
        const result = await BinaryReadStream.from(rstream)["readString"](
          data.byteLength,
          encoding
        );
        await CloseStream(rstream);
        assert.equal(result, value);
      });
    }
    {
      const name = "readBytes";
      it(name, async () => {
        const [value, data] = CASES_TEXT[encoding];
        const rstream = createReadStream(name, data);
        const result = await BinaryReadStream.from(rstream)[name](data.byteLength);
        await CloseStream(rstream);
        assert.equal(Buffer.compare(result, data), 0);
      });
    }
    {
      const name = "readCString." + encoding;
      it(name, async () => {
        const [value, data] = CASES_TEXT[encoding];
        const rstream = createReadStream(
          name,
          Buffer.concat([data, NullOfEncoding[encoding]])
        );
        const result = await BinaryReadStream.from(rstream)["readCString"](
          encoding
        );
        await CloseStream(rstream);
        assert.equal(result, value);
      });
    }
    {
      const name = "readBase64";
      it(name, async () => {
        const [value, data] = CASES_TEXT[encoding];
        const buffer = Buffer.from(data.toString("base64"));
        const rstream = createReadStream(name, buffer);
        const result = await BinaryReadStream.from(rstream)[name](
          buffer.byteLength
        );
        await CloseStream(rstream);
        assert.equal(Buffer.compare(result, data), 0);
      });
    }
    {
      const name = "readHex";
      it(name, async () => {
        const [value, data] = CASES_TEXT[encoding];
        const buffer = Buffer.from(data.toString("hex"));
        const rstream = createReadStream(name, buffer);
        const result = await BinaryReadStream.from(rstream)[name](
          buffer.byteLength
        );
        await CloseStream(rstream);
        assert.equal(Buffer.compare(result, data), 0);
      });
    }
    {
      const name = "readUTF8";
      it(name, async () => {
        const [value, data] = CASES_TEXT[encoding];
        const buffer = Buffer.from(value, "utf-8");
        const rstream = createReadStream(name, buffer);
        const result = await BinaryReadStream.from(rstream)[name](
          buffer.byteLength
        );
        await CloseStream(rstream);
        assert.equal(result, value);
      });
    }
  };
  Object.keys(CASES).forEach((x) => {
    MakeTest(x as AllNumberType, "LE");
    MakeTest(x as AllNumberType, "BE");
  });
  [1, 2, 4].map((x) => {
    MakeTestInt(x as 1 | 2 | 4, "LE");
    MakeTestInt(x as 1 | 2 | 4, "BE");
  });
  Object.keys(CASES_TEXT).forEach((x) => {
    MakeTestText(x as BufferEncoding);
  });
});
