import { useState, useEffect, useContext } from 'preact/hooks';
import { AppContext } from '../../contexts/AppContext';
import { IMeal } from '../../types';
import { fetchRecipeById } from '../../utils/api';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { FavouriteButton } from '../../components/FavouriteButton/FavouriteButton';
import { Toast } from '../../components/Toast/Toast';
import './RecipeDetail.css';

/**
 * A Recept részletező oldal komponens propjainak típusa.
 *
 * A router vagy szülő komponens adja át azt a `mealId`-t,
 * amelynek a részletes adatait szeretnénk megjeleníteni.
 */
interface RecipeDetailProps {
  /** A megjelenítendő recept egyedi azonosítója. */
  mealId: string;
}

/**
 * A Recept Részletező oldal komponense.
 *
 * Feladatai:
 * - a kapott `mealId` alapján lekéri egy recept részletes adatait,
 * - betöltés (loading) és hiba (error) állapotok kezelése,
 * - a recept részletes megjelenítése (kép, hozzávalók, leírás),
 * - kedvencekhez adás / eltávolítás lehetősége (`FavouriteButton`),
 * - „Back” gomb biztosítása, amely az `AppContext`-ben tárolt `goBack()`
 *   függvényt használja, így a felhasználó visszatérhet pl. a keresési
 *   találatokhoz az eredeti állapotukkal együtt.
 *
 * @param props - A komponens bemeneti paraméterei.
 * @param props.mealId - Annak a receptnek az azonosítója, amelynek a részleteit meg kell jeleníteni.
 *
 * @returns A recept részletező oldal JSX-struktúrája.
 */
export function RecipeDetail({ mealId }: RecipeDetailProps) {
  // A lekért recept részletes adatai. Kezdetben null, amíg be nem töltjük.
  const [meal, setMeal] = useState<IMeal | null>(null);

  // Betöltési állapot jelzése: amíg az API hívás tart, true.
  const [loading, setLoading] = useState(true);

  // Hibaüzenet: ha hiba történik a lekérés során, itt tároljuk a szöveget.
  const [error, setError] = useState<string | null>(null);

  // Toast üzenet és típusa
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');


  // Az alkalmazás kontextusából kivesszük a "vissza" navigációt.
  const { goBack } = useContext(AppContext);

  /**
   * Adatlekérés a `mealId` alapján.
   *
   * - komponens betöltésekor azonnal lefut,
   * - illetve újra lefut, ha a `mealId` prop megváltozik (pl. route váltás).
   */
  useEffect(() => {
    setLoading(true);

    fetchRecipeById(mealId)
      .then((data) => {
        // Sikeres lekérés esetén eltároljuk a recept adatait
        // és töröljük az esetleges korábbi hibát.
        setMeal(data);
        setError(null);
      })
      .catch((err) => {
        // Hiba esetén hibaüzenetet állítunk be,
        // és biztosítjuk, hogy a meal null legyen.
        setError(err.message);
        setMeal(null);
      })
      .finally(() => {
        // Bármi is történt (siker/hiba), a betöltés véget ér.
        setLoading(false);
      });
    // A függőség tömbben a `mealId` szerepel, így ha ugyanaz a komponens
    // új azonosítót kap (pl. másik receptre navigálunk), újra lekéri az adatokat.
  }, [mealId]);

  /**
   * Visszalépés kezelése.
   *
   * A `goBack()` az AppContext-ben definiált logika szerint léptet vissza
   * az előző nézetre (pl. Search oldalra, változatlan állapotokkal).
   */
  const handleBack = () => {
    goBack();
  };

  /**
   * Kinyeri egy `IMeal` objektumból az összes hozzávalót és mértékegységet.
   *
   * Az API válasza mezőpárokban tárolja a hozzávalókat:
   * - `strIngredient1`, `strMeasure1`
   * - `strIngredient2`, `strMeasure2`
   * - ...
   * - `strIngredient20`, `strMeasure20`
   *
   * A függvény végigiterál 1-től 20-ig, dinamikusan felépíti a mezőneveket,
   * és minden nem üres hozzávalót összefűz a hozzá tartozó mértékegységgel.
   *
   * @param m - Az a recept objektum, amelyből a hozzávalókat ki szeretnénk olvasni.
   * @returns Egy sztringtömb, ahol minden elem egy „mennyiség + hozzávaló” páros.
   */
  const getIngredients = (m: IMeal): string[] => {
    const ingredients: string[] = [];

    // Az API maximum 20 hozzávalót ad vissza; ezek indexei 1-től 20-ig terjednek.
    for (let i = 1; i <= 20; i++) {
      // Dinamikus property-név összeállítása:
      // pl. "strIngredient1", "strMeasure1", stb.
      const ingredient = m[`strIngredient${i}` as keyof IMeal] as string | undefined;
      const measure = m[`strMeasure${i}` as keyof IMeal] as string | undefined;

      // Csak azokat az összetevőket vesszük figyelembe, amelyek nem üresek.
      if (ingredient && ingredient.trim() !== '') {
        // A mértékegység opcionális; ha hiányzik, üres stringet használunk helyette.
        const measurePart = measure ? measure.trim() : '';
        ingredients.push(`${measurePart} ${ingredient.trim()}`.trim());
      }
    }

    return ingredients;
  };

  // Feltételes renderelés: betöltés, hiba vagy sikeres adatlekérés alapján.
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!meal) return <ErrorMessage message="Recipe not found." />;

  // A hozzávalók listájának előállítása a sikeresen lekért receptből.
  const ingredientsList = getIngredients(meal);

  return (
    <div class="recipe-detail-page">
      <div class="detail-header">
        {/* Vissza gomb: az AppContext `goBack` függvényével léptet vissza. */}
        <button onClick={handleBack} class="back-button">
          &larr; Back
        </button>

        {/* Kedvencekhez adás / eltávolítás gombja az aktuális recepthez. */}
        <FavouriteButton
          meal={meal}
          onToggle={(isNowFavourite) => {
            if (isNowFavourite) {
              setToastType('success');
              setToastMessage('Added to favourites.');
            } else {
              setToastType('info');
              setToastMessage('Removed from favourites.');
            }
          }}
        />
      </div>

      {/* Recept címe és képe */}
      <h1 class="detail-title">{meal.strMeal}</h1>
      <img src={meal.strMealThumb} alt={meal.strMeal} class="detail-image" />

      <div class="detail-content">
        {/* Hozzávalók listája */}
        <div class="detail-ingredients">
          <h2>Ingredients</h2>
          <ul>
            {ingredientsList.map((ing, index) => (
              <li key={index}>{ing}</li>
            ))}
          </ul>
        </div>

        {/* Elkészítési leírás */}
        <div class="detail-instructions">
          <h2>Instructions</h2>
          <p
            // Az API gyakran \r\n sortöréseket használ.
            // Ezeket HTML <br /> tagekre cseréljük, hogy szépen jelenjenek meg.
            dangerouslySetInnerHTML={{
              __html: meal.strInstructions.replace(/\r\n/g, '<br />'),
            }}
          ></p>
        </div>
      </div>
      {toastMessage && (
        <Toast
          message={toastMessage}
          type={toastType}
          duration={3000}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}