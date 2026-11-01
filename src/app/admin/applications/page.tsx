"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { listApplications, updateApplication, type StoredApplication } from "@/lib/applications";
import { getEmailTemplate } from "@/lib/email/templates";
import { renderTemplate, sendApplicationEmail } from "@/lib/email/send";
import { getMemberName } from "@/data/members";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MemberId } from "@/lib/types";

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<StoredApplication[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all");
  const [composer, setComposer] = useState<StoredApplication | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [sendMsg, setSendMsg] = useState("");

  function refresh() {
    setApps(listApplications());
  }

  useEffect(() => {
    refresh();
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? apps : apps.filter((a) => a.status === filter)),
    [apps, filter]
  );

  function openAccept(app: StoredApplication) {
    const tpl = getEmailTemplate("acceptance")!;
    const vars = varsFor(app);
    setComposer(app);
    setSubject(renderTemplate(tpl.subject, vars));
    setBody(renderTemplate(tpl.body, vars));
    setAdminNotes(app.adminNotes ?? "");
    setSendMsg("");
  }

  async function confirmAccept() {
    if (!composer) return;
    updateApplication(composer.id, { status: "accepted", adminNotes });
    const result = await sendApplicationEmail({
      to: composer.email,
      subject,
      body,
      meta: { applicationId: composer.id },
    });
    setSendMsg(
      result.ok
        ? `Sent (${result.mode}) — id ${result.id}`
        : `Failed: ${result.error ?? "unknown"}`
    );
    refresh();
    setTimeout(() => setComposer(null), 1200);
  }

  function reject(app: StoredApplication) {
    updateApplication(app.id, { status: "rejected" });
    refresh();
  }

  return (
    <AdminShell title="Applications">
      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", "pending", "accepted", "rejected"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm capitalize ${
              filter === f ? "bg-purple-main text-white" : "bg-white/5 text-cream/60"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="py-12 text-center text-cream/50">
            No applications yet. Submit one from Experiences → Apply.
          </p>
        )}
        {filtered.map((app) => (
          <div
            key={app.id}
            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge
                  variant={
                    app.status === "accepted"
                      ? "success"
                      : app.status === "rejected"
                        ? "muted"
                        : "purple"
                  }
                >
                  {app.status}
                </Badge>
                <Badge variant={app.format === "online" ? "purple" : "success"}>
                  {app.format === "online" ? "ONLINE" : "IN PERSON"}
                </Badge>
              </div>
              <p className="font-medium text-cream">
                {app.fullName} · {getMemberName(app.memberId as MemberId)}
              </p>
              <p className="text-sm text-cream/50">{app.eventTitle}</p>
              <p className="mt-1 text-xs text-cream/35">
                {app.email} · {new Date(app.createdAt).toLocaleString()}
              </p>
              {app.adminNotes && (
                <p className="mt-2 text-xs text-purple-glow">Notes: {app.adminNotes}</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {app.status === "pending" && (
                <>
                  <Button size="sm" onClick={() => openAccept(app)}>
                    Accept
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => reject(app)}>
                    Reject
                  </Button>
                </>
              )}
              {app.status === "accepted" && (
                <Button size="sm" variant="outline" onClick={() => openAccept(app)}>
                  Resend email
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {composer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-charcoal p-6">
            <h2 className="text-xl font-bold text-cream">Acceptance email</h2>
            <p className="mt-1 text-sm text-cream/50">
              Customize before send. Outbound mail is logged on this browser until Resend is configured.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs text-cream/50">Subject</label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-cream/50">Body</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={12}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-cream/50">Admin notes</label>
                <Input
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Internal notes"
                />
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="mb-2 text-xs font-medium text-cream/50 uppercase">Preview</p>
                <p className="text-sm font-semibold text-cream">{subject}</p>
                <pre className="mt-2 whitespace-pre-wrap text-xs text-cream/60">{body}</pre>
              </div>
              {sendMsg && <p className="text-sm text-green-400">{sendMsg}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setComposer(null)}>
                Cancel
              </Button>
              <Button onClick={confirmAccept}>Send</Button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function varsFor(app: StoredApplication) {
  return {
    name: app.fullName,
    member: getMemberName(app.memberId as MemberId),
    event: app.eventTitle,
    format: app.format === "online" ? "Online" : "In Person",
    date: new Date(app.createdAt).toLocaleDateString(),
  };
}
