// Copyright (c) 2023 System233
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Readable } from "stream";
import { BinaryReadStream } from "../src";

(async()=>{

    const buffer = Buffer.from([
        0x78, 0x56, 0x34, 0x12, 
        0xff, 0xff
    ]);
    const rstream=new Readable({
        read(){
            stream.push(buffer)
            stream.push(null)
        }
    });
    const stream = BinaryReadStream.from(rstream);
    console.log('readInt32LE','0x'+(await stream.readInt32LE()).toString(16));
    console.log('readInt8',await stream.readInt8());
    console.log('readUint8',await stream.readUint8());
})()
