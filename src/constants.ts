// Copyright (c) 2023 System233
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export enum SizeOfType {
  Int8 = 1,
  Int16 = 2,
  Int32 = 4,
  BigInt64 = 8,
  Uint8 = 1,
  Uint16 = 2,
  Uint32 = 4,
  BigUint64 = 8,
  Float = 4,
  Double = 8,
}
export enum SizeOfEncoding {
  ascii = 1,
  utf8 = 1,
  "utf-8" = 1,
  utf16le = 2,
  ucs2 = 2,
  "ucs-2" = 2,
  base64 = 1,
  base64url = 1,
  latin1 = 1,
  binary = 1,
  hex = 1,
}
export const NullOfEncoding = {
  ascii: Buffer.alloc(SizeOfEncoding.ascii),
  utf8: Buffer.alloc(SizeOfEncoding.utf8),
  "utf-8": Buffer.alloc(SizeOfEncoding["utf-8"]),
  utf16le: Buffer.alloc(SizeOfEncoding.utf16le),
  ucs2: Buffer.alloc(SizeOfEncoding.ucs2),
  "ucs-2": Buffer.alloc(SizeOfEncoding["ucs-2"]),
  base64: Buffer.alloc(SizeOfEncoding.base64),
  base64url: Buffer.alloc(SizeOfEncoding.base64url),
  latin1: Buffer.alloc(SizeOfEncoding.latin1),
  binary: Buffer.alloc(SizeOfEncoding.binary),
  hex: Buffer.alloc(SizeOfEncoding.hex),
} as const;
