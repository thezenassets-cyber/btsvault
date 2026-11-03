"use client";

import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";

export default function AdminHomePage() {
  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/box-office"
          className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-purple-light/40 sm:col-span-2"
        >
          <h2 className="text-lg font-semibold text-cream">Box office ledger</h2>
          <p className="mt-2 text-sm text-cream/50">
            Every paid seat, in house order, under its admit code. Search a code when two sections
            share a name.
          </p>
          <Button className="mt-4" size="sm">
            Open ledger
          </Button>
        </Link>
        <Link
          href="/admin/catalog"
          className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-purple-light/40 sm:col-span-2"
        >
          <h2 className="text-lg font-semibold text-cream">Catalog photos</h2>
          <p className="mt-2 text-sm text-cream/50">
            Replace the photo on any item that can go in the cart. The new photo shows in this browser
            until you reset it. The file on the site stays until it is published.
          </p>
          <Button className="mt-4" size="sm">
            Open catalog
          </Button>
        </Link>
        <Link
          href="/admin/applications"
          className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-purple-light/40"
        >
          <h2 className="text-lg font-semibold text-cream">Applications inbox</h2>
          <p className="mt-2 text-sm text-cream/50">
            Review, accept, or reject experience applications. Customize the acceptance email before
            sending.
          </p>
          <Button className="mt-4" size="sm">
            Open inbox
          </Button>
        </Link>
        <Link
          href="/admin/email-templates"
          className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-purple-light/40"
        >
          <h2 className="text-lg font-semibold text-cream">Email templates</h2>
          <p className="mt-2 text-sm text-cream/50">
            Edit subject/body with {"{{name}}"}, {"{{member}}"}, {"{{event}}"}, {"{{format}}"},{" "}
            {"{{date}}"} — Resend-ready when API key is set.
          </p>
          <Button className="mt-4" size="sm" variant="secondary">
            Edit templates
          </Button>
        </Link>
      </div>
    </AdminShell>
  );
}
