/* eslint-disable @typescript-eslint/explicit-function-return-type */
// This has to be a JS file because webpack's ts-loader or some other
// compilation step removes the part of this that causes a code split and there
// needs to be a code split or the WASM module will not be loaded.
// See https://github.com/rustwasm/wasm-bindgen/issues/700
export function buildUi() {
  import('./crate/mines_uirs');
}
