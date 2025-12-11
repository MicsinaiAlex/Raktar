import { useState, useEffect } from 'preact/hooks';
import { IMeal } from '../../types';
import { fetchRandomRecipes } from '../../utils/api';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { RecipeList } from '../../components/RecipeList/RecipeList';
import { timeout, REQUEST_TIMEOUT_MS } from '../../utils/timeout';
import './Home.css';

/**
 * A főoldalon megjelenő véletlenszerű receptek száma.
 *
 * Ezt az értéket használjuk minden véletlen recept lekérésnél:
 * - inicializáló betöltéskor,
 * - manuális frissítés (`Refresh recipes`) esetén.
 */
const RANDOM_RECIPE_COUNT = 20;

/**
 * A Főoldal (Home) komponens.
 *
 * Feladatai:
 * - üdvözli a felhasználót,
 * - lekér és megjelenít egy listányi véletlenszerű receptet,
 * - kezeli a betöltés (loading) és hiba (error) állapotot,
 * - lehetőséget ad a receptek manuális frissítésére.
 *
 * A komponens:
 * - a `fetchRandomRecipes` API hívást használja,
 * - a kérést egy `timeout` wrapperrel védi, így túl hosszú várakozás esetén
 *   időtúllépéses hibát jelez a felhasználónak,
 * - az adatok betöltése alatt egy `LoadingSpinner`-t,
 *   hiba esetén egy `ErrorMessage`-et jelenít meg.
 *
 * @returns A főoldal JSX-struktúrája.
 */
export function Home() {
  // A jelenleg megjelenített véletlenszerű receptek listája.
  const [meals, setMeals] = useState<IMeal[]>([]);

  // Betöltési állapot: true, amíg aktív API hívás van folyamatban.
  const [loading, setLoading] = useState(true);

  // Hibaüzenet állapot: string, ha hiba történt, különben null.
  const [error, setError] = useState<string | null>(null);

  /**
   * Adatlekérési logika a komponens inicializálásakor.
   *
   * Csak egyszer fut le (mountkor), az üres dependency tömb miatt.
   *
   * Fontos:
   * - A `meals` állapotot csak akkor frissítjük, ha még üres,
   *   így ha a felhasználó egy recept részleteiről visszanavigál
   *   a főoldalra, nem indítunk új lekérést, hanem a korábban
   *   betöltött listát mutatjuk.
   * - A hívást a `timeout` segédfüggvényen keresztül futtatjuk, így
   *   ha az API válaszára túl sokat kellene várni, az időtúllépés is
   *   kezelhető, mint hibaállapot.
   */
  useEffect(() => {
    if (meals.length === 0) {
      setLoading(true);
      setError(null);

      // A `timeout` wrapper annyit tesz, hogy ha a `fetchRandomRecipes`
      // nem fejeződik be `REQUEST_TIMEOUT_MS` időn belül, hibával elutasul.
      timeout(
        () => fetchRandomRecipes(RANDOM_RECIPE_COUNT),
        REQUEST_TIMEOUT_MS,
        'The request took too long.'
      )
        .then((data) => {
          // Sikeres lekérés esetén elmentjük a kapott recepteket,
          // és töröljük az esetleges korábbi hibaüzenetet.
          setMeals(data);
          setError(null);
        })
        .catch((err) => {
          // Hiba esetén (API hiba vagy timeout) beállítjuk a hibaüzenetet,
          // és kiürítjük a listát.
          setError(err.message || 'Failed to load recipes.');
          setMeals([]);
        })
        .finally(() => {
          // Minden esetben megszüntetjük a "loading" állapotot.
          setLoading(false);
        });
    } else {
      // Ha a `meals` már tartalmaz adatot (pl. visszanavigálás esetén),
      // akkor nem indítunk új lekérést, csak levesszük a "loading" flaget.
      setLoading(false);
    }
    // Az üres dependency tömb biztosítja, hogy csak mount-kor fusson le.
    // (Tudatosan *nem* tesszük bele a `meals`-t a tömbbe, mert az megváltoztatná
    // a futási logikát.)
  }, []);

  /**
   * Manuális frissítés: új véletlenszerű receptek betöltése.
   *
   * Lépései:
   * - "loading" állapot bekapcsolása,
   * - hibaállapot nullázása,
   * - új lekérés indítása `fetchRandomRecipes` + `timeout` segítségével,
   * - siker esetén a `meals` frissítése,
   * - hiba esetén hibaüzenet beállítása,
   * - végül a "loading" állapot kikapcsolása.
   */
  const reloadRandom = () => {
    setLoading(true);
    setError(null);

    timeout(
      () => fetchRandomRecipes(RANDOM_RECIPE_COUNT),
      REQUEST_TIMEOUT_MS,
      'The request took too long.'
    )
      .then((data) => {
        // Siker esetén új véletlen recepteket jelenítünk meg.
        setMeals(data);
      })
      .catch((err) => {
        // Hiba vagy timeout esetén felhasználóbarát üzenetet mutatunk.
        setError(err.message || 'Failed to load recipes.');
        setMeals([]);
      })
      .finally(() => {
        // A betöltés véget ér, akár siker, akár hiba történt.
        setLoading(false);
      });
  };

  return (
    <div class="home-page">
      <h1 class="welcome-title">Welcome to the Recipe App!</h1>
      <p class="welcome-subtitle">Discover random recipes below.</p>

      {/* Manuális frissítés gomb: új véletlen recepteket kér le. */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <button onClick={reloadRandom}>Refresh recipes</button>
      </div>

      {/* Betöltés alatt spinner látszik. */}
      {loading && <LoadingSpinner />}

      {/* Hiba esetén hibaüzenet látszik. */}
      {error && <ErrorMessage message={error} />}

      {/* Ha nincs se hiba, se betöltés, a receptek listája látszik. */}
      {!loading && !error && <RecipeList meals={meals} />}
    </div>
  );
}