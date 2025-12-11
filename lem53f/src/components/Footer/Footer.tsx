import './Footer.css';

/**
 * Az alkalmazás alsó lábléc (Footer) komponense.
 *
 * Egy rövid információs szöveget jelenít meg az oldal alján,
 * az aktuális évvel kiegészítve.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer class="app-footer">
      <p class="footer-text">
        © {year} Recipe App, Created by Alex Micsinai.
      </p>
    </footer>
  );
}