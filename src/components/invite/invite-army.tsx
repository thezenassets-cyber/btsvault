"use client";

import { useCallback, useEffect, useState } from "react";
import { Users, Check, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CODE_KEY = "army-vault-invite-code";
const COUNT_KEY = "army-vault-invite-count";

function ensureCode() {
  if (typeof window === "undefined") return "army-guest";
  let code = localStorage.getItem(CODE_KEY);
  if (!code) {
    code = `army-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(CODE_KEY, code);
  }
  return code;
}

export function useInviteArmy() {
  const [code, setCode] = useState("army-guest");
  const [invited, setInvited] = useState(0);

  useEffect(() => {
    setCode(ensureCode());
    setInvited(Number(localStorage.getItem(COUNT_KEY) || "0"));
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref && ref.startsWith("army-") && ref !== localStorage.getItem(CODE_KEY)) {
      const seen = sessionStorage.getItem("army-ref-seen");
      if (!seen) {
        sessionStorage.setItem("army-ref-seen", ref);
        const next = Number(localStorage.getItem(COUNT_KEY) || "0") + 1;
        localStorage.setItem(COUNT_KEY, String(next));
        setInvited(next);
      }
    }
  }, []);

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?ref=${code}`
      : `/?ref=${code}`;

  const message = `ARMY — come shop the Vault with me. Member boutiques, ARIRANG drops, and more: ${inviteUrl}`;

  const share = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "ARMY Vault", text: message, url: inviteUrl });
        return "shared";
      } catch {
        /* fall through */
      }
    }
    await navigator.clipboard.writeText(message);
    const next = Number(localStorage.getItem(COUNT_KEY) || "0") + 1;
    localStorage.setItem(COUNT_KEY, String(next));
    setInvited(next);
    return "copied";
  }, [inviteUrl, message]);

  return { code, invited, inviteUrl, message, share };
}

export function InviteArmyButton({
  className,
  size = "sm",
  label = "Bring an ARMY",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}) {
  const { invited, share } = useInviteArmy();
  const [state, setState] = useState<"idle" | "copied" | "shared">("idle");

  return (
    <Button
      size={size}
      variant="outline"
      className={cn("gap-2", className)}
      onClick={async () => {
        const result = await share();
        setState(result === "shared" ? "shared" : "copied");
        setTimeout(() => setState("idle"), 2000);
      }}
    >
      {state === "idle" ? (
        <>
          <Users className="h-4 w-4" />
          {label}
          {invited > 0 && (
            <span className="rounded-full bg-purple-main/40 px-1.5 text-[10px]">{invited}</span>
          )}
        </>
      ) : state === "shared" ? (
        <>
          <Share2 className="h-4 w-4" /> Shared
        </>
      ) : (
        <>
          <Check className="h-4 w-4" />
          <Copy className="h-3 w-3" /> Link copied
        </>
      )}
    </Button>
  );
}

export function InviteArmyBanner() {
  const { invited } = useInviteArmy();
  return (
    <section className="relative overflow-hidden rounded-3xl border border-purple-light/25 bg-gradient-to-r from-purple-deep/50 via-charcoal-soft to-charcoal-soft p-8">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-purple-glow/20 blur-3xl" />
      <p className="text-xs font-semibold tracking-[0.2em] text-purple-glow uppercase">
        Flood the timeline
      </p>
      <h2 className="mt-2 font-display text-2xl font-bold text-cream sm:text-3xl">
        Bring an ARMY. Complete the set together.
      </h2>
      <p className="mt-2 max-w-xl text-sm text-cream/55">
        Share your invite link — friends land in the Vault ready to shop member boutiques, ARIRANG
        drops, and Light Stick Ver.4. {invited > 0 ? `${invited} ARMY already joined via your link.` : "Be the first spark."}
      </p>
      <div className="mt-6">
        <InviteArmyButton size="lg" />
      </div>
    </section>
  );
}
