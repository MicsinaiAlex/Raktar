import { useContext } from 'preact/hooks';
import { AppContext } from '../../contexts/AppContext';
import './NotFoundPage.css';

/**
 * „Nem található” (404) oldal.
 *
 * Akkor érdemes használni, amikor a felhasználó olyan útvonalra navigál,
 * amelyhez nincs definiált oldal. Egy rövid üzenetet jelenít meg,
 * és lehetőséget ad visszatérni a főoldalra.
 *
 * @returns A 404-es oldal JSX-struktúrája.
 */
export function NotFoundPage() {
  const { navigate } = useContext(AppContext);

  const handleGoHome = () => {
    navigate('#/');
  };

  return (
    <div class="not-found-page">
      <h1 class="not-found-title">Page not found</h1>
      <p class="not-found-subtitle">
        The page you are looking for does not exist or may have been moved.
      </p>
      <button onClick={handleGoHome}>Back to Home</button>
    </div>
  );
}