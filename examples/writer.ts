// Copyright (c) 2023 System233
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Writable } from "stream";
import { BinaryWriteStream } from "../src";

const wstream=new Writable();
wstream._write=chunk=>console.log('write',chunk)
const stream=BinaryWriteStream.from(wstream);
stream.writeInt32(0x12345678)
