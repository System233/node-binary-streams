// Copyright (c) 2023 System233
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { Readable } from "node:stream";

export interface ReadableEvent {
  close: () => void;
  data: (chunk: any) => void;
  end: () => void;
  error: (err: Error) => void;
  pause: () => void;
  readable: () => void;
  resume: () => void;
}

export interface WritableEvent {
  close: () => void;
  drain: () => void;
  error: (err: Error) => void;
  finish: () => void;
  pipe: (src: Readable) => void;
  unpipe: (src: Readable) => void;
}

export type DuplexEvent = ReadableEvent & WritableEvent;
