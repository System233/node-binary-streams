// Copyright (c) 2023 System233
// 
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT
import net, { AddressInfo } from 'node:net'
import { BinaryDuplexStream } from '../src';
(async()=>{
    const server = net.createServer((socket) =>socket.pipe(socket));
    server.listen()
    const {address:host,port}=server.address() as AddressInfo;
    const stream=BinaryDuplexStream.from(net.connect({host,port}));

    stream.writeInt32LE(0x12345678);
    const result=await stream.readInt32LE();

    console.log('result','0x'+result.toString(16));
    stream.end();
    server.close();

    // OUTPUT:
    // result 0x12345678

})();