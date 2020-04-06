function main(): void {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  import('./renderer').then((module) => module.buildUi());
}

main();
