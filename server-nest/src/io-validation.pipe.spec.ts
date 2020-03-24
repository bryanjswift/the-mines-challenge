import { BadRequestException } from '@nestjs/common';
import * as io from 'io-ts';
import { IoValidationPipe } from './io-validation.pipe';

const Dto = io.type({
  x: io.Int,
  y: io.Int,
});

type Dto = io.TypeOf<typeof Dto>;

const VALID = { x: 3, y: 4 };
const INVALID = { x: '3', y: '4' };
const MISSING = {};
const EXTRA = { x: 4, y: 5, z: 6 };

describe(IoValidationPipe, () => {
  const pipe = new IoValidationPipe(Dto);

  describe(JSON.stringify(VALID), () => {
    const subject = VALID;

    it('skips if not body', () => {
      expect(pipe.transform(subject, { type: 'custom' })).toBe(subject);
    });

    it('parses if body', () => {
      expect(pipe.transform(subject, { type: 'body' })).toBeDefined();
    });

    it('parses into Dto', () => {
      const result = pipe.transform(subject, { type: 'body' });
      expect(result).toHaveProperty('x', VALID.x);
      expect(result).toHaveProperty('y', VALID.y);
    });
  });

  describe(JSON.stringify(INVALID), () => {
    const subject = INVALID;

    it('skips if not body', () => {
      expect(pipe.transform(subject, { type: 'custom' })).toBe(subject);
    });

    it('parses if body', () => {
      expect(() => pipe.transform(subject, { type: 'body' })).toThrow(
        BadRequestException
      );
    });

    it('is an invalid_params error', () => {
      try {
        pipe.transform(subject, { type: 'body' });
        fail('IoValidationPipe#transform should have thrown.');
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.getResponse()).toHaveProperty('error', 'invalid_params');
      }
    });
  });

  describe(JSON.stringify(MISSING), () => {
    const subject = MISSING;

    it('skips if not body', () => {
      expect(pipe.transform(subject, { type: 'custom' })).toBe(subject);
    });

    it('parses if body', () => {
      expect(() => pipe.transform(subject, { type: 'body' })).toThrow(
        BadRequestException
      );
    });

    it('is a missing_params error', () => {
      try {
        pipe.transform(subject, { type: 'body' });
        fail('IoValidationPipe#transform should have thrown.');
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.getResponse()).toHaveProperty('error', 'missing_params');
      }
    });
  });

  describe(JSON.stringify(EXTRA), () => {
    const subject = EXTRA;

    it('skips if not body', () => {
      expect(pipe.transform(subject, { type: 'custom' })).toBe(subject);
    });

    it('parses if body', () => {
      const result = pipe.transform(subject, { type: 'body' });
      expect(result).toHaveProperty('x', EXTRA.x);
      expect(result).toHaveProperty('y', EXTRA.y);
      expect(result).toHaveProperty('z', EXTRA.z);
    });
  });
});

describe('Fail Pipe', () => {
  const FailString = new io.Type<string, string, unknown>(
    'string',
    (_input: unknown): _input is string => false,
    (input, context) => typeof input === 'string' ? io.success(input) : io.failure(input, context),
    io.identity
  );

  const StringPoint = io.type({
    x: FailString,
    y: io.Int,
  });
  type StringPoint = io.TypeOf<typeof StringPoint>;

  const pipe = new IoValidationPipe(StringPoint);

  const VALID = { x: 'foo', y: 4 };
  describe(JSON.stringify(VALID), () => {
    const subject = VALID;

    it('skips if not body', () => {
      expect(pipe.transform(subject, { type: 'custom' })).toBe(subject);
    });

    it('parses if body', () => {
      expect(pipe.transform(subject, { type: 'body' })).toBeDefined();
    });

    it('parses into StringPoint', () => {
      const result = pipe.transform(subject, { type: 'body' });
      expect(result).toHaveProperty('x', VALID.x);
      expect(result).toHaveProperty('y', VALID.y);
    });
  });
});
