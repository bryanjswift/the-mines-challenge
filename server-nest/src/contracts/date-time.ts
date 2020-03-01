import * as io from 'io-ts';

/**
 * Represents a brand indicating that a string contains a
 * representation of a Date.
 */
export interface DateTimeBrand {
  readonly DateTime: unique symbol;
}

/**
 * Definition for the brand of string which holds a parsable `Date`.
 */
export const DateTime = io.brand(
  io.string,
  (s): s is io.Branded<string, DateTimeBrand> => !isNaN(Date.parse(s)),
  'DateTime'
);

export type DateTime = io.TypeOf<typeof DateTime>;
