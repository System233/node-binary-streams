// Copyright (c) 2023 System233
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Duplex } from "node:stream";
import { Constructor, IBinaryHelper } from "./hepler.js";
import { BinaryReadStreamMixins, IBinaryReadStream } from "./reader.js";
import { BinaryWriteStreamMixins, IBinaryWriteStream } from "./writer.js";

export const BinaryDuplexStreamMixins = <T extends Duplex>(
  Base: Constructor<IBinaryHelper<T>>
) =>
  BinaryWriteStreamMixins(BinaryReadStreamMixins(Base)) as Constructor<
    IBinaryHelper<T> & Duplex & IBinaryReadStream & IBinaryWriteStream
  >;

export class BinaryDuplexStream extends BinaryDuplexStreamMixins(
  IBinaryHelper<Duplex>
) {
  static from(...args: ConstructorParameters<typeof IBinaryHelper<Duplex>>) {
    return new this(...args);
  }
}
