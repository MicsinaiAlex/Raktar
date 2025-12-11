import { IMeal } from '../types';

// Az API alap URL-je (v1/1-es kulcs nélküli publikus endpoint).
const API_BASE = 'https://www.themealdb.com/api/json/v1/1/';

/**
 * Az API válaszok egységes feldolgozásáért felelős segédfüggvény.
 *
 * Ellenőrzi, hogy a HTTP-válasz sikeres volt-e (`response.ok`),
 * majd beolvassa és értelmezi a JSON-t, és visszaadja belőle a
 * `meals` tömböt. Ha az API `meals: null`-lal tér vissza (nincs találat),
 * akkor üres tömböt ad.
 *
 * @param response - A `fetch` hívásból kapott `Response` objektum.
 * @returns A feldolgozott `meals` tömb (`IMeal[]`), vagy üres tömb, ha nincs találat.
 * @throws {Error} Ha a HTTP-válasz nem OK (pl. 4xx/5xx hiba).
 */
const handleResponse = async (response: Response): Promise<IMeal[]> => {
  // HTTP-szintű hibaellenőrzés (pl. 404, 500 stb.)
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  // JSON törzs beolvasása
  const data = await response.json();

  // A MealDB API `null`-t ad vissza `meals` helyett, ha nincs találat.
  if (data.meals === null) {
    return [];
  }

  return data.meals;
};

/**
 * Véletlenszerű receptek lekérése a MealDB API-ból.
 *
 * @remarks
 * A MealDB `random.php` végpontja egyszerre csak **egy** véletlen receptet ad vissza,
 * ezért ha több receptre van szükségünk, több párhuzamos kérést indítunk.
 *
 * A függvény:
 * - `count` darab `fetch` hívást készít elő a `random.php` végpontra,
 * - `Promise.all`-lal megvárja az összes választ,
 * - majd a kapott tömbök tömbjét egyetlen tömbbé lapítja (`flat()`).
 *
 * @param count - Hány véletlenszerű receptet kérjen le.
 * @returns Egy Promise, amely egy `IMeal[]` tömbbel teljesül (véletlen receptek listája).
 * @throws {Error} Ha bármelyik API hívás HTTP hibával tér vissza.
 */
export const fetchRandomRecipes = async (count: number): Promise<IMeal[]> => {
  const promises: Promise<IMeal[]>[] = [];

  // Az API csak egy véletlen receptet tud visszaadni egyszerre,
  // ezért `count` darab párhuzamos hívást készítünk elő.
  for (let i = 0; i < count; i++) {
    promises.push(
      fetch(`${API_BASE}random.php`).then(handleResponse) // fetch API használata, majd egységes feldolgozás
    );
  }

  // Várjuk meg, míg az összes párhuzamos hívás lefut.
  const results = await Promise.all(promises);

  // A 'results' egy `IMeal[][]` (tömbök tömbje),
  // mert minden random hívás önmagában is egy tömböt ad vissza.
  // A `flat()` segítségével egyetlen sík tömbbé alakítjuk.
  return results.flat();
};

/**
 * Recept lekérése azonosító (ID) alapján.
 *
 * A MealDB `lookup.php?i=...` végpontját hívja meg, majd:
 * - ha talál receptet, visszaadja az első (és egyetlen) elemet,
 * - ha nincs találat, hibát dob.
 *
 * @param id - A lekérni kívánt recept egyedi azonosítója (`idMeal`).
 * @returns Egy Promise, amely egyetlen `IMeal` objektummal teljesül.
 * @throws {Error} Ha nincs recept a megadott ID-val, vagy ha a HTTP kérés hibás.
 */
export const fetchRecipeById = async (id: string): Promise<IMeal> => {
  const results = await fetch(
    `${API_BASE}lookup.php?i=${id}`
  ).then(handleResponse);

  // Ha a tömb üres, akkor nincs ilyen ID-jű recept az API-ban.
  if (results.length === 0) {
    throw new Error(`Recipe with ID ${id} not found.`);
  }

  // A `lookup.php` pontosan egy receptet ad vissza, ezért az első elemet vesszük.
  return results[0];
};

/**
 * Receptek keresése a megadott kritériumok alapján.
 *
 * Támogatott keresési paraméterek:
 * - név (`name`),
 * - összetevő (`ingredient`),
 * - terület/eredet (`area`).
 *
 * @remarks
 * A MealDB API egyszerre csak **egy szűrőt** engedélyez,
 * ezért prioritási sorrendet alkalmazunk:
 * 1. név (`name`)
 * 2. összetevő (`ingredient`)
 * 3. terület (`area`)
 *
 * Ha összetevőre vagy területre keresünk, a `filter.php` végpont csak
 * „light” objektumokat ad vissza (id, név, kép), ezért:
 * - először a `filter.php`-vel lekérjük a listát,
 * - majd minden találatra külön `fetchRecipeById` hívással betöltjük a teljes adatot.
 *
 * Ha minden paraméter üres, fallback-ként véletlenszerű recepteket ad vissza.
 *
 * @param params - Keresési paraméterek:
 *  - `name`: keresés név alapján,
 *  - `ingredient`: keresés fő összetevő alapján,
 *  - `area`: keresés terület/eredet alapján.
 * @returns Egy Promise, amely az adott feltételeknek megfelelő receptek tömbjével (`IMeal[]`) teljesül.
 * @throws {Error} Ha a háttérben használt API hívások (search/filter/lookup) valamelyike hibás.
 */
export const searchRecipes = async (params: {
  name: string;
  ingredient: string;
  area: string;
}): Promise<IMeal[]> => {
  let url = '';

  // Az API csak egy szűrőt engedélyez egyszerre.
  // Prioritási sorrend: Név > Összetevő > Terület
  if (params.name) {
    // Keresés név szerint – ez már a teljes receptobjektumot visszaadja.
    url = `${API_BASE}search.php?s=${params.name}`;
  } else if (params.ingredient) {
    // Szűrés fő összetevő alapján – „light” result (id, név, kép).
    url = `${API_BASE}filter.php?i=${params.ingredient}`;
  } else if (params.area) {
    // Szűrés terület/eredet alapján – szintén „light” result.
    url = `${API_BASE}filter.php?a=${params.area}`;
  } else {
    // Ha valamilyen okból minden paraméter üres,
    // visszaadunk néhány véletlen receptet fallbackként.
    return fetchRandomRecipes(9);
  }

  // Alap lekérés az adott URL-re.
  const results = await fetch(url).then(handleResponse);

  // A 'filter' végpontok (összetevő, terület) csak egy „light” objektumot adnak vissza
  // (név, kép, id). Ahhoz, hogy a részletező oldal működjön (hozzávalók, leírás stb.),
  // szükség van a teljes receptobjektumra, ezért minden elemhez külön ID-alapú lekérést indítunk.
  if (params.ingredient || params.area) {
    const fullMeals = await Promise.all(
      results.map((lightMeal) => fetchRecipeById(lightMeal.idMeal))
    );
    return fullMeals;
  }

  // A 'search.php' (név alapú keresés) már a teljes adatot visszaadja,
  // ezért további feldolgozás nélkül visszaadhatjuk az eredményt.
  return results;
};