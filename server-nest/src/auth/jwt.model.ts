import * as io from 'io-ts';

/**
 * Represent the request body for creating a cat instance as a runtime
 * verifiable type.
 */
export const JwtPayload = io.type({
  sub: io.string,
  username: io.string,
});

export type JwtPayload = io.TypeOf<typeof JwtPayload>;
