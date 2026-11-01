"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Trophy, Users } from "lucide-react";
import { useVault, useVaultProducts } from "@/components/vault/vault-context";
import { eras } from "@/data/eras";
import { shopMembers } from "@/data/members";
import { getEraCompletion, getMemberCompletion } from "@/lib/catalog";
import { cn, formatDate, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getEraName } from "@/data/eras";
import type { ShopMemberId } from "@/lib/types";
import { ClientCard } from "@/components/client-card/client-card";
import { useClientCard } from "@/components/client-card/client-card-context";
import { admitCode } from "@/data/seating";

type VaultTab = "collection" | "era" | "member";

export default function VaultPage() {
  const { items, removeItem, ownedIds } = useVault();
  const vaultProducts = useVaultProducts();
  const { stubs } = useClientCard();
  const [tab, setTab] = useState<VaultTab>("collection");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cream sm:text-4xl">My Vault</h1>
          <p className="mt-2 text-cream/50">
            Your Client Card, ticket stubs, and the merch you have collected — {items.length} item
            {items.length !== 1 ? "s" : ""}.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/members">
            <Button variant="secondary">
              <Users className="h-4 w-4" /> Member Shops
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="outline">
              <Plus className="h-4 w-4" /> Add Items
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr] lg:items-start">
        <ClientCard size="full" editable />
        <div>
          <h2 className="font-display text-xl font-bold text-cream">Ticket stubs</h2>
          <p className="mt-1 text-sm text-cream/50">
            Seats you have checked out stay on this card.
          </p>
          {stubs.length === 0 ? (
            <p className="mt-4 text-sm text-cream/40">
              No seats yet.{" "}
              <Link href="/box-office" className="text-purple-glow hover:text-cream">
                Open the box office
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {stubs.map((stub) => (
                <li key={stub.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-bold text-cream">{stub.city}</p>
                      <p className="text-xs text-cream/50">
                        {formatDate(stub.date)} · {stub.venue}
                      </p>
                      {stub.sectionId && (
                        <p className="mt-2 font-mono text-[11px] text-gold">
                          {admitCode(stub.concertId, stub.sectionId, stub.row, stub.seat)}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-cream/80">
                        {stub.sectionId ? `${stub.sectionId} ` : ""}
                        {stub.rollLabel} · {stub.sectionLabel} · Row {stub.row} · Seat {stub.seat}
                      </p>
                      {stub.privateAccessTitle && (
                        <p className="mt-1 text-xs text-gold">
                          {stub.privateAccessTitle}
                          {stub.memberId ? ` · ${stub.memberId.toUpperCase()}` : ""}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-[10px] tracking-wider text-cream/40">{stub.clientCardNumber}</p>
                      <Link
                        href={`/tickets/${encodeURIComponent(stub.id)}`}
                        className="mt-3 inline-block text-xs font-semibold text-purple-glow hover:text-cream"
                      >
                        Download ticket
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {(
          [
            { id: "collection" as const, label: "My Items" },
            { id: "era" as const, label: "By Era" },
            { id: "member" as const, label: "By Member" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              tab === t.id
                ? "bg-purple-main text-white"
                : "bg-white/5 text-cream/60 hover:text-cream"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "era" && (
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-gold" />
            <h2 className="text-xl font-semibold text-cream">Era Completion</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {eras
              .filter((e) => getEraCompletion(ownedIds, e.id).total > 0)
              .map((era) => {
                const completion = getEraCompletion(ownedIds, era.id);
                return (
                  <div key={era.id} className="rounded-2xl glass p-5">
                    <div className={`mb-3 h-1 rounded-full ${era.stripClass}`} />
                    <p className="text-sm font-medium text-cream">{era.name}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-2xl font-bold text-purple-glow">
                        {completion.percentage}%
                      </span>
                      <span className="text-xs text-cream/40">
                        {completion.owned}/{completion.total}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-purple-main"
                        style={{ width: `${completion.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
          {items.length === 0 && (
            <p className="text-sm text-cream/40">Add items to your vault to track era completion.</p>
          )}
        </section>
      )}

      {tab === "member" && (
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-glow" />
            <h2 className="text-xl font-semibold text-cream">Member Completion</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shopMembers.map((member) => {
              const completion = getMemberCompletion(ownedIds, member.id as ShopMemberId);
              return (
                <div
                  key={member.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full">
                      <Image
                        src={member.portraitImage}
                        alt={member.stageName}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-cream">{member.stageName}</p>
                      <p className="text-xs text-cream/40">
                        {completion.owned}/{completion.total} owned
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xl font-bold text-purple-glow">
                      {completion.percentage}%
                    </span>
                    <Link href={`/members/${member.id}`}>
                      <Button size="sm" variant="outline">
                        Shop missing
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${completion.percentage}%`,
                        backgroundColor: member.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {tab === "collection" &&
        (vaultProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-24 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-main/20">
              <Plus className="h-8 w-8 text-purple-glow" />
            </div>
            <h3 className="text-lg font-semibold text-cream">Your vault is empty</h3>
            <p className="mt-2 max-w-sm text-sm text-cream/50">
              Browse member shops and add items to start building your personal BTS museum.
            </p>
            <Link href="/members" className="mt-6">
              <Button>Shop by Member</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vaultProducts.map(({ item, product }) => (
              <div key={product.id} className="overflow-hidden rounded-2xl glass">
                <Link href={`/products/${product.slug}`} className="relative block aspect-video">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="400px"
                  />
                </Link>
                <div className="p-4">
                  <Badge variant="muted">{getEraName(product.era)}</Badge>
                  <h3 className="mt-2 font-semibold text-cream">{product.name}</h3>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-cream/50 capitalize">{item.condition}</span>
                    <span className="font-medium text-cream">
                      {formatPrice(product.listingPrice ?? product.msrp)}
                    </span>
                  </div>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="mt-3 flex items-center gap-1 text-xs text-red-400/70 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" /> Remove from vault
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}
