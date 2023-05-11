// Copyright (c) 2023 System233
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Duplex } from "node:stream";
import { Constructor, IBinaryHelper } from "./hepler.js";
import { BinaryReadStreamMixins } from "./reader.js";
import { BinaryWriteStreamMixins } from "./writer.js";

export const BinaryDuplexStreamMixins = <
  T extends Constructor<IBinaryHelper<Duplex>>
>(
  Base: T
) => BinaryWriteStreamMixins(BinaryReadStreamMixins(Base));

export class BinaryDuplexStream extends BinaryDuplexStreamMixins(
  IBinaryHelper<Duplex>
) {
  static from(...args: ConstructorParameters<typeof BinaryDuplexStream>) {
    return new this(...args);
  }
}
