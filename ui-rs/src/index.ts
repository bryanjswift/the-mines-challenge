import './index.css';

function main(): void {
  import('./crate/mines_mogwai').then(() =>
    console.debug('mines_mogwai module loaded')
  );
}

main();
