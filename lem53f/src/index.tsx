import { render } from 'preact';
import { App } from './App';
import './style.css';

/**
 * Az alkalmazás belépési pontja (entry point).
 *
 * @remarks
 * Itt történik:
 * - a globális stílusok betöltése (`style.css`),
 * - a fő `App` komponens renderelése a HTML-ben található gyökérelembe.
 *
 * A Preact `render` függvénye a megadott JSX fát beilleszti
 * a `document.getElementById('app')` által visszaadott DOM elembe.
 */

// Az alkalmazás renderelése az 'app' id-jű div-be az index.html-ben.
// A `!` non-null assertion azért kell, mert a TypeScript számára explicit
// jelezzük, hogy az elem biztosan létezik a DOM-ban.
render(<App />, document.getElementById('app')!);