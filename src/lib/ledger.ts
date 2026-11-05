export const CARD_EVENT = "army-vault-card";
export const PROFILE_KEY = "army-vault-client-card";
export const CARTS_KEY = "army-vault-carts";

export function readStoredCard(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const profile = JSON.parse(raw) as { number?: string; issuedAt?: string };
    if (!profile.issuedAt || !profile.number || profile.number === "AV-0000-0000-0000") return null;
    return profile.number;
  } catch {
    return null;
  }
}

export function announceCard(number: string) {
  window.dispatchEvent(new CustomEvent<string>(CARD_EVENT, { detail: number }));
}
