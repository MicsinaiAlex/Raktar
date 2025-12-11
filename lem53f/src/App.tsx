import { useState } from 'preact/hooks';
import { AppContext } from './contexts/AppContext';
import { useFavourites } from './hooks/useFavourites';
import { Header } from './components/Header/Header';
import { Home } from './pages/Home/Home';
import { Search } from './pages/Search/Search';
import { Favourites } from './pages/Favourites/Favourites';
import { RecipeDetail } from './pages/RecipeDetail/RecipeDetail';
import { ISearchState } from './types';
import { Footer } from './components/Footer/Footer';
import { NotFoundPage } from './pages/NotFoundPage/NotFoundPage';

/**
 * Az alkalmazás fő komponense.
 *
 * Feladatai:
 * - a kliens oldali „routing” megvalósítása a `location.hash` alapján,
 * - a globális állapot (kedvencek + keresési állapot + navigáció) biztosítása
 *   az `AppContext`-en keresztül,
 * - a megfelelő oldal (Home, Search, Favourites, RecipeDetail) renderelése
 *   az aktuális útvonalnak megfelelően.
 *
 * A komponens a teljes alkalmazást egy `AppContext.Provider`-be csomagolja,
 * így a gyerek komponensek a `useContext(AppContext)` segítségével
 * hozzáférhetnek a globális adatokhoz és függvényekhez.
 *
 * @returns Az alkalmazás gyökér JSX-struktúrája.
 */
export function App() {
  // A jelenlegi útvonal (hash alapú „routing”).
  // Kezdeti érték: a böngésző címsorából olvassuk ki a hash-t, vagy ha nincs, akkor '#/'.
  const [currentPath, setCurrentPath] = useState(window.location.hash || '#/');

  // Az előző útvonal mentése; ezt használja a "Back" funkció,
  // hogy visszavigyen oda, ahonnan a részletező oldalra érkeztünk.
  const [prevPath, setPrevPath] = useState<string | null>(null);

  // Kedvencek kezelése egy külön egyéni hookon keresztül:
  // - `favourites`: kedvenc receptek listája
  // - `addFavourite`, `removeFavourite`, `addCommentToFavourite`, `isFavourite`:
  //   kedvencek kezelésére szolgáló műveletek
  const {
    favourites,
    addFavourite,
    removeFavourite,
    addCommentToFavourite,
    isFavourite,
  } = useFavourites();

  // Keresési állapotot itt tartjuk (legfelső szinten),
  // hogy a Search oldal állapota (mezők + találatok + betöltés/hiba) megmaradjon
  // navigációk között is (pl. részletező oldalra lépés, majd vissza).
  const [searchState, setSearchStateInternal] = useState<ISearchState>({
    name: '',
    ingredient: '',
    area: '',
    meals: [],
    loading: false,
    error: null,
    isInitial: true,
  });

  /**
   * A keresési állapot (Search state) részleges frissítésére szolgáló wrapper.
   *
   * @remarks
   * Nem kell minden frissítésnél az összes mezőt átadni; elegendő
   * a változó mezőket megadni. A függvény a korábbi állapotot
   * és az új részleges állapotot egyesíti (`{ ...prev, ...s }`).
   *
   * @param s - A frissíteni kívánt mezőket tartalmazó részleges állapot.
   */
  const setSearchState = (s: Partial<ISearchState>) => {
    setSearchStateInternal((prev) => ({ ...prev, ...s }));
  };

  /**
   * Navigációs függvény, amelyet a komponensek a Context-en keresztül érnek el.
   *
   * A `window.location.hash` módosításával vált útvonalat, és ehhez
   * szinkronban frissíti a `currentPath` state-et is.
   *
   * @param path - A cél útvonal (pl. `#/search`, `#/favourites`, `#/recipe/12345`).
   *
   * @remarks
   * Ha recept részletezőre (`#/recipe/...`) navigálunk úgy, hogy
   * az aktuális útvonal még nem részletező, akkor elmentjük az aktuális útvonalat
   * a `prevPath` állapotba. Ezt használja a `goBack`, hogy visszavezessen
   * az előző oldalra (pl. a Search oldalra az eredeti találatokkal).
   */
  const navigate = (path: string) => {
    // Ha recept részletezőre navigálunk, és jelenleg nem részletezőn vagyunk,
    // mentjük az aktuális útvonalat, hogy később vissza tudjunk rá lépni.
    if (path.startsWith('#/recipe/') && !currentPath.startsWith('#/recipe/')) {
      setPrevPath(currentPath);
    }

    // A hash módosítása frissíti az URL-t.
    window.location.hash = path;

    // A belső állapotot is frissítjük, hogy a render logika reagáljon rá.
    setCurrentPath(path);
  };

  /**
   * „Vissza” navigációt megvalósító függvény.
   *
   * @remarks
   * Ha a `prevPath` ki van töltve, arra az útvonalra lép vissza,
   * majd törli a `prevPath`-et (egylépcsős visszalépés).
   *
   * Ha nincs `prevPath`, akkor a főoldalra (`#/`) navigál.
   */
  const goBack = () => {
    if (prevPath) {
      // Visszalépés a mentett előző útvonalra.
      window.location.hash = prevPath;
      setCurrentPath(prevPath);
      setPrevPath(null);
    } else {
      // Ha nincs mit „vissza” lépni, alapértelmezésként a főoldalra megyünk.
      window.location.hash = '#/';
      setCurrentPath('#/');
    }
  };

  /**
   * A `currentPath` alapján eldönti, melyik oldal komponenst kell renderelni.
   *
   * @remarks
   * - Ha a `currentPath` egy recept részletező útvonal (`#/recipe/...`),
   *   akkor kinyeri az ID-t, és a `RecipeDetail` komponenst rendereli.
   * - Egyéb esetekben `switch`-et használ a főbb útvonalakra:
   *   - `#/` → `Home`
   *   - `#/search` → `Search`
   *   - `#/favourites` → `Favourites`
   *   - ismeretlen útvonal esetén fallback: `Home`.
   *
   * @returns Az aktuális útvonalnak megfelelő oldal JSX-eleme.
   */
  const renderPage = () => {
    // Recept részletező: `#/recipe/<id>`
    if (currentPath.startsWith('#/recipe/')) {
      const id = currentPath.split('/')[2];
      return <RecipeDetail mealId={id} />;
    }

    // Fő útvonalak kezelése
    switch (currentPath) {
      case '#/':
        return <Home />;
      case '#/search':
        return <Search />;
      case '#/favourites':
        return <Favourites />;
      default:
        return <NotFoundPage />;
    }
  };

  // Az AppContext.Provider biztosítja a globális állapotot
  // az alkalmazáskomponens-fa összes gyerekének.
  return (
    <AppContext.Provider
      value={{
        navigate,
        goBack,
        currentPath,
        favourites,
        addFavourite,
        removeFavourite,
        addCommentToFavourite,
        isFavourite,
        searchState,
        setSearchState,
      }}
    >
      {/* Felső navigációs sáv */}
      <Header />

      {/* A fő tartalmi rész, amely az aktuális útvonalnak megfelelő oldalt mutatja. */}
      <main>{renderPage()}</main>

      {/* Alsó lábléc */}
      <Footer />
    </AppContext.Provider>
  );
}