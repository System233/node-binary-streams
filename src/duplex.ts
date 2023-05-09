// Copyright (c) 2023 System233
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Duplex } from "node:stream";
import { IBinaryHelper } from "./hepler";
import { BinaryWriterMixins } from "./writer";
import { BinaryReaderMixins } from "./reader";

export class BinaryDuplex extends BinaryWriterMixins(
  BinaryReaderMixins(IBinaryHelper<Duplex>)
) {
  static from(
    stream: Duplex,
    ...args: ConstructorParameters<typeof BinaryDuplex>
  ) {
    const duplex = new this(...args);
    duplex.connect(stream);
    return duplex;
  }
}
