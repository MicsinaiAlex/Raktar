import { createContext } from 'preact';
import { IAppContext, ISearchState } from '../types';

/**
 * A keresés kezdeti (üres) állapota.
 *
 * Ez az objektum a `searchState` alapértelmezett értéke:
 * - minden mező üres,
 * - nincs találat,
 * - nem töltünk,
 * - nincs hiba,
 * - és `isInitial = true`, ami jelzi, hogy még nem történt keresés.
 */
const emptySearchState: ISearchState = {
  name: '',
  ingredient: '',
  area: '',
  meals: [],
  loading: false,
  error: null,
  isInitial: true,
};

/**
 * Az alkalmazás globális kontextusa.
 *
 * Ez a kontextus tartalmazza:
 * - a kliens oldali navigációért felelős függvényeket (`navigate`, `goBack`),
 * - az aktuális útvonalat (`currentPath`),
 * - a kedvencek listáját, valamint azok kezelésére szolgáló műveleteket
 *   (`favourites`, `addFavourite`, `removeFavourite`, `addCommentToFavourite`,
 *   `isFavourite`),
 * - a keresés állapotát (`searchState`) és annak frissítésére szolgáló
 *   függvényt (`setSearchState`).
 *
 * @remarks
 * A `createContext` hívásban megadott alapértelmezett érték egy „fallback”
 * implementáció, amely akkor használódik, ha egy komponens a
 * `AppContext`-et úgy próbálja elérni, hogy nincs körülötte megfelelő
 * `AppContext.Provider`.
 *
 * Ilyenkor:
 * - a függvények figyelmeztetést írnak a konzolra (`console.warn`),
 * - a `isFavourite` mindig `false`-t ad vissza,
 * - a `searchState` az `emptySearchState` értéket veszi fel.
 *
 * Emiatt produkciós környezetben fontos, hogy az egész alkalmazást
 * (vagy legalábbis azokat a részeket, amelyek ezt a kontextust használják)
 * egy megfelelően beállított `AppContext.Provider` vegye körül.
 */
export const AppContext = createContext<IAppContext>({
  // Navigációs függvény: normál esetben az útvonal módosítását végzi,
  // itt alapértelmezésként csak figyelmeztetünk, hogy a kontextus még nincs beállítva.
  navigate: () => console.warn('AppContext not yet initialized'),

  // Visszalépés az előző oldalra: alapértelmezett esetben szintén csak figyelmeztet.
  goBack: () => console.warn('AppContext not yet initialized'),

  // Alapértelmezett aktuális útvonal (root).
  currentPath: '#/',

  // Alapértelmezett kedvencek lista: üres tömb.
  favourites: [],

  // Kedvenc hozzáadása: ha a Provider nincs beállítva, csak figyelmeztetést írunk.
  addFavourite: () => console.warn('AppContext not yet initialized'),

  // Kedvenc eltávolítása: ugyanígy csak figyelmeztet.
  removeFavourite: () => console.warn('AppContext not yet initialized'),

  // Megjegyzés (komment) hozzáadása egy kedvenchez: alapértelmezett figyelmeztetés.
  addCommentToFavourite: () => console.warn('AppContext not yet initialized'),

  // Ellenőrzi, hogy egy adott recept kedvenc-e.
  // Alapértelmezetten mindig false, hogy ne okozzon hibát a használata.
  isFavourite: () => false,

  // Keresés állapota: kezdeti, üres állapot.
  searchState: emptySearchState,

  // Keresési állapot frissítése: ha nincs Provider, csak figyelmeztetünk.
  setSearchState: () => console.warn('AppContext not yet initialized'),
});