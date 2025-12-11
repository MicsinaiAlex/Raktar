import { useContext } from 'preact/hooks';
import { AppContext } from '../../contexts/AppContext';
import { IMeal } from '../../types';
import './FavouriteButton.css';

/**
 * A kedvencek gombhoz tartozó propok típusa.
 *
 * Egyetlen meal objektumot vár, amelyet a felhasználó
 * hozzáadhat vagy eltávolíthat a kedvencek közül.
 */
interface FavouriteButtonProps {
  /** Az a recept (meal), amelyre a kedvencek státuszt kezeljük. */
  meal: IMeal;

  /**
   * Opcionális callback, amelyet akkor hívunk meg, amikor a kedvenc státusz
   * megváltozik.
   *
   * @param isNowFavourite - true, ha a gomb megnyomása után kedvenc lett,
   *                         false, ha kedvencek közül került ki.
   */
  onToggle?: (isNowFavourite: boolean) => void;
}

/**
 * Egy gombkomponens, amellyel a felhasználó egy receptet
 * hozzáadhat vagy eltávolíthat a kedvencek listájából.
 *
 * A komponens a `AppContext`-et használja arra, hogy:
 * - ellenőrizze, hogy a kapott `meal` már kedvenc-e
 * - meghívja a kedvencekhez adó / kedvencekből eltávolító függvényeket
 *
 * A gomb szövege és CSS osztálya dinamikusan változik aszerint,
 * hogy a recept jelenleg kedvenc-e vagy sem.
 *
 * @param props - A komponens bemeneti paraméterei.
 * @param props.meal - Az adott recept, amelynek a kedvencek státuszát kezeljük.
 * @returns Egy gomb JSX eleme, amely a kedvencekhez adást / eltávolítást kezeli.
 */
export function FavouriteButton({ meal, onToggle }: FavouriteButtonProps) {
  // A globális AppContext-ből kivesszük a kedvencek kezeléséhez szükséges függvényeket.
  const { isFavourite, addFavourite, removeFavourite } = useContext(AppContext);

  // Megnézzük, hogy az aktuális recept már szerepel-e a kedvencek között.
  const isFav = isFavourite(meal.idMeal);

  /**
   * Kattintáskezelő:
   * - ha a recept már kedvenc (`isFav === true`), akkor eltávolítjuk
   * - ha még nem kedvenc, akkor hozzáadjuk a kedvencek listájához
   */
  const handleClick = () => {
    if (isFav) {
      // Már kedvenc -> eltávolítjuk
      removeFavourite(meal.idMeal);
      onToggle?.(false); // jelzés a szülőnek: mostantól NEM kedvenc
    } else {
      // Még nem kedvenc -> hozzáadjuk
      addFavourite(meal);
      onToggle?.(true); // jelzés a szülőnek: mostantól kedvenc
    }
  };

  return (
    <button
      onClick={handleClick}
      // Dinamikus CSS osztály:
      // - "add": ha még nem kedvenc
      // - "remove": ha már kedvenc
      class={`favourite-button ${isFav ? 'remove' : 'add'}`}
    >
      {/* A gomb felirata is a kedvencek státusz alapján változik */}
      {isFav ? 'Remove From Favourites' : 'Add To Favourites'}
    </button>
  );
}