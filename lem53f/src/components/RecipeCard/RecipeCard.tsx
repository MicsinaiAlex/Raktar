import { useContext } from 'preact/hooks';
import { AppContext } from '../../contexts/AppContext';
import { IMeal } from '../../types';
import './RecipeCard.css';

/**
 * Egyetlen receptkártya megjelenítéséhez szükséges propok típusa.
 *
 * A komponens egy recept (meal) alapvető adatait jeleníti meg (kép, név),
 * és kattintásra a recept részletező oldalára navigál.
 */
interface RecipeCardProps {
  /** Az a recept, amelynek az adatait a kártya megjeleníti. */
  meal: IMeal;
}

/**
 * Egy receptet megjelenítő kártyakomponens.
 *
 * A kártya:
 * - megjeleníti a recept képét és nevét,
 * - kattintásra az adott recept részletező oldalára navigál
 *   a `AppContext`-ből származó `navigate` függvény segítségével.
 *
 * @param props - A komponens bemeneti paraméterei.
 * @param props.meal - Az a recept, amelyet a kártya megjelenít és
 *   amelynek részletező oldalára kattintáskor navigálunk.
 *
 * @returns Egy kattintható receptkártya JSX-eleme.
 */
export function RecipeCard({ meal }: RecipeCardProps) {
  // Az alkalmazás kontextusából lekérjük a `navigate` függvényt,
  // amellyel kliens oldali útvonalváltást tudunk végezni.
  const { navigate } = useContext(AppContext);

  /**
   * Kattintáskezelő:
   * - az adott recept azonosítója (`meal.idMeal`) alapján
   *   felépíti az útvonalat,
   * - majd a `navigate` függvénnyel a recept részletező nézetére
   *   irányítja a felhasználót.
   */
  const handleClick = () => {
    navigate(`#/recipe/${meal.idMeal}`);
  };

  return (
    // A teljes kártyát kattinthatóvá tesszük, így a felhasználó
    // bárhová kattint a kártyán, a részletező oldalra jut.
    <div class="recipe-card" onClick={handleClick}>
      {/* Recept képének megjelenítése */}
      <img
        src={meal.strMealThumb}
        alt={meal.strMeal}
        class="recipe-card-img"
      />

      {/* Recept nevének megjelenítése */}
      <h3 class="recipe-card-title">{meal.strMeal}</h3>
    </div>
  );
}