import { useState, useEffect } from 'preact/hooks';
import { IFavourite, IMeal } from '../types';

/**
 * A kedvencek perzisztens tárolásához használt Local Storage kulcs.
 *
 * Ez az érték határozza meg, hogy milyen néven kerülnek elmentésre
 * a kedvenc receptek a böngésző Local Storage-ében.
 */
const FAVOURITES_KEY = 'recipeAppFavourites';

/**
 * Egyéni hook a kedvenc receptek kezelésére.
 *
 * Főbb feladatai:
 * - a kedvencek listájának kezelése (`favourites` state),
 * - a kedvencek listájának perzisztens tárolása a Local Storage-ben,
 * - függvények biztosítása a kedvencekhez adáshoz, eltávolításhoz,
 *   kommentek hozzáadásához és a kedvenc-státusz ellenőrzéséhez.
 *
 * A hook a komponensekbe importálva használható, és egy objektumot
 * ad vissza, amely tartalmazza a kedvencek aktuális listáját és az
 * ahhoz kapcsolódó műveleteket.
 *
 * @returns Egy objektum, amely tartalmazza:
 * - `favourites`: az aktuális kedvenc receptek tömbjét,
 * - `addFavourite(meal)`: recept hozzáadása a kedvencekhez,
 * - `removeFavourite(mealId)`: recept eltávolítása a kedvencek közül,
 * - `addCommentToFavourite(mealId, comment)`: komment hozzáadása egy kedvenchez,
 * - `isFavourite(mealId)`: boolean érték arról, hogy az adott recept kedvenc-e.
 */
export const useFavourites = () => {
  // A kedvencek állapotának inicializálása.
  // A useState "lazy initializer" formáját használjuk (függvényt adunk át),
  // így a Local Storage csak egyszer kerül kiolvasásra, amikor a hook először fut.
  const [favourites, setFavourites] = useState<IFavourite[]>(() => {
    try {
      const stored = localStorage.getItem(FAVOURITES_KEY);
      // Ha van elmentett adat, JSON-ként értelmezzük, különben üres tömböt adunk vissza.
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      // Ha bármilyen hiba történik (pl. JSON parse hiba),
      // logoljuk a konzolra, és üres listával indulunk.
      console.error('Error reading favourites from localStorage', error);
      return [];
    }
  });

  // Szinkronizálja a `favourites` állapotot a Local Storage-dzsel
  // valahányszor az állapot megváltozik.
  useEffect(() => {
    try {
      localStorage.setItem(FAVOURITES_KEY, JSON.stringify(favourites));
    } catch (error) {
      // Ha a Local Storage írása közben hiba történik (pl. betelt a quota),
      // a hibát logoljuk, de az alkalmazás nem áll le.
      console.error('Error writing favourites to localStorage', error);
    }
  }, [favourites]);

  /**
   * Recept hozzáadása a kedvencekhez.
   *
   * Csak akkor adja hozzá a receptet, ha az még nem szerepel a
   * kedvencek listájában (az `isFavourite` ellenőrzés alapján),
   * ezzel elkerülve a duplikátumokat.
   *
   * @param meal - A hozzáadandó recept.
   */
  const addFavourite = (meal: IMeal) => {
    // Csak akkor adjuk hozzá, ha még nem kedvenc.
    if (!isFavourite(meal.idMeal)) {
      // Az előző állapotból kiindulva új tömböt hozunk létre (immutabilitás),
      // amely tartalmazza az új kedvencet is.
      setFavourites((prev) => [...prev, meal]);
    }
  };

  /**
   * Recept eltávolítása a kedvencek közül.
   *
   * Az `idMeal` alapján kiszűri az adott receptet a kedvencek listájából.
   *
   * @param mealId - Az eltávolítandó recept azonosítója.
   */
  const removeFavourite = (mealId: string) => {
    // Az új lista az összes olyan kedvenc, amelynek az id-je
    // különbözik a megadott `mealId`-től.
    setFavourites((prev) => prev.filter((fav) => fav.idMeal !== mealId));
  };

  /**
   * Komment hozzáadása egy kedvenc recepthez.
   *
   * Megkeresi az adott `mealId`-hoz tartozó kedvencet, és
   * frissíti annak `userComment` mezőjét a kapott kommenttel.
   * Ha nincs ilyen id-jű kedvenc, a lista változatlan marad.
   *
   * @param mealId - Annak a receptnek az azonosítója, amelyhez a komment tartozik.
   * @param comment - A hozzáadandó vagy frissítendő felhasználói komment.
   */
  const addCommentToFavourite = (mealId: string, comment: string) => {
    setFavourites((prev) =>
      prev.map((fav) =>
        fav.idMeal === mealId ? { ...fav, userComment: comment } : fav
      )
    );
  };

  /**
   * Ellenőrzi, hogy egy recept ID alapján szerepel-e a kedvencekben.
   *
   * @param mealId - A keresett recept azonosítója.
   * @returns `true`, ha a recept szerepel a kedvencek között, különben `false`.
   */
  const isFavourite = (mealId: string): boolean => {
    // A `some` true-val tér vissza, ha legalább egy elemre igaz a feltétel.
    return favourites.some((fav) => fav.idMeal === mealId);
  };

  // A hook által visszaadott API: a kedvencek listája és a kezelésükhöz
  // szükséges műveletek.
  return {
    favourites,
    addFavourite,
    removeFavourite,
    addCommentToFavourite,
    isFavourite,
  };
};