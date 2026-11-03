"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { CatalogPhoto } from "@/components/catalog/catalog-photo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { products } from "@/data/products";
import {
  clearProductPhoto,
  fileToProductPhoto,
  readProductPhotos,
  saveProductPhoto,
} from "@/lib/product-images";

export default function AdminCatalogPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(products[0]?.slug ?? "");
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const refresh = () => setOverrides(readProductPhotos());
    refresh();
    window.addEventListener("army-vault-photos", refresh);
    return () => window.removeEventListener("army-vault-photos", refresh);
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(q) ||
        product.slug.includes(q) ||
        product.type.includes(q)
    );
  }, [query]);

  const product = visible.find((item) => item.slug === selected) ?? visible[0];

  async function onFile(file: File | undefined) {
    if (!file || !product) return;
    setBusy(true);
    setMessage("");
    try {
      const dataUrl = await fileToProductPhoto(file);
      saveProductPhoto(product.slug, dataUrl);
      setMessage("Photo saved in this browser. Grids, the product page, and the cart use it now.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save that photo");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AdminShell title="Catalog photos">
      <p className="mb-6 max-w-2xl text-sm text-cream/55">
        Every item here can be added to the cart. Choose a photo from this computer to replace the
        one shoppers see in this browser. Reset brings back the photo shipped with the site.
      </p>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="min-w-0">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, slug, or type"
          />
          <ul className="mt-4 max-h-[70vh] space-y-2 overflow-y-auto pr-1">
            {visible.map((item) => (
              <li key={item.slug}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(item.slug);
                    setMessage("");
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left ${
                    item.slug === product?.slug
                      ? "border-purple-light/50 bg-white/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-charcoal">
                    <CatalogPhoto slug={item.slug} src={item.image} alt="" fill sizes="56px" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-cream">{item.name}</span>
                    <span className="block truncate text-xs text-cream/45">
                      {item.type}
                      {overrides[item.slug] ? " · custom photo" : ""}
                      {!item.inStock ? " · sold out" : ""}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        {product && (
          <div className="h-fit rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-charcoal">
              <CatalogPhoto slug={product.slug} src={product.image} alt={product.name} fill sizes="360px" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-cream">{product.name}</h2>
            <p className="mt-1 text-xs text-cream/45">{product.slug}</p>
            <label className="mt-4 block text-sm text-cream/70">
              Replacement photo
              <input
                className="mt-2 block w-full text-sm text-cream/70 file:mr-3 file:rounded-full file:border-0 file:bg-purple-main file:px-3 file:py-2 file:text-sm file:text-cream"
                type="file"
                accept="image/*"
                disabled={busy}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  void onFile(file);
                  event.target.value = "";
                }}
              />
            </label>
            <Button
              className="mt-4"
              variant="secondary"
              size="sm"
              disabled={!overrides[product.slug] || busy}
              onClick={() => {
                clearProductPhoto(product.slug);
                setMessage("Restored the photo shipped with the site.");
              }}
            >
              Reset to shipped photo
            </Button>
            {message && <p className="mt-3 text-sm text-cream/70">{message}</p>}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
