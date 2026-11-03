"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const GATE_KEY = "army-vault-admin";
const GATE_CODE = "army-admin";

export function useAdminGate() {
  const [ok, setOk] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setOk(sessionStorage.getItem(GATE_KEY) === "1");
    setReady(true);
  }, []);

  function login(code: string) {
    if (code.trim() === GATE_CODE) {
      sessionStorage.setItem(GATE_KEY, "1");
      setOk(true);
      return true;
    }
    return false;
  }

  function logout() {
    sessionStorage.removeItem(GATE_KEY);
    setOk(false);
  }

  return { ok, ready, login, logout };
}

export function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const { login } = useAdminGate();

  return (
    <div className="mx-auto max-w-md rounded-2xl glass p-8">
      <h1 className="text-2xl font-bold text-cream">Admin Gate</h1>
      <p className="mt-2 text-sm text-cream/50">
        Enter the gate code to manage the box office, catalog photos, applications, and email templates.
      </p>
      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (login(code)) onSuccess();
          else setErr("Invalid code");
        }}
      >
        <Input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Gate code"
          autoComplete="off"
        />
        {err && <p className="text-sm text-red-400">{err}</p>}
        <Button type="submit" className="w-full">
          Enter
        </Button>
      </form>
    </div>
  );
}

export function AdminShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const { ok, ready, logout } = useAdminGate();
  const router = useRouter();
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (ready) setAuthed(ok);
  }, [ready, ok]);

  if (!ready) {
    return <div className="py-20 text-center text-cream/50">Loading…</div>;
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <AdminLogin onSuccess={() => setAuthed(true)} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs tracking-widest text-purple-glow uppercase">Admin</p>
          <h1 className="font-display text-3xl font-bold text-cream">{title}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/box-office">
            <Button variant="secondary" size="sm">
              Box office
            </Button>
          </Link>
          <Link href="/admin/catalog">
            <Button variant="secondary" size="sm">
              Catalog photos
            </Button>
          </Link>
          <Link href="/admin/applications">
            <Button variant="secondary" size="sm">
              Applications
            </Button>
          </Link>
          <Link href="/admin/email-templates">
            <Button variant="secondary" size="sm">
              Email templates
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout();
              router.push("/admin");
            }}
          >
            Log out
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}
