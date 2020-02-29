import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Type } from 'io-ts';

/**
 * Attempts to transform the given value into the type represented by the given
 * `guard`.
 * @param T representing the expected result.
 * @param guard specified with `io-ts` types.
 * @throws BadRequestException if given value can not be transformed to a `T`.
 */
@Injectable()
export class IoValidationPipe<T> implements PipeTransform {
  constructor(private readonly guard: Type<T>) {}

  transform(value: unknown): T {
    if (this.guard.is(value)) {
      return value;
    } else {
      const result = this.guard.decode(value);
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
          throw new BadRequestException(
            `Missing required parameters. (${keys})`,
            'invalid_params'
          );
        case 'Right':
          return result.right;
      }
    }
  }
}
