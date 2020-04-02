/**
 * @type {import('@stryker-mutator/api/core').StrykerOptions}
 */
module.exports = {
  dashboard: {
    project: 'the-mines-challenge',
    module: 'server-nest',
  },
  maxConcurrentTestRunners: 4,
  mutator: 'typescript',
  packageManager: 'yarn',
  reporters: ['clear-text', 'html', 'progress'],
  testRunner: 'jest',
  transpilers: ['typescript'],
  timeoutFactor: 2,
  timeoutMS: 2000,
  coverageAnalysis: 'off',
  tsconfigFile: 'tsconfig.json',
  mutate: ['src/**/*.ts', '!src/**/*.spec.ts'],
};
