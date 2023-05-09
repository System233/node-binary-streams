// Copyright (c) 2023 System233
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { ReadStream, WriteStream } from "node:fs";
import { SizeOfEncoding, SizeOfType } from "../src/constants";

export type AllNumberType = keyof typeof SizeOfType;
export type Int8Type = "Int8" | "Uint8";
export type BigIntType = "BigInt64" | "BigUint64";
export type NumberType = Exclude<AllNumberType, Int8Type | BigIntType>;

export const MakeBufferInt8 = <T extends Int8Type>(x: number, type: T) => {
  const u8 = Buffer.alloc(SizeOfType[type]);
  if (type === "Int8") {
    u8.writeInt8(x);
  } else {
    u8.writeUint8(x);
  }
  return [x, u8, u8] as const;
};
export const MakeBufferNum = <T extends NumberType>(x: number, type: T) => {
  const le = Buffer.alloc(SizeOfType[type]);
  const be = Buffer.alloc(SizeOfType[type]);

  le[`write${type}LE`].call(le, x);
  be[`write${type}BE`].call(be, x);
  return [x, le, be] as const;
};
export const MakeBufferBigInt = <T extends BigIntType>(x: bigint, type: T) => {
  const le = Buffer.alloc(SizeOfType[type]);
  const be = Buffer.alloc(SizeOfType[type]);
  le[`write${type}LE`].call(le, x);
  be[`write${type}BE`].call(be, x);
  return [x, le, be] as const;
};

export function MakeCase(type: Int8Type): readonly [number, Buffer, Buffer];
export function MakeCase(type: NumberType): readonly [number, Buffer, Buffer];
export function MakeCase(type: BigIntType): readonly [bigint, Buffer, Buffer];
export function MakeCase(
  type: AllNumberType
): readonly [bigint | number, Buffer, Buffer];
export function MakeCase(
  type: AllNumberType
): readonly [bigint | number, Buffer, Buffer] {
  switch (type) {
    case "Int8":
      return MakeBufferInt8(0x12, type);
    case "Uint8":
      return MakeBufferInt8(0x90, type);
    case "Int16":
      return MakeBufferNum(0x1234, type);
    case "Uint16":
      return MakeBufferNum(0xfeac, type);
    case "Int32":
      return MakeBufferNum(0x12345678, type);
    case "Uint32":
      return MakeBufferNum(0x81234567, type);
    case "BigInt64":
      return MakeBufferBigInt(0x123456789abcefn, type);
    case "BigUint64":
      return MakeBufferBigInt(0xfecba987654321n, type);
    case "Float":
      return MakeBufferNum(123456.125, type);
    case "Double":
      return MakeBufferNum(123456789123456.125, type);
  }
  throw new Error("bad type:" + type);
}
const TEST_TEXT = "测试文本ABC";

export const MakeCaseText = (encoding: BufferEncoding, text?: string) =>
  [text || encoding, Buffer.from(text || encoding, encoding)] as const;
export const MakeCaseText2 = (encoding: BufferEncoding, text?: string) =>
  [
    text || encoding,
    Buffer.from(Buffer.from(text || encoding).toString(encoding)),
  ] as const;
export const CASES = {
  Int8: MakeCase("Int8"),
  Uint8: MakeCase("Uint8"),
  Int16: MakeCase("Int16"),
  Int32: MakeCase("Int32"),
  BigInt64: MakeCase("BigInt64"),
  Uint16: MakeCase("Uint16"),
  Uint32: MakeCase("Uint32"),
  BigUint64: MakeCase("BigUint64"),
  Float: MakeCase("Float"),
  Double: MakeCase("Double"),
} as const;
export const CASES_TEXT: Record<
  keyof typeof SizeOfEncoding,
  readonly [string, Buffer]
> = {
  ascii: MakeCaseText("ascii"),
  ucs2: MakeCaseText("ucs2", TEST_TEXT),
  utf16le: MakeCaseText("utf16le", TEST_TEXT),
  utf8: MakeCaseText("utf8", TEST_TEXT),
  "ucs-2": MakeCaseText("ucs-2", TEST_TEXT),
  "utf-8": MakeCaseText("utf-8", TEST_TEXT),
  base64: MakeCaseText2("base64", TEST_TEXT),
  base64url: MakeCaseText2("base64url", TEST_TEXT),
  binary: MakeCaseText("binary", "binary"),
  latin1: MakeCaseText("latin1", "latin1"),
  hex: MakeCaseText2("hex", TEST_TEXT),
} as const;
console.log(CASES_TEXT);
export const CloseStream = (stream: WriteStream | ReadStream) =>
  new Promise<void>((resolve, reject) => {
    stream.close();
    stream.once("close", () => {
      resolve();
    });
  });
