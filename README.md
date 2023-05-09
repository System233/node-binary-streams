<!--
 Copyright (c) 2023 System233
 
 This software is released under the MIT License.
 https://opensource.org/licenses/MIT
-->

# Binary Streams
A `BufferLike` Wrapper for Node Stream.

## Examples
For Readable
```ts
    const stream=Readable.from()
    const reader=BinaryReader.from(fs.createReadStream('<bin file>'));

```

