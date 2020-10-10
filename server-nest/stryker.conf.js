/**
 * @type {import('@stryker-mutator/api/core').StrykerOptions}
 */
module.exports = {
  buildCommand: 'tsc -b',
  dashboard: {
    project: 'the-mines-challenge',
    module: 'server-nest',
  },
  concurrency: 4,
  packageManager: 'yarn',
  reporters: ['clear-text', 'html', 'progress'],
  testRunner: 'jest',
  timeoutFactor: 2,
  timeoutMS: 2000,
  coverageAnalysis: 'off',
  tsconfigFile: 'tsconfig.json',
  mutate: ['src/**/*.ts', '!src/**/*.spec.ts'],
};
