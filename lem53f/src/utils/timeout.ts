/**
 * Alapértelmezett timeout érték (ezredmásodpercben) a {@link timeout} helperhez.
 *
 * Ez az az időtartam, amely után a kérés sikertelennek minősül,
 * ha a hívott aszinkron függvény addig nem fejeződik be.
 *
 * @defaultValue 5000
 */
export const REQUEST_TIMEOUT_MS = 5000;

/**
 * Egy aszinkron műveletet timeout-tal vesz körbe.
 *
 * Ha a `fn` által visszaadott Promise nem teljesül (resolve/reject)
 * a megadott `timeoutMs` időn belül, akkor a visszaadott Promise
 * egy hibával (Error) utasítja el magát.
 *
 * Fontos: ha a timeout már lejárt, a `fn` későbbi eredményét
 * (resolve/reject) szándékosan figyelmen kívül hagyjuk, így
 * elkerüljük a felesleges állapotfrissítéseket.
 *
 * @typeParam T - Az aszinkron művelet visszatérési típusa.
 *
 * @param fn - Egy függvény, amely egy Promise-ot ad vissza
 * (pl. egy API hívás: `() => fetchRandomRecipes(5)`).
 * @param timeoutMs - Timeout időtartam ezredmásodpercben.
 * Alapértelmezett értéke: {@link REQUEST_TIMEOUT_MS}.
 * @param timeoutMessage - A hibaüzenet, amely a timeout
 * bekövetkeztekor az Error példányban szerepel.
 *
 * @returns Egy Promise, amely:
 * - sikeresen teljesül, ha a `fn` a megadott időn belül lefut
 * - hibával elutasul, ha a `fn` hibát dob, vagy ha lejár a timeout
 *
 * @throws Error - Ha a timeout lejár, vagy a `fn` hibával elutasul.
 */
export function timeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number = REQUEST_TIMEOUT_MS,
  timeoutMessage = 'The request took too long.'
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    // Flag, amely jelzi, hogy a timeout már lejárt-e.
    // Erre azért van szükség, hogy ha a `fn` a timeout után fejeződik be,
    // ne próbáljuk meg többször resolve/reject-elni a Promise-ot.
    let timedOut = false;

    // Elindítunk egy időzítőt, amely `timeoutMs` után timeout hibát dob.
    const timer = setTimeout(() => {
      timedOut = true; // Jelezzük, hogy a timeout bekövetkezett.
      reject(new Error(timeoutMessage));
    }, timeoutMs);

    // Meghívjuk a kapott aszinkron függvényt.
    fn()
      .then((data) => {
        // Ha időközben már lejárt a timeout, hagyjuk figyelmen kívül az eredményt.
        if (timedOut) return;

        // Ha sikeres volt a művelet a timeout előtt, töröljük az időzítőt,
        // hogy ne dobjon később hibát.
        clearTimeout(timer);

        // A Promise-t a sikeres eredménnyel teljesítjük.
        resolve(data);
      })
      .catch((err) => {
        // Ha időközben már lejárt a timeout, a hibát is figyelmen kívül hagyjuk.
        if (timedOut) return;

        // Sikertelen befejeződés esetén is töröljük az időzítőt,
        // mert már nem lesz rá szükség.
        clearTimeout(timer);

        // A Promise-t a kapott hibával utasítjuk el.
        reject(err);
      });
  });
}