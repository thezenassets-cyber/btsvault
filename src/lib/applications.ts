const STORAGE_KEY = "army-vault-applications";

export type StoredApplication = {
  id: string;
  createdAt: string;
  status: "pending" | "accepted" | "rejected";
  eventSlug: string;
  eventTitle: string;
  memberId: string;
  format: "online" | "in-person";
  fullName: string;
  email: string;
  notes?: string;
  adminNotes?: string;
};

function readAll(): StoredApplication[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StoredApplication[];
  } catch {
    return [];
  }
}

function writeAll(apps: StoredApplication[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

export function saveApplication(input: {
  eventSlug: string;
  eventTitle: string;
  memberId: string;
  format: "online" | "in-person";
  fullName: string;
  email: string;
  notes?: string;
}): StoredApplication {
  const app: StoredApplication = {
    id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    status: "pending",
    ...input,
  };
  const all = readAll();
  all.unshift(app);
  writeAll(all);
  return app;
}

export function listApplications(): StoredApplication[] {
  return readAll();
}

export function updateApplication(
  id: string,
  patch: Partial<Pick<StoredApplication, "status" | "adminNotes" | "notes">>
): StoredApplication | null {
  const all = readAll();
  const idx = all.findIndex((a) => a.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], ...patch };
  writeAll(all);
  return all[idx];
}
