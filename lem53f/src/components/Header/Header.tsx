import { useContext } from 'preact/hooks';
import { AppContext } from '../../contexts/AppContext';
import './Header.css';

/**
 * Az alkalmazás felső navigációs sávját (headert) megjelenítő komponens.
 *
 * A komponens a `AppContext`-ből olvassa ki:
 * - az aktuális útvonalat (`currentPath`),
 * - valamint a `navigate` függvényt, amellyel az alkalmazáson belüli
 *   navigáció történik.
 *
 * A header három fő linket tartalmaz:
 * - Home
 * - Search
 * - Favourites
 *
 * Az aktuális útvonalnak megfelelő link kiemelést kap (CSS `active` osztály).
 *
 * @returns A navigációs sáv JSX-eleme.
 */
export function Header() {
  // A globális alkalmazás kontextusból kivesszük az aktuális útvonalat
  // és a navigációs függvényt. Így a header tudja, hol járunk,
  // és tud útvonalat váltani.
  const { navigate, currentPath } = useContext(AppContext);

  /**
   * Segédfüggvény, amely visszaadja egy link CSS osztályait
   * az alapján, hogy az adott link útvonala megegyezik-e
   * az aktuális útvonallal.
   *
   * - ha egyezik, hozzáadjuk az `active` osztályt
   * - ha nem, akkor csak az alap `header-link` osztályt használjuk
   */
  const getLinkClass = (path: string) =>
    currentPath === path ? 'header-link active' : 'header-link';

  return (
    // Felső navigációs sáv (header) konténere
    <nav class="header-nav">
      {/* Főoldal link */}
      <a
        href="#/"
        onClick={() => navigate('#/')}           // Alkalmazáson belüli navigáció
        class={getLinkClass('#/')}              // Aktivitás alapján osztály
      >
        Home
      </a>

      {/* Keresés oldal link */}
      <a
        href="#/search"
        onClick={() => navigate('#/search')}
        class={getLinkClass('#/search')}
      >
        Search
      </a>

      {/* Kedvencek oldal link */}
      <a
        href="#/favourites"
        onClick={() => navigate('#/favourites')}
        class={getLinkClass('#/favourites')}
      >
        Favourites
      </a>
    </nav>
  );
}