// Copyright (c) 2023 System233
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Duplex } from "node:stream";
import { IBinaryHelper } from "./hepler";
import { BinaryWriteStreamMixins, IBinaryWritableMixins } from "./writer";
import { BinaryReadStreamMixins, IBinaryReadableMixins } from "./reader";

export class BinaryDuplexStream extends BinaryWriteStreamMixins(
  IBinaryWritableMixins(
    BinaryReadStreamMixins(IBinaryReadableMixins(IBinaryHelper<Duplex>))
  )
) {
  static from(...args: ConstructorParameters<typeof BinaryDuplexStream>) {
    return new this(...args);
  }
}
