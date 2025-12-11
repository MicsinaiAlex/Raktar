import { useContext, useState } from 'preact/hooks';
import { AppContext } from '../../contexts/AppContext';
import { IFavourite } from '../../types';
import { Toast } from '../../components/Toast/Toast';
import './Favourites.css';

/**
 * A Kedvencek (Favourites) oldal komponense.
 *
 * Feladatai:
 * - a felhasználó által elmentett kedvenc receptek megjelenítése,
 * - receptek eltávolítása a kedvencek közül,
 * - felhasználói kommentek hozzáadása és szerkesztése kedvenc receptekhez,
 * - navigáció a recept részletező oldalára egy kedvenc kiválasztásakor.
 *
 * Az adatokat és a műveleteket az `AppContext` biztosítja:
 * - `favourites`: a kedvencek listája,
 * - `removeFavourite`: kedvenc törlése,
 * - `addCommentToFavourite`: komment mentése egy kedvenchez,
 * - `navigate`: útvonal váltása (részletező oldalra lépés).
 *
 * @returns A Kedvencek oldal JSX-struktúrája.
 */
export function Favourites() {
  // A globális alkalmazás kontextusból kivesszük a kedvencek listáját
  // és a kezelésükhöz szükséges műveleteket, valamint a navigációs függvényt.
  const { favourites, removeFavourite, addCommentToFavourite, navigate } =
    useContext(AppContext);

  // Lokális állapot a komment űrlapok kezelésére:
  // - `editingComment`: annak a kedvencnek az ID-ja, amelynek a kommentjét
  //   éppen szerkesztjük, vagy `null`, ha éppen egyiket sem.
  const [editingComment, setEditingComment] = useState<string | null>(null);

  // - `commentText`: az aktuálisan szerkesztett komment szövege a textarea-ban.
  const [commentText, setCommentText] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  /**
   * Elmenti a kommentet a megfelelő recepthez.
   *
   * A művelet lépései:
   * - megakadályozza az űrlap alapértelmezett beküldési viselkedését,
   * - ha a komment nem üres (trim után), elmenti azt a kontextusban
   *   (`addCommentToFavourite`),
   * - majd bezárja a szerkesztő űrlapot és törli a lokális komment szöveget.
   *
   * @param e - Az űrlap beküldéséhez tartozó esemény.
   * @param mealId - Annak a kedvenc receptnek az ID-ja, amelyhez a komment tartozik.
   */
  const handleCommentSubmit = (e: Event, mealId: string) => {
    e.preventDefault();

    // Üres vagy csak szóközökből álló kommentet nem mentünk el.
    if (commentText.trim()) {
      addCommentToFavourite(mealId, commentText);

      // Sikeres mentés után bezárjuk a szerkesztő űrlapot…
      setEditingComment(null);

      // …és ürítjük a komment szöveget, hogy a következő szerkesztés tiszta mezővel induljon.
      setCommentText('');

      // Visszajelzés komment mentésekor.
      setToastMessage('Comment saved.');
    }
  };

  /**
   * Előkészíti a komment űrlapot egy adott kedvenchez.
   *
   * Beállítja:
   * - melyik kedvencet szerkesztjük (`editingComment`),
   * - a szerkesztő mező kezdeti értékét (`commentText`), ha volt már korábbi komment.
   *
   * @param fav - Az a kedvenc recept, amelynek a kommentjét szerkeszteni szeretnénk.
   */
  const handleStartEdit = (fav: IFavourite) => {
    // Ezzel jelezzük, hogy ennél az ID-nél szeretnénk a komment űrlapot megjeleníteni.
    setEditingComment(fav.idMeal);

    // Ha már létezett komment, azt előtöltjük a textarea-ba, különben üres mezőt adunk.
    setCommentText(fav.userComment || '');
  };

  const handleRemoveFavourite = (mealId: string) => {
    removeFavourite(mealId);
    setToastMessage('Removed from favourites.');
  };

  // Ha még nincs egyetlen kedvenc sem, egyszerű üzenetet jelenítünk meg a felhasználónak.
  if (favourites.length === 0) {
    return (
      <div class="favourites-page">
        <h2>My Favourites</h2>
        <p>You haven't saved any favourites yet.</p>

        {toastMessage && (
          <Toast
            message={toastMessage}
            type="success"
            duration={3000}
            onClose={() => setToastMessage(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div class="favourites-page">
      <h2>My Favourites</h2>
      <div class="favourites-list">
        {favourites.map((fav) => (
          <div key={fav.idMeal} class="favourite-card">
            {/* A kép kattintható; a recept részletező oldalára navigál. */}
            <img
              src={fav.strMealThumb}
              alt={fav.strMeal}
              class="favourite-img"
              onClick={() => navigate(`#/recipe/${fav.idMeal}`)}
            />

            <div class="favourite-content">
              {/* A recept neve is kattintható, ugyanúgy a részletezőre visz. */}
              <h3 onClick={() => navigate(`#/recipe/${fav.idMeal}`)}>
                {fav.strMeal}
              </h3>

              {/* Meglévő komment megjelenítése (csak ha van, és épp nem szerkesztjük). */}
              {fav.userComment && editingComment !== fav.idMeal && (
                <p class="comment-display">
                  <strong>Your comment:</strong> {fav.userComment}
                </p>
              )}

              {/* Komment űrlap megjelenítése, ha épp ezt a kedvencet szerkesztjük. */}
              {editingComment === fav.idMeal ? (
                <form
                  class="comment-form"
                  onSubmit={(e) => handleCommentSubmit(e, fav.idMeal)}
                >
                  <textarea
                    value={commentText}
                    // A textarea tartalmát a `commentText` lokális állapotban tartjuk.
                    onInput={(e) =>
                      setCommentText((e.target as HTMLTextAreaElement).value)
                    }
                    placeholder="Add your comment..."
                  />
                  <div class="comment-actions">
                    {/* Mentés: az űrlap submitja a handleCommentSubmit-et hívja. */}
                    <button type="submit">Save Comment</button>

                    {/* Mégse: bezárja a szerkesztő űrlapot, de nem módosít a kontextuson. */}
                    <button type="button" onClick={() => setEditingComment(null)}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                // Ha éppen nem szerkesztjük ezt a kedvencet, az akciógombokat mutatjuk.
                <div class="favourite-actions">
                  {/* Komment hozzáadása vagy szerkesztése (ha már létezett komment). */}
                  <button onClick={() => handleStartEdit(fav)}>
                    {fav.userComment ? 'Edit Comment' : 'Add Comment'}
                  </button>

                  {/* Kedvenc eltávolítása a listából. */}
                  <button
                    class="remove-btn"
                    onClick={() => handleRemoveFavourite(fav.idMeal)}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          duration={3000}
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}