export const TAWK_CHAT_URL = "https://tawk.to/chat/6ae762fc87dc0d3c355ec086/default";
const STORAGE_KEY = "army-vault-payment-chat";

export interface PaymentChatPayload {
  orderId: string;
  name: string;
  email: string;
  total: string;
  items: string;
}

type TawkApi = {
  maximize?: () => void;
  minimize?: () => void;
  setAttributes?: (attrs: Record<string, string>, cb?: (err: unknown) => void) => void;
  setChatInputMessage?: (message: string) => void;
  addEvent?: (name: string, meta: Record<string, string>, cb?: (err: unknown) => void) => void;
  addTags?: (tags: string[], cb?: (err: unknown) => void) => void;
  onLoad?: () => void;
  onLoaded?: () => void;
};

declare global {
  interface Window {
    Tawk_API?: TawkApi;
  }
}

export function paymentChatMessage(payload: PaymentChatPayload) {
  return [
    "ARMY Vault payment",
    `Order ${payload.orderId}`,
    payload.name,
    payload.email,
    `Total ${payload.total}`,
    payload.items,
  ]
    .filter(Boolean)
    .join("\n");
}

export function readPaymentChat(): PaymentChatPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PaymentChatPayload) : null;
  } catch {
    return null;
  }
}

/** Tucks the widget so the cart and pay button stay clickable. */
export function tuckPaymentChat() {
  if (typeof window === "undefined") return;
  window.Tawk_API?.minimize?.();
}

function pushToDesk(payload: PaymentChatPayload) {
  const api = window.Tawk_API;
  if (typeof api?.maximize !== "function") return false;
  const message = paymentChatMessage(payload);
  try {
    if (payload.email.includes("@")) {
      api.setAttributes?.({ name: payload.name || "ARMY Client", email: payload.email }, () => {});
    }
    api.addTags?.(["payment-desk"], () => {});
    api.addEvent?.(
      "payment-desk",
      {
        orderId: payload.orderId,
        total: payload.total,
        items: payload.items.slice(0, 900),
      },
      () => {}
    );
    api.setChatInputMessage?.(message);
    api.maximize();
  } catch {
    return false;
  }
  return true;
}

/** Opens the Tawk desk with this order and resolves immediately so checkout can finish. */
export function openPaymentChat(payload: PaymentChatPayload): Promise<"widget" | "tab"> {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }
  if (typeof window === "undefined") return Promise.resolve("tab");
  if (pushToDesk(payload)) return Promise.resolve("widget");

  const api = (window.Tawk_API = window.Tawk_API || {});
  const previousLoaded = api.onLoaded;
  api.onLoaded = () => {
    previousLoaded?.();
    pushToDesk(payload);
  };
  window.open(TAWK_CHAT_URL, "_blank", "noopener,noreferrer");
  return Promise.resolve("tab");
}
