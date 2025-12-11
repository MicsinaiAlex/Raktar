import { useContext } from 'preact/hooks';
import { SearchForm } from '../../components/SearchForm/SearchForm';
import { AppContext } from '../../contexts/AppContext';
import { fetchRandomRecipes, searchRecipes } from '../../utils/api';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { RecipeList } from '../../components/RecipeList/RecipeList';
import { timeout, REQUEST_TIMEOUT_MS } from '../../utils/timeout';

/**
 * A véletlenszerű receptek száma, amelyet a kereső oldal
 * "üres" keresés esetén lekér.
 */
const RANDOM_RECIPE_COUNT = 20;

/**
 * A Kereső (Search) oldal komponense.
 *
 * Főbb feladatai:
 * - Keresési űrlap megjelenítése (`SearchForm`),
 * - Keresés végrehajtása név, hozzávaló és/vagy terület alapján (`searchRecipes`),
 * - Véletlenszerű receptek betöltése, ha nincs megadott keresési feltétel (`fetchRandomRecipes`),
 * - Betöltés és hiba állapotok kezelése (`LoadingSpinner`, `ErrorMessage`),
 * - Keresési találatok megjelenítése (`RecipeList`).
 *
 * A keresés állapotát az `AppContext`-ben tároljuk (`searchState`), így:
 * - a mezők tartalma és a találatok megmaradnak,
 * - ha a felhasználó megnyit egy receptet és visszalép, nem vész el a keresés.
 *
 * Az API hívások egy `timeout` wrapperen keresztül futnak, így
 * túl hosszú válaszidő esetén időtúllépéses hiba keletkezik.
 *
 * @returns A kereső oldal JSX-struktúrája.
 */
export function Search() {
  // A keresés globális állapota és annak frissítésére szolgáló függvény
  // a Kontextusból. Feltételezzük, hogy `setSearchState` részleges state-et is tud merge-ölni.
  const { searchState, setSearchState } = useContext(AppContext);

  /**
   * Keresés indítása az űrlapból kapott paraméterekkel.
   *
   * Lépések:
   * - Ha minden mező üres, nem futtatunk valódi keresést, hanem véletlen recepteket töltünk be (`loadRandom`).
   * - Egyébként:
   *   - "loading" állapotot állítunk,
   *   - "isInitial" = false, hogy tudjuk: már történt keresés,
   *   - töröljük az esetleges korábbi hibát,
   *   - meghívjuk a `searchRecipes` API-t a `timeout` wrapperen keresztül,
   *   - siker esetén eltároljuk a találatokat,
   *   - hiba vagy timeout esetén hibaüzenetet állítunk be.
   *
   * @param params - A keresési feltételek (név, hozzávaló, terület).
   */
  const handleSearch = (params: { name: string; ingredient: string; area: string }) => {
    // Ha minden mező üres, inkább random recepteket töltünk be.
    if (!params.name && !params.ingredient && !params.area) {
      loadRandom();
      return;
    }

    // Keresés indul: betöltés jelzése, kezdő állapot kilövése, hiba törlése.
    setSearchState({ loading: true, isInitial: false, error: null });

    // Az API hívást timeout-tal védjük: ha nem ér vissza időben,
    // "The request took too long." hibával elutasul.
    timeout(
      () => searchRecipes(params),
      REQUEST_TIMEOUT_MS,
      'The request took too long.'
    )
      .then((data) => {
        // Sikeres keresés: találatok beállítása, hiba nullázása, betöltés vége.
        setSearchState({ meals: data, error: null, loading: false });
      })
      .catch((err) => {
        // Hiba vagy timeout: üres találati lista + hibaüzenet.
        setSearchState({
          meals: [],
          error: err.message || 'Search failed',
          loading: false,
        });
      });
  };

  /**
   * Véletlenszerű receptek betöltése a kereső oldalon.
   *
   * Akkor használjuk:
   * - ha a felhasználó üres űrlapot küld be,
   * - vagy ha később explicit random találatokat szeretnénk mutatni.
   *
   * Lépések:
   * - "loading" állapot bekapcsolása,
   * - "isInitial" = false (már volt interakció),
   * - hiba törlése,
   * - `fetchRandomRecipes` meghívása timeout wrapperrel,
   * - siker esetén találatok beállítása,
   * - hiba esetén hibaüzenet + üres lista.
   */
  const loadRandom = () => {
    setSearchState({ loading: true, isInitial: false, error: null });

    timeout(
      () => fetchRandomRecipes(RANDOM_RECIPE_COUNT),
      REQUEST_TIMEOUT_MS,
      'The request took too long.'
    )
      .then((data) => {
        setSearchState({ meals: data, error: null, loading: false });
      })
      .catch((err) => {
        setSearchState({
          meals: [],
          error: err.message || 'Failed to load random',
          loading: false,
        });
      });
  };

  return (
    <div class="search-page">
      <h2>Search for Recipes</h2>

      {/* Kereső űrlap:
          - a mezők értékei a `searchState`-ből jönnek,
          - módosításkor részleges state frissítésekkel (`setSearchState`) dolgozunk,
          - beküldéskor a `handleSearch` fut le. */}
      <SearchForm
        name={searchState.name}
        ingredient={searchState.ingredient}
        area={searchState.area}
        onNameChange={(v) => setSearchState({ name: v })}
        onIngredientChange={(v) => setSearchState({ ingredient: v })}
        onAreaChange={(v) => setSearchState({ area: v })}
        onSearch={handleSearch}
      />

      {/* Betöltés alatt spinner jelenik meg. */}
      {searchState.loading && <LoadingSpinner />}

      {/* Hiba esetén a hibaüzenet komponens jelenik meg. */}
      {searchState.error && <ErrorMessage message={searchState.error} />}

      {/* Akkor jelenítünk meg találati listát, ha:
          - nem töltünk (`!loading`),
          - nincs hiba (`!error`),
          - és túl vagyunk az első "passzív" állapoton (`!isInitial`). */}
      {!searchState.loading && !searchState.error && !searchState.isInitial && (
        <>
          {searchState.meals.length > 0 ? (
            // Van találat: receptlista mutatása.
            <RecipeList meals={searchState.meals} />
          ) : (
            // Nincs találat: felhasználóbarát üzenet.
            <p>No recipes found for your criteria.</p>
          )}
        </>
      )}
    </div>
  );
}