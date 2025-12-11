import './ErrorMessage.css';

/**
 * A hibát megjelenítő komponens props típusa.
 * 
 * Tartalmazza a felhasználónak megjelenítendő hibaüzenet szövegét.
 */
interface ErrorMessageProps {
  /** A megjelenítendő hibaüzenet szövege. */
  message: string;
}

/**
 * Egy egyszerű vizuális komponens, amely hibát jelenít meg a felhasználónak.
 *
 * A komponens egy rövid, kiemelt "Error:" előtagot és az átadott
 * hibaüzenetet jeleníti meg, az `ErrorMessage.css`-ben definiált
 * stílusokkal formázva.
 *
 * @param props - A komponens bemeneti paraméterei.
 * @param props.message - A megjelenítendő hibaüzenet szövege.
 * @returns Egy stílusozott hibaüzenet-blokk JSX-ben.
 */
export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    // Külső konténer, amely a hiba vizuális megjelenítéséért felel.
    // A konkrét stílusokat az `ErrorMessage.css` fájl határozza meg.
    <div class="error-message">
      {/*Kiemelt "Error:" címke, amely jelzi, hogy hibáról van szó*/}
      <strong>Error:</strong> {message}
    </div>
  );
}