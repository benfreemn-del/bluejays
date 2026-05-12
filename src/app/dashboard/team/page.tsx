"use client";

import { useEffect, useState } from "react";
import { Page, PageHeader, ErrorHint } from "@/components/ui";

/**
 * /dashboard/team — manage BlueJays sales staff.
 *
 * Ben adds Raidas, Tyler, future hires; sets passwords; toggles
 * active/inactive; promotes sales → owner. Each row corresponds to a
 * bluejays_users record; password updates set sha256(plain||SALT).
 *
 * Owner-only writes (enforced server-side). Sales role can view their
 * own row (read-only) for password rotation later.
 */

interface User {
  id: string;
  email: string;
  name: string;
  role: "owner" | "sales";
  active: boolean;
  has_password: boolean;
  last_login_at: string | null;
  created_at: string;
}

const EMPTY_NEW: { email: string; name: string; role: "owner" | "sales"; password: string } = {
  email: "",
  name: "",
  role: "sales",
  password: "",
};

export default function TeamPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState(EMPTY_NEW);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [resetForId, setResetForId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch("/api/dashboard/team");
      const j = await r.json();
      if (!j.ok) setErr(j.error);
      else setUsers(j.users);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createOne() {
    if (!newUser.email || !newUser.name) {
      setErr("Email + name required");
      return;
    }
    setCreating(true);
    setErr(null);
    try {
      const r = await fetch("/api/dashboard/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const j = await r.json();
      if (!j.ok) setErr(j.error);
      else {
        setNewUser(EMPTY_NEW);
        await load();
      }
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setCreating(false);
    }
  }

  async function patch(id: string, patch: Partial<User & { password: string }>) {
    setBusyId(id);
    setErr(null);
    try {
      const r = await fetch("/api/dashboard/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...patch }),
      });
      const j = await r.json();
      if (!j.ok) setErr(j.error);
      else await load();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function resetPasswordFor(id: string) {
    if (resetPassword.length < 6) {
      setErr("Password must be at least 6 characters");
      return;
    }
    await patch(id, { password: resetPassword });
    setResetForId(null);
    setResetPassword("");
  }

  return (
    <Page max="4xl">
      <PageHeader
        eyebrow="BlueJays internal · operator"
        title="Team"
        description="Salespeople you've added. Each one logs in at /login with their email + the password you set here. Toggle 'active' off to instantly revoke access."
      />

      {err && <div className="mb-4"><ErrorHint>{err}</ErrorHint></div>}

        {/* CREATE */}
        <section className="mb-8 rounded-2xl border border-white/10 bg-slate-900/60 p-5">
          <h2 className="text-sm font-semibold mb-3">Add a person</h2>
          <div className="grid md:grid-cols-[1.2fr_1fr_120px_1fr_auto] gap-2">
            <input
              type="email"
              placeholder="email@example.com"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm"
            />
            <input
              type="text"
              placeholder="Full name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm"
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as "owner" | "sales" })}
              className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm"
            >
              <option value="sales">Sales</option>
              <option value="owner">Owner</option>
            </select>
            <input
              type="text"
              placeholder="Temp password (≥6 chars)"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm"
            />
            <button
              onClick={createOne}
              disabled={creating}
              className="rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-700 text-slate-950 font-semibold px-4 py-2 text-sm"
            >
              {creating ? "Adding…" : "Add"}
            </button>
          </div>
        </section>

        {/* LIST */}
        {loading && <p className="text-sm text-slate-500">Loading…</p>}
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className={`rounded-xl border px-5 py-4 ${
                u.active
                  ? "border-white/10 bg-slate-900/60"
                  : "border-white/5 bg-slate-900/30 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="min-w-0">
                  <p className="font-semibold text-white">
                    {u.name}{" "}
                    <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase tracking-wider">
                      {u.role}
                    </span>
                    {!u.has_password && (
                      <span className="ml-2 text-[10px] text-amber-400 font-semibold">
                        NO PASSWORD SET
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {u.email}
                    {u.last_login_at && (
                      <span className="ml-2">
                        · last login {new Date(u.last_login_at).toLocaleString()}
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={u.role}
                    onChange={(e) => patch(u.id, { role: e.target.value as "owner" | "sales" })}
                    disabled={busyId === u.id}
                    className="rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-xs"
                  >
                    <option value="sales">Sales</option>
                    <option value="owner">Owner</option>
                  </select>

                  <button
                    onClick={() => patch(u.id, { active: !u.active })}
                    disabled={busyId === u.id}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                      u.active
                        ? "border border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
                        : "border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10"
                    }`}
                  >
                    {u.active ? "Disable" : "Enable"}
                  </button>

                  <button
                    onClick={() => {
                      setResetForId(u.id === resetForId ? null : u.id);
                      setResetPassword("");
                    }}
                    className="rounded-lg border border-sky-500/40 text-sky-300 hover:bg-sky-500/10 px-2.5 py-1 text-xs font-semibold"
                  >
                    Reset password
                  </button>
                </div>
              </div>

              {resetForId === u.id && (
                <div className="mt-3 pt-3 border-t border-white/5 flex gap-2">
                  <input
                    type="text"
                    placeholder="New password (≥6 chars)"
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    className="flex-1 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => resetPasswordFor(u.id)}
                    disabled={busyId === u.id}
                    className="rounded-lg bg-sky-500 hover:bg-sky-400 disabled:bg-slate-700 text-slate-950 font-semibold px-4 py-2 text-sm"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
    </Page>
  );
}
