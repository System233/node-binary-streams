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
        read(){}
    });
    const iter=buffer[Symbol.iterator]()
    let index=0;
    const timer=setInterval(()=>{
        console.log('[read]')
        const data=iter.next();
        stream.push(Buffer.from([data.value]))
        if(data.done){
            stream.push(null);
            clearInterval(timer)
        }
    },500)
    const reader = BinaryReader.from(stream);
    reader.readInt32LE().then(x=>console.log('co','readInt32LE','0x'+x.toString(16)))
    reader.readInt8().then(x=>console.log('co','readInt8',x))
    reader.readUint8().then(x=>console.log('co','readUint8',x))
})()
