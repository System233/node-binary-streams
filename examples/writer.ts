// Copyright (c) 2023 System233
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Writable } from "stream";
import { BinaryWriter } from "../src";

const stream=new Writable();
stream._write=chunk=>console.log('write',chunk)
const reader=BinaryWriter.from(stream);
reader.writeInt32(0x12345678).flush()

