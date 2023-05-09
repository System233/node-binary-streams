// Copyright (c) 2023 System233
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Readable } from "stream";
import { BinaryReader } from "../src";

(async()=>{

    const buffer = Buffer.from([
        0x78, 0x56, 0x34, 0x12, 
        0xff, 0xff
    ]);
    const stream=new Readable({
        read(){
            stream.push(buffer)
            stream.push(null)
        }
    });
    const reader = BinaryReader.from(stream);
    console.log('readInt32LE','0x'+(await reader.readInt32LE()).toString(16));
    console.log('readInt8',await reader.readInt8());
    console.log('readUint8',await reader.readUint8());
})()
