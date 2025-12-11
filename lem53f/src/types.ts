/**
 * A MealDB API-ból visszaérkező recept objektum struktúrája.
 *
 * @remarks
 * A MealDB sok mezőt dinamikus kulcsokkal ad vissza (pl. `strIngredient1`–`strIngredient20`,
 * `strMeasure1`–`strMeasure20`). Ezeket a dinamikus mezőket a
 * `[key: string]: string | null` indexszignatúra fedi le, így a kódban
 * programozottan (pl. ciklussal) is elérhetők.
 */
export interface IMeal {
  /** A recept egyedi azonosítója (string formátumban). */
  idMeal: string;

  /** A recept neve. */
  strMeal: string;

  /** Alternatív ital-ajánlat a recepthez, ha van (különben `null`). */
  strDrinkAlternate: string | null;

  /** A recept kategóriája (pl. "Dessert", "Seafood"). */
  strCategory: string;

  /** A recept eredet szerinti régiója / konyhája (pl. "Italian", "Mexican"). */
  strArea: string;

  /** Elkészítési utasítások hosszú szövegként. */
  strInstructions: string;

  /** A recepthez tartozó kép (thumbnail) URL-je. */
  strMealThumb: string;

  /** A recepthez kapcsolódó címkék (tag-ek) vesszővel elválasztva, vagy `null`. */
  strTags: string | null;

  /** A recepthez tartozó YouTube videó URL-je, ha van. */
  strYoutube: string;

  /**
   * Dinamikus kulcsok az összetevőkhöz, mértékegységekhez és egyéb mezőkhöz.
   *
   * @remarks
   * A MealDB API olyan mezőket ad vissza, mint pl.:
   * - `strIngredient1`, `strIngredient2`, ... `strIngredient20`
   * - `strMeasure1`, `strMeasure2`, ... `strMeasure20`
   *
   * Ezek típusa szintén `string | null`, ezért az indexszignatúra
   * lehetővé teszi, hogy a kódban dinamikusan, pl. ciklussal
   * érjük el őket:
   *
   * ```ts
   * for (let i = 1; i <= 20; i++) {
   *   const ingredient = meal[`strIngredient${i}`];
   *   const measure = meal[`strMeasure${i}`];
   *   // ...
   * }
   * ```
   */
  [key: string]: string | null;
}

/**
 * Kedvencként elmentett recept típusa.
 *
 * @remarks
 * Az `IMeal` összes mezőjét tartalmazza, kiegészítve opcionális
 * felhasználói kommenttel (`userComment`), amelyet a felhasználó
 * a saját kedvenceihez fűzhet.
 */
export interface IFavourite extends IMeal {
  /** Opcionális felhasználói komment a kedvenchez. */
  userComment?: string;
}

/**
 * A keresési állapot megőrzéséhez használt típus.
 *
 * @remarks
 * Ezt az állapotot az `AppContext` tárolja, hogy:
 * - a keresési mezők aktuális értékei,
 * - a találatok,
 * - és a betöltés/hiba flag-ek
 * megmaradjanak akkor is, ha a felhasználó más nézetre navigál
 * (pl. recept részletezőre) és onnan visszatér.
 */
export interface ISearchState {
  /** A név szerinti keresés aktuális szövege (Recipe Name mező). */
  name: string;

  /** A hozzávaló szerinti keresés aktuális szövege (Main Ingredient mező). */
  ingredient: string;

  /** Az eredet/régió szerinti keresés aktuális szövege (Area mező). */
  area: string;

  /** Az aktuális kereséshez tartozó találatok listája. */
  meals: IMeal[];

  /** Betöltés állapot: `true`, ha éppen keresés vagy random betöltés folyik. */
  loading: boolean;

  /** Hibaüzenet, ha a keresés vagy a random betöltés hibával tér vissza, különben `null`. */
  error: string | null;

