import { useEffect } from 'preact/hooks';
import './Toast.css';

interface ToastProps {
  /** A megjelenítendő üzenet szövege. */
  message: string;
  /** 
   * Toast típusa – a háttérszínhez/ikonikához használjuk.
   * `success`: zöld, 
   * `error`: piros,
   * `info`: kék.
   */
  type?: 'success' | 'error' | 'info';
  /**
   * Automatikus eltűnés ideje ezredmásodpercben.
   * Ha nincs megadva vagy 0, akkor nem tűnik el magától.
   */
  duration?: number;
  /**
   * Zárás callback – pl. a szülő komponens állapotát frissíti
   * (`setToast(null)`).
   */
  onClose?: () => void;
}

/**
 * Kis, lebegő értesítés (Toast) sikeres műveletek jelzésére.
 *
 * Tipikus használat:
 * - kedvenc hozzáadása / törlése után,
 * - komment mentése után.
 */
export function Toast({
  message,
  type = 'success',
  duration = 3000,
  onClose,
}: ToastProps) {
  // Automatikus eltűnés: ha van onClose és pozitív duration,
  // akkor `duration` ms után meghívjuk az onClose-t.
  useEffect(() => {
    if (!onClose || !duration) return;

    const id = setTimeout(onClose, duration);
    return () => clearTimeout(id);
  }, [duration, onClose]);

  return (
    <div class={`toast toast-${type}`}>
      <span class="toast-message">{message}</span>

      {onClose && (
        <button
          type="button"
          class="toast-close"
          onClick={onClose}
          aria-label="Close notification"
        >
          ×
        </button>
      )}
    </div>
  );
}