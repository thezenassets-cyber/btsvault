/** Browser-only product photo overrides. Other visitors keep the shipped file until it is replaced in public/products. */

const KEY = "army-vault-product-images";
export const PRODUCT_PHOTOS_EVENT = "army-vault-photos";

export function shippedProductImage(slug: string) {
  return `/products/${slug}.jpg`;
}

export function readProductPhotos(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || "{}") as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as Record<string, string>;
  } catch {
    return {};
  }
}

/** Use a saved photo only for the primary shot. Gallery frames keep their own files. */
export function resolveProductPhoto(slug: string | undefined, shipped: string) {
  if (!slug || typeof window === "undefined") return shipped;
  const primary = shippedProductImage(slug);
  if (shipped && shipped !== primary) return shipped;
  const override = readProductPhotos()[slug];
  return override || shipped || primary;
}

export function saveProductPhoto(slug: string, dataUrl: string) {
  const all = readProductPhotos();
  all[slug] = dataUrl;
  localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new Event(PRODUCT_PHOTOS_EVENT));
}

export function clearProductPhoto(slug: string) {
  const all = readProductPhotos();
  delete all[slug];
  localStorage.setItem(KEY, JSON.stringify(all));
  window.dispatchEvent(new Event(PRODUCT_PHOTOS_EVENT));
}

export function fileToProductPhoto(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file"));
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 960;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not prepare that photo"));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => reject(new Error("That file is not a usable image"));
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
