import './SearchForm.css';

/**
 * A kereső űrlaphoz tartozó props típusa.
 *
 * A komponens kontrollált mezőket használ, ezért minden bemeneti mező
 * aktuális értékét (`name`, `ingredient`, `area`) és az azokhoz tartozó
 * változtató függvényeket is kívülről kapja.
 * Emellett kap egy `onSearch` callbacket, amelyet az űrlap beküldésekor
 * hív meg az aktuális keresési paraméterekkel.
 */
interface SearchFormProps {
  /** A "Recipe Name" szövegmező aktuális értéke. */
  name: string;
  /** A "Main Ingredient" szövegmező aktuális értéke. */
  ingredient: string;
  /** Az "Area (Origin)" szövegmező aktuális értéke. */
  area: string;

  /** A "Recipe Name" mező értékének módosítására szolgáló callback. */
  onNameChange: (v: string) => void;
  /** A "Main Ingredient" mező értékének módosítására szolgáló callback. */
  onIngredientChange: (v: string) => void;
  /** Az "Area (Origin)" mező értékének módosítására szolgáló callback. */
  onAreaChange: (v: string) => void;

  /**
   * Callback, amelyet az űrlap beküldésekor hívunk meg.
   * Az aktuális mezőértékeket egy objektumban kapja meg.
   */
  onSearch: (params: { name: string; ingredient: string; area: string }) => void;
}

/**
 * Kereső űrlap komponens receptek szűréséhez.
 *
 * Három szövegmezőt tartalmaz:
 * - Recipe Name
 * - Main Ingredient
 * - Area (Origin)
 *
 * A komponens teljesen kontrollált:
 * - a mezők értékei propokként érkeznek (`name`, `ingredient`, `area`),
 * - minden változást callbackeken keresztül jelez vissza
 *   (`onNameChange`, `onIngredientChange`, `onAreaChange`).
 *
 * Az űrlap beküldésekor meghívja az `onSearch` callbacket az aktuális
 * keresési paraméterekkel.
 *
 * @param props - A komponens bemeneti paraméterei.
 * @param props.name - A "Recipe Name" mező aktuális értéke.
 * @param props.ingredient - A "Main Ingredient" mező aktuális értéke.
 * @param props.area - Az "Area (Origin)" mező aktuális értéke.
 * @param props.onNameChange - Callback a név mező értékének frissítésére.
 * @param props.onIngredientChange - Callback az alapanyag mező frissítésére.
 * @param props.onAreaChange - Callback a terület/eredet mező frissítésére.
 * @param props.onSearch - Callback, amely az űrlap beküldésekor fut le,
 *   és megkapja az aktuális keresési paramétereket.
 *
 * @returns A kereső űrlap JSX-eleme.
 */
export function SearchForm({
  name,
  ingredient,
  area,
  onNameChange,
  onIngredientChange,
  onAreaChange,
  onSearch,
}: SearchFormProps) {
  /**
   * Az űrlap beküldésének kezelése.
   *
   * - megakadályozza az alapértelmezett böngésző viselkedést (`e.preventDefault()`),
   * - majd meghívja az `onSearch` callbacket az aktuális mezőértékekkel.
   */
  const handleSubmit = (e: Event) => {
    e.preventDefault();
    onSearch({ name, ingredient, area });
  };

  return (
    <form class="search-form" onSubmit={handleSubmit}>
      {/* Recipe Name mező */}
      <div class="form-group">
        <label for="name">Recipe Name</label>
        <input
          type="text"
          id="name"
          value={name}
          // onInput eseménykezelő:
          // - az esemény targetjét HTMLInputElementre cast-oljuk,
          // - majd annak value-ját adjuk át a külső állapotkezelőnek.
          onInput={(e) => onNameChange((e.target as HTMLInputElement).value)}
        />
      </div>

      {/* Main Ingredient mező */}
      <div class="form-group">
        <label for="ingredient">Main Ingredient</label>
        <input
          type="text"
          id="ingredient"
          value={ingredient}
          onInput={(e) => onIngredientChange((e.target as HTMLInputElement).value)}
        />
      </div>

      {/* Area (Origin) mező */}
      <div class="form-group">
        <label for="area">Area (Origin)</label>
        <input
          type="text"
          id="area"
          value={area}
          onInput={(e) => onAreaChange((e.target as HTMLInputElement).value)}
        />
      </div>

      {/* Beküldés gomb, amely az `onSubmit` eseményen keresztül
          végül a `handleSubmit` függvényt hívja meg. */}
      <button type="submit" class="search-button">
        Search
      </button>
    </form>
  );
}