  /**
   * Jelzi, hogy a kereső nézet kezdeti állapotban van-e.
   *
   * - `true`: a felhasználó még nem indított keresést, vagy nem volt interakció,
   * - `false`: már történt valamilyen keresés vagy betöltés, így találatokat
   *   vagy „nincs találat” üzenetet érdemes mutatni.
   */
  isInitial: boolean;
}

/**
 * A globális App Context állapota.
 *
 * @remarks
 * Ez az interfész írja le, hogy milyen adatokat és függvényeket
 * biztosít az alkalmazás globális kontextusa (`AppContext`):
 *
 * - kliens oldali navigáció (útvonalváltás, visszalépés),
 * - aktuális útvonal (`currentPath`),
 * - kedvencek kezelése (lista + műveletek),
 * - keresési állapot (`searchState`) és annak frissítése.
 *
 * A komponensek a `useContext(AppContext)` hívással férnek hozzá
 * ezekhez az értékekhez.
 */
export interface IAppContext {
  /**
   * Navigációs függvény egy adott útvonalra.
   *
   * @param path - Az új útvonal (pl. `#/search`, `#/recipe/12345`).
   */
  navigate: (path: string) => void;

  /**
   * Visszalépés az előző nézetre.
   *
   * @remarks
   * Jellemzően:
   * - ha van "előző" útvonal, arra lép vissza,
   * - ha nincs, visszavisz a főoldalra (pl. `#/`).
   */
  goBack: () => void;

  /**
   * Az aktuális kliens oldali útvonal.
   *
   * Példák:
   * - `#/` – Főoldal
   * - `#/search` – Kereső oldal
   * - `#/recipe/12345` – Recept részletező
   */
  currentPath: string;

  /**
   * A kedvenc receptek listája.
   *
   * @remarks
   * Ez a lista tartalmazza a felhasználó által kedvencként
   * megjelölt recepteket, opcionális kommenttel együtt.
   */
  favourites: IFavourite[];

  /**
   * Recept hozzáadása a kedvencekhez.
   *
   * @param meal - Az a recept, amelyet kedvencként szeretnénk elmenteni.
   */
  addFavourite: (meal: IMeal) => void;

  /**
   * Recept eltávolítása a kedvencek közül egy azonosító alapján.
   *
   * @param mealId - A recept azonosítója, amelyet el szeretnénk távolítani.
   */
  removeFavourite: (mealId: string) => void;

  /**
   * Komment hozzáadása vagy frissítése egy kedvenc recepthez.
   *
   * @param mealId - A kedvenc recept azonosítója.
   * @param comment - A felhasználó kommentje, amelyet el szeretnénk menteni.
   */
  addCommentToFavourite: (mealId: string, comment: string) => void;

  /**
   * Annak ellenőrzése, hogy egy adott recept kedvencként szerepel-e.
   *
   * @param mealId - A vizsgált recept azonosítója.
   * @returns `true`, ha a recept szerepel a kedvencek listájában, különben `false`.
   */
  isFavourite: (mealId: string) => boolean;

  /**
   * A keresési állapot, amelyet a Kereső (Search) oldal használ.
   *
   * @remarks
   * Ebben tároljuk:
   * - a keresési mezők aktuális értékeit,
   * - az utolsó keresés találatait,
   * - a betöltés / hiba flag-eket,
   * - és azt, hogy ez-e a kezdeti állapot (`isInitial`).
   */
  searchState: ISearchState;

  /**
   * A keresési állapot frissítésére szolgáló függvény.
   *
   * @param s - A frissítendő mezők részleges objektuma.
   *
   * @remarks
   * A legtöbb implementációban a `Partial<ISearchState>`-et
   * a meglévő állapottal merge-öljük, így nem szükséges mindig
   * az összes mezőt megadni:
   *
   * ```ts
   * setSearchState({ loading: true });
   * setSearchState({ meals: data, loading: false, error: null });
   * setSearchState({ name: 'chicken' });
   * ```
   */
  setSearchState: (s: Partial<ISearchState>) => void;
}