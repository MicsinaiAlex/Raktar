import { IMeal } from '../../types';
import { RecipeCard } from '../RecipeCard/RecipeCard';
import './RecipeList.css';

/**
 * A receptlista megjelenítéséhez szükséges propok típusa.
 *
 * A komponens egy tömbnyi receptet (`IMeal[]`) kap,
 * amelyet kártyák formájában jelenít meg.
 */
interface RecipeListProps {
  /** A megjelenítendő receptek listája. */
  meals: IMeal[];
}

/**
 * Több receptet megjelenítő lista komponens.
 *
 * Viselkedés:
 * - ha nincs egyetlen recept sem a listában, egy "No recipes found." üzenetet jelenít meg,
 * - ha vannak receptek, mindegyiket egy-egy `RecipeCard` komponenssel jeleníti meg.
 *
 * @param props - A komponens bemeneti paraméterei.
 * @param props.meals - A megjelenítendő receptek tömbje.
 *
 * @returns Egy JSX elem, amely vagy üzenetet, vagy receptkártyák listáját tartalmazza.
 */
export function RecipeList({ meals }: RecipeListProps) {
  // Üres lista esetén nem érdemes üres konténert megjeleníteni,
  // inkább egy felhasználóbarát üzenetet mutatunk.
  if (meals.length === 0) {
    return <p>No recipes found.</p>;
  }

  return (
    // A receptek konténere; a konkrét elrendezést (grid, flex, stb.)
    // a `RecipeList.css` határozza meg.
    <div class="recipe-list">
      {meals.map((meal) => (
        // Minden recepthez egy `RecipeCard`-ot renderelünk.
        // A `key` prop az egyedi azonosító (idMeal), ami segít a listák
        // hatékony renderelésében.
        <RecipeCard key={meal.idMeal} meal={meal} />
      ))}
    </div>
  );
}