import * as io from 'io-ts';

export interface DateTimeBrand {
  readonly DateTime: unique symbol;
}

export const DateTime = io.brand(
  io.string,
  (s): s is io.Branded<string, DateTimeBrand> => !isNaN(Date.parse(s)),
  'DateTime'
);

export type DateTime = io.TypeOf<typeof DateTime>;
