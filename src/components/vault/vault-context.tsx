"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { CollectionItem, Condition } from "@/lib/types";
import { getProductById } from "@/data/products";

const STORAGE_KEY = "army-vault-collection";

interface VaultContextValue {
  items: CollectionItem[];
  addItem: (productId: string, condition?: Condition) => void;
  removeItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
  ownedIds: string[];
}

const VaultContext = createContext<VaultContextValue | null>(null);

export function VaultProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  const addItem = useCallback((productId: string, condition: Condition = "like-new") => {
    setItems((prev) => {
      if (prev.some((i) => i.productId === productId)) return prev;
      return [
        ...prev,
        { productId, addedAt: new Date().toISOString(), condition },
      ];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const hasItem = useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items]
  );

  const ownedIds = items.map((i) => i.productId);

  return (
    <VaultContext.Provider value={{ items, addItem, removeItem, hasItem, ownedIds }}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used within VaultProvider");
  return ctx;
}

export function useVaultProducts() {
  const { items } = useVault();
  return items
    .map((item) => ({ item, product: getProductById(item.productId) }))
    .filter((entry): entry is { item: CollectionItem; product: NonNullable<ReturnType<typeof getProductById>> } =>
      Boolean(entry.product)
    );
}
