"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem, CityStayHold, SeatHold, ShopMemberId } from "@/lib/types";
import { getProductById, getProductPrimaryMember } from "@/data/products";
import { getProductPrice } from "@/lib/catalog";

const STORAGE_KEY = "army-vault-cart";

interface CartContextValue {
  items: CartItem[];
  ready: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (
    productId: string,
    quantity?: number,
    selectedSize?: import("@/lib/types").ApparelSize,
    options?: { open?: boolean }
  ) => void;
  addSeat: (seat: SeatHold, options?: { open?: boolean }) => void;
  addStay: (stay: CityStayHold, options?: { open?: boolean }) => void;
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearMemberCart: (memberId: ShopMemberId | "ot7" | "box-office") => void;
  clearCart: () => void;
  itemCount: number;
  grandTotal: number;
  totalByMember: Record<string, number>;
  groupedItems: { memberId: string; label: string; items: CartItem[]; subtotal: number }[];
}

const CartContext = createContext<CartContextValue | null>(null);

const MEMBER_LABELS: Record<string, string> = {
  rm: "RM",
  jin: "Jin",
  suga: "Suga",
  jhope: "J-Hope",
  jimin: "Jimin",
  v: "V",
  jungkook: "Jungkook",
  ot7: "OT7 / Group",
  "box-office": "Box Office",
};

export function cartLineKey(item: CartItem) {
  return item.lineId ?? item.productId;
}

export function lineUnitPrice(item: CartItem) {
  if (item.seat) return item.seat.price + (item.seat.privateAccess?.price ?? 0);
  if (item.stay) return item.stay.price;
  const product = getProductById(item.productId);
  return product ? getProductPrice(product) : 0;
}

function getCartMemberKey(item: CartItem): string {
  if (item.seat || item.stay) return "box-office";
  const product = getProductById(item.productId);
  if (!product) return "ot7";
  const primary = getProductPrimaryMember(product);
  if (primary) return primary;
  if (product.members.length === 1 && product.members[0] === "ot7") return "ot7";
  return "ot7";
}

function matchesKey(item: CartItem, key: string) {
  if (item.lineId) return item.lineId === key;
  return item.productId === key;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
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

  const addToCart = useCallback(
    (
      productId: string,
      quantity = 1,
      selectedSize?: import("@/lib/types").ApparelSize,
      options?: { open?: boolean }
    ) => {
      setItems((prev) => {
        const existing = prev.find(
          (i) => i.productId === productId && i.selectedSize === selectedSize
        );
        if (existing) {
          return prev.map((i) =>
            i.productId === productId && i.selectedSize === selectedSize
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }
        return [
          ...prev,
          {
            productId,
            quantity,
            addedAt: new Date().toISOString(),
            selectedSize,
          },
        ];
      });
      if (options?.open !== false) setIsOpen(true);
    },
    []
  );

  const addSeat = useCallback((seat: SeatHold, options?: { open?: boolean }) => {
    setItems((prev) => {
      const line: CartItem = {
        productId: "vault-stadium-seat",
        quantity: 1,
        addedAt: new Date().toISOString(),
        lineId: seat.lineId,
        seat,
      };
      const index = prev.findIndex((item) => item.lineId === seat.lineId);
      if (index >= 0) {
        const next = [...prev];
        next[index] = line;
        return next;
      }
      return [...prev, line];
    });
    if (options?.open !== false) setIsOpen(true);
  }, []);

  const addStay = useCallback((stay: CityStayHold, options?: { open?: boolean }) => {
    setItems((prev) => {
      const line: CartItem = {
        productId: "vault-city-stay",
        quantity: 1,
        addedAt: new Date().toISOString(),
        lineId: stay.lineId,
        stay,
      };
      const index = prev.findIndex((item) => item.lineId === stay.lineId);
      if (index >= 0) {
        const next = [...prev];
        next[index] = line;
        return next;
      }
      return [...prev, line];
    });
    if (options?.open !== false) setIsOpen(true);
  }, []);

  const removeFromCart = useCallback((key: string) => {
    setItems((prev) => prev.filter((item) => !matchesKey(item, key)));
  }, []);

  const updateQuantity = useCallback((key: string, quantity: number) => {
    setItems((prev) => {
      if (quantity < 1) return prev.filter((item) => !matchesKey(item, key));
      return prev.map((item) => {
        if (!matchesKey(item, key) || item.seat) return item;
        return { ...item, quantity };
      });
    });
  }, []);

  const clearMemberCart = useCallback((memberId: ShopMemberId | "ot7" | "box-office") => {
    setItems((prev) => prev.filter((item) => getCartMemberKey(item) !== memberId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.setItem(STORAGE_KEY, "[]");
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const grandTotal = useMemo(
    () => items.reduce((sum, item) => sum + lineUnitPrice(item) * item.quantity, 0),
    [items]
  );

  const totalByMember = useMemo(() => {
    const totals: Record<string, number> = {};
    items.forEach((item) => {
      const key = getCartMemberKey(item);
      totals[key] = (totals[key] ?? 0) + lineUnitPrice(item) * item.quantity;
    });
    return totals;
  }, [items]);

  const groupedItems = useMemo(() => {
    const groups: Record<string, CartItem[]> = {};
    items.forEach((item) => {
      const key = getCartMemberKey(item);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    const order = ["box-office", "rm", "jin", "suga", "jhope", "jimin", "v", "jungkook", "ot7"];
    return order
      .filter((id) => groups[id]?.length)
      .map((memberId) => ({
        memberId,
        label: MEMBER_LABELS[memberId] ?? memberId,
        items: groups[memberId],
        subtotal: totalByMember[memberId] ?? 0,
      }));
  }, [items, totalByMember]);

  return (
    <CartContext.Provider
      value={{
        items,
        ready: loaded,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        toggleCart: () => setIsOpen((o) => !o),
        addToCart,
        addSeat,
        addStay,
        removeFromCart,
        updateQuantity,
        clearMemberCart,
        clearCart,
        itemCount,
        grandTotal,
        totalByMember,
        groupedItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function useCartProducts() {
  const { items } = useCart();
  return items
    .map((item) => ({ item, product: getProductById(item.productId) }))
    .filter(
      (
        entry
      ): entry is {
        item: CartItem;
        product: NonNullable<ReturnType<typeof getProductById>>;
      } => Boolean(entry.product)
    );
}
