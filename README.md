<!--
 Copyright (c) 2023 System233
 
 This software is released under the MIT License.
 https://opensource.org/licenses/MIT
-->

# Binary Streams
A `BufferLike` Binary Stream Wrapper for Node `Readable`/`Writable`/`Duplex` Stream.

## Examples
For `Readable` stream
```ts
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

// OUTPUT:
// readInt32LE 0x12345678
// readInt8 -1
// readUint8 255
```

For `Writable` stream
```ts
    const wstream=new Writable();
    wstream._write=chunk=>console.log('write',chunk)
    const stream=BinaryWriteStream.from(wstream);
    stream.writeInt32(0x12345678)

// OPTPUT:
// write <Buffer 78 56 34 12>
```

For `Duplex` stream
```ts
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
```

## License

[MIT License](LICENSE) Copyright (c) 2023 System233

