"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ClientCardProfile, ClientTier, Order, TicketStub } from "@/lib/types";
import { useVault } from "@/components/vault/vault-context";
import { useOrders } from "@/components/cart/order-context";
import { announceCard, PROFILE_KEY } from "@/lib/ledger";

const STUBS_KEY = "army-vault-ticket-stubs";

const PLACEHOLDER: ClientCardProfile = {
  holderName: "ARMY Client",
  number: "AV-0000-0000-0000",
  code: "000000",
  issuedAt: "",
};

const MEMBERSHIP_IDS = new Set(["army-membership-kit", "army-membership-merch-pack"]);

interface ClientCardContextValue {
  profile: ClientCardProfile;
  tier: ClientTier;
  stubs: TicketStub[];
  ready: boolean;
  setHolderName: (name: string) => void;
  recordOrderTickets: (order: Order) => void;
}

const ClientCardContext = createContext<ClientCardContextValue | null>(null);

function makeNumber() {
  let body = "";
  for (let i = 0; i < 12; i++) body += Math.floor(Math.random() * 10).toString();
  return `AV-${body.slice(0, 4)}-${body.slice(4, 8)}-${body.slice(8, 12)}`;
}

function freshProfile(): ClientCardProfile {
  const number = makeNumber();
  return {
    holderName: "ARMY Client",
    number,
    code: number.replace(/-/g, "").slice(-6),
    issuedAt: new Date().toISOString(),
  };
}

function deriveTier(ownedIds: string[], orders: Order[], stubs: TicketStub[]): ClientTier {
  const privateOnStub = stubs.some((stub) => stub.privateAccessTitle);
  const privateOnOrder = orders.some((order) =>
    order.items.some((item) => item.seat?.privateAccess)
  );
  if (privateOnStub || privateOnOrder) return "private";

  const memberInVault = ownedIds.some((id) => MEMBERSHIP_IDS.has(id));
  const memberOnOrder = orders.some((order) =>
    order.items.some((item) => MEMBERSHIP_IDS.has(item.productId))
  );
  if (memberInVault || memberOnOrder) return "member";
  return "guest";
}

export function ClientCardProvider({ children }: { children: React.ReactNode }) {
  const { ownedIds } = useVault();
  const { orders } = useOrders();
  const [profile, setProfile] = useState<ClientCardProfile>(PLACEHOLDER);
  const [stubs, setStubs] = useState<TicketStub[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let next = freshProfile();
    try {
      const storedProfile = localStorage.getItem(PROFILE_KEY);
      if (storedProfile) next = JSON.parse(storedProfile);
      const storedStubs = localStorage.getItem(STUBS_KEY);
      if (storedStubs) setStubs(JSON.parse(storedStubs));
    } catch {
      next = freshProfile();
    }
    setProfile(next);
    if (next.issuedAt && next.number && next.number !== "AV-0000-0000-0000") {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
      announceCard(next.number);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded || !profile.issuedAt) return;
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STUBS_KEY, JSON.stringify(stubs));
  }, [stubs, loaded]);

  const setHolderName = useCallback((name: string) => {
    const trimmed = name.trim().slice(0, 28);
    setProfile((prev) =>
      prev ? { ...prev, holderName: trimmed || "ARMY Client" } : prev
    );
  }, []);

  const recordOrderTickets = useCallback(
    (order: Order) => {
      const cardNumber = order.clientCardNumber || profile.number;
      setStubs((prev) => {
        const known = new Set(prev.map((stub) => stub.id));
        const added: TicketStub[] = [];
        for (const item of order.items) {
          if (!item.seat) continue;
          const id = `${order.id}:${item.seat.lineId}`;
          if (known.has(id)) continue;
          known.add(id);
          added.push({
            id,
            orderId: order.id,
            concertId: item.seat.concertId,
            city: item.seat.city,
            venue: item.seat.venue,
            date: item.seat.date,
            image: item.seat.image,
            rollLabel: item.seat.rollLabel,
            sectionId: item.seat.sectionId,
            sectionLabel: item.seat.sectionLabel,
            row: item.seat.row,
            seat: item.seat.seat,
            price: item.unitPrice,
            privateAccessTitle: item.seat.privateAccess?.title,
            memberId: item.seat.privateAccess?.memberId,
            clientCardNumber: cardNumber,
          });
        }
        if (added.length === 0) return prev;
        return [...added, ...prev];
      });
    },
    [profile]
  );

  const mineOrders = useMemo(
    () => (profile.issuedAt ? orders.filter((order) => order.clientCardNumber === profile.number) : []),
    [orders, profile.issuedAt, profile.number]
  );
  const mineStubs = useMemo(
    () => (profile.issuedAt ? stubs.filter((stub) => stub.clientCardNumber === profile.number) : []),
    [stubs, profile.issuedAt, profile.number]
  );
  const tier = useMemo(
    () => deriveTier(ownedIds, mineOrders, mineStubs),
    [ownedIds, mineOrders, mineStubs]
  );

  const value = useMemo<ClientCardContextValue>(
    () => ({ profile, tier, stubs: mineStubs, ready: loaded, setHolderName, recordOrderTickets }),
    [profile, tier, mineStubs, loaded, setHolderName, recordOrderTickets]
  );

  return <ClientCardContext.Provider value={value}>{children}</ClientCardContext.Provider>;
}

export function useClientCard() {
  const ctx = useContext(ClientCardContext);
  if (!ctx) throw new Error("useClientCard must be used within ClientCardProvider");
  return ctx;
}
