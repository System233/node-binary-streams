// Copyright (c) 2023 System233
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Readable, Writable, Duplex } from "node:stream";

export type IBinaryHelperConstructor<T extends Readable | Writable | Duplex> =
  new (...args: any[]) => IBinaryHelper<T> & T;

export type Constructor<T> = new (...args: any[]) => T;

export interface IBinaryHelperOption {
  littleEndian?: boolean;
}

export class IBinaryHelper<T extends Readable | Writable | Duplex> {
  littleEndian: boolean = true;
  constructor(readonly stream: T, option?: IBinaryHelperOption) {
    if (option) {
      if (option.littleEndian != void 0) {
        this.littleEndian = option.littleEndian;
      }
    }
  }
}
