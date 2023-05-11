# Binary Streams

[![npm][npm-image]][npm-url]

[npm-image]: https://img.shields.io/npm/v/binary-streams.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/binary-streams

A `BufferLike` Binary Stream Wrapper for Node `Readable`/`Writable`/`Duplex` Stream.

## Installation

```sh
npm install binary-streams
```

## Usages
For `Readable` stream
```ts
    import { BinaryReadStream } from "binary-streams";
    import { Readable } from "node:stream";

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
    import { BinaryWriteStream } from "binary-streams";
    import { Writable } from "node:stream";

    const wstream=new Writable();
    wstream._write=chunk=>console.log('write',chunk);

    const stream=BinaryWriteStream.from(wstream);
    stream.writeInt32(0x12345678)

// OPTPUT:
// write <Buffer 78 56 34 12>
```

For `Duplex` stream
```ts
    import { BinaryDuplexStream } from "binary-streams"
    import net from 'node:net'

    const server = net.createServer((socket) =>socket.pipe(socket));
    server.listen()
    const {address:host,port}=server.address();
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

