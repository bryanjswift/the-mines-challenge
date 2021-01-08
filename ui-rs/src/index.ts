function main(): void {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  import('./crate/mines_uirs').then((module) => module.buildUi());
}

main();
