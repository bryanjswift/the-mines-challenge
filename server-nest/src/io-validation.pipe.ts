import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Type } from 'io-ts';

/**
 * Attempts to transform the given value into the type represented by the given
 * `guard`.
 * @param T representing the expected result.
 * @param guard specified with `io-ts` types.
 */
@Injectable()
export class IoValidationPipe<T> implements PipeTransform {
  constructor(private readonly decoder: Type<T>) {}

  /**
   * Attempts to create a `T` from the given `unknown` `value`.
   * @param value to be decoded.
   * @returns T instance decoded from the guard type associated with the pipe.
   * @throws BadRequestException if given value can not be transformed to a `T`.
   */
  transform(value: unknown): T {
    if (this.decoder.is(value)) {
      return value;
    } else {
      const result = this.decoder.decode(value);
      switch (result._tag) {
        case 'Left':
          // This is cribbed from the io-ts docs
          // https://github.com/gcanti/io-ts/blob/master/README.md#error-reporters
          const keys = result.left
            .map(e =>
              e.context
                .map(({ key }) => key)
                .filter(key => key.length > 0)
                .join('.')
            )
            .join(', ');
          const invalidValues = result.left
            .map(error => error.value)
            .filter(value => !!value);
          if (invalidValues.length > 0) {
            throw new BadRequestException(
              `Invalid parameters. (${keys})`,
              'invalid_params'
            );
          } else {
            throw new BadRequestException(
              `Missing required parameters. (${keys})`,
              'missing_params'
            );
          }
        case 'Right':
          return result.right;
      }
    }
  }
}
