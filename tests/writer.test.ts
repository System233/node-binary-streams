// Copyright (c) 2023 System233
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { after, describe, it } from "node:test";
import os from "node:os";
import assert from "node:assert";
import fs from "node:fs";
import {
  AllNumberType,
  CASES,
  NumberType,
  CASES_TEXT,
  CloseStream,
} from "./utils";
import path from "node:path";
import { BinaryWriteStream } from "../src";
import { NullOfEncoding } from "../src/constants";
const tmpdir = os.tmpdir();
const temp = fs.mkdtempSync(path.join(tmpdir, "binary-streams"));
const createWriteStream = (file: string) =>
  fs.createWriteStream(path.join(temp, file));
const readFile = (file: string) => fs.readFileSync(path.join(temp, file));
describe("BinaryWriter", async () => {
  const path = "test.bin";
  after(() => {
    fs.rmSync(temp, { recursive: true });
  });
  it("init/end", async () => {
    const stream = createWriteStream(path);
    const writer = new BinaryWriteStream(stream);
    assert.ok(writer.writable);
    stream.close();
    assert.ok(!writer.writable);
  });

  const TestFile = (name: string, buffer: Buffer) => {
    const result = Buffer.compare(readFile(name), buffer);
    if (result) {
      console.error("err", name, readFile(name), buffer);
    }
    return result;
  };
  const MakeTest = (type: AllNumberType, mode: "LE" | "BE") => {
    const littleEndian = mode == "LE";
    if (type == "Int8" || type == "Uint8") {
      const name = `write${type}` as const;
      it(name, async () => {
        const path = type;
        const wstream = createWriteStream(path);
        const [value, le, be] = CASES[type];
        BinaryWriteStream.from(wstream)[name](value);

        await CloseStream(wstream);
        assert.ok(!TestFile(path, littleEndian ? le : be));
      });
      return;
    }
    if (type === "BigInt64" || type === "BigUint64") {
      const name = `write${type}${mode}` as const;
      it(name, async () => {
        const path = type + mode;
        const wstream = createWriteStream(path);

        const [value, le, be] = CASES[type];
        BinaryWriteStream.from(wstream)[name](value);

        await CloseStream(wstream);
        wstream.once("close", () => {
          assert.ok(!TestFile(path, littleEndian ? le : be));
        });
      });
      return;
    }
    const name = `write${type}${mode}` as const;
    it(name, async () => {
      const path = type + mode;
      const wstream = createWriteStream(path);
      const [value, le, be] = CASES[type];
      BinaryWriteStream.from(wstream)[name](value);

      await CloseStream(wstream);
      assert.ok(!TestFile(path, littleEndian ? le : be));
    });
  };
  const MakeTestInt = (byteLength: 1 | 2 | 4, mode: "LE" | "BE") => {
    const name = "writeInt." + byteLength + "." + mode;
    const littleEndian = mode == "LE";
    it(name, async () => {
      const wstream = createWriteStream(name);
      const key = ("Int" + byteLength * 8) as NumberType;
      const [value, le, be] = CASES[key];
      BinaryWriteStream.from(wstream)
        [`writeInt`](value, byteLength, littleEndian)
        ;

      await CloseStream(wstream);
      assert.ok(!TestFile(name, littleEndian ? le : be));
    });
  };
  const MakeTestText = (encoding: BufferEncoding) => {
    const name = "writeString." + encoding;
    it(name, async () => {
      const wstream = createWriteStream(name);
      const [value, data] = CASES_TEXT[encoding];
      BinaryWriteStream.from(wstream)["writeString"](value, encoding);
      await CloseStream(wstream);
      assert.ok(!TestFile(name, data));
    });
    it("writeBytes", async () => {
      const wstream = createWriteStream(name);
      const [value, data] = CASES_TEXT[encoding];
      BinaryWriteStream.from(wstream)["writeBytes"](data);

      await CloseStream(wstream);
      assert.ok(!TestFile(name, data));
    });
    {
      const name = "writeCString." + encoding;
      it(name, async () => {
        const wstream = createWriteStream(name);
        const [value, data] = CASES_TEXT[encoding];
        BinaryWriteStream.from(wstream)["writeCString"](value, encoding);

        await CloseStream(wstream);
        assert.ok(
          !TestFile(name, Buffer.concat([data, NullOfEncoding[encoding]]))
        );
      });
    }
    {
      const name = "writeBase64";
      it(name, async () => {
        const wstream = createWriteStream(name);
        const [value, data] = CASES_TEXT[encoding];
        const buffer = Buffer.from(data.toString("base64"));
        BinaryWriteStream.from(wstream)[name](data);
        await CloseStream(wstream);
        assert.ok(!TestFile(name, buffer));
      });
    }
    {
      const name = "writeHex";
      it(name, async () => {
        const wstream = createWriteStream(name);
        const [value, data] = CASES_TEXT[encoding];
        const buffer = Buffer.from(data.toString("hex"));
        BinaryWriteStream.from(wstream)[name](data);
        await CloseStream(wstream);
        assert.ok(!TestFile(name, buffer));
      });
    }
    {
      const name = "writeUTF8";
      it(name, async () => {
        const wstream = createWriteStream(name);
        const [value, data] = CASES_TEXT[encoding];
        const buffer = Buffer.from(value, "utf8");
        BinaryWriteStream.from(wstream)[name](value);
        await CloseStream(wstream);
        assert.ok(!TestFile(name, buffer));
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

// describe("BinaryReader", () => {
//   it("connect", () => {
//     const stream = fs.createReadStream(path);
//     const reader = new BinaryReader();
//     assert.ok(!reader.readable);
//     assert.ok(!reader.writable);
//     assert.ok(!reader.connected);
//     reader.connect(stream);
//     assert.ok(reader.readable);
//     assert.ok(!reader.writable);
//     assert.ok(reader.connected);
//     reader.disconnect();
//     assert.ok(!reader.readable);
//     assert.ok(!reader.writable);
//     assert.ok(!reader.connected);
//     reader.connect(stream);
//     assert.ok(reader.readable);
//     assert.ok(!reader.writable);
//     assert.ok(reader.connected);
//     stream.close(() => {
//       assert.ok(!reader.readable);
//       assert.ok(!reader.writable);
//       assert.ok(!reader.connected);
//     });
//   });
// });
