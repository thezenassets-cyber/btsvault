"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Order } from "@/lib/types";

const STORAGE_KEY = "army-vault-orders";

interface OrderContextValue {
  orders: Order[];
  lastOrder: Order | null;
  ready: boolean;
  saveOrder: (order: Order) => void;
  getOrder: (id: string) => Order | undefined;
}

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setOrders(JSON.parse(stored));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
  }, [orders, loaded]);

  const saveOrder = useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev.filter((o) => o.id !== order.id)]);
  }, []);

  const getOrder = useCallback(
    (id: string) => orders.find((o) => o.id === id),
    [orders]
  );

  const value = useMemo(
    () => ({
      orders,
      lastOrder: orders[0] ?? null,
      ready: loaded,
      saveOrder,
      getOrder,
    }),
    [orders, loaded, saveOrder, getOrder]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used within OrderProvider");
  return ctx;
}
