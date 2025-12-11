import './LoadingSpinner.css';

/**
 * Egy egyszerű betöltés-jelző (spinner) komponens.
 *
 * Akkor érdemes megjeleníteni, amikor az alkalmazás éppen adatokat tölt be
 * (pl. API hívás folyamatban van), és a felhasználót tájékoztatni szeretnénk,
 * hogy várakozás zajlik.
 *
 * A vizuális megjelenést teljes mértékben a `LoadingSpinner.css` fájl határozza meg.
 *
 * @returns Egy, a betöltést jelző, stílusozott JSX elem.
 */
export function LoadingSpinner() {
  // A "loader" CSS osztály felel a tényleges animációért / stílusért.
  // A "Loading..." szöveg fallbackként szolgál, illetve segíti az
  // akadálymentességet (pl. képernyőolvasók számára).
  return <div class="loader">Loading...</div>;
}