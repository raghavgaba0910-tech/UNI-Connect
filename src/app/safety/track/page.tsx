"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";

type StatusResult = { referenceCode: string; status: string; createdAt: string };
const labels: Record<string, string> = { submitted: "Submitted", under_review: "Under review", in_progress: "In progress", resolved: "Resolved", closed: "Closed" };

export default function TrackComplaintPage() {
  const [result, setResult] = useState<StatusResult | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function lookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setResult(null);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/complaints/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ referenceCode: form.get("referenceCode") }) });
    const body = await response.json();
    setBusy(false);
    if (!response.ok) return setError(response.status === 401 ? "Sign in with the account used to submit this concern." : body.error ?? "No matching concern was found.");
    setResult(body.complaint);
  }
  return <AppShell><div className="page-content module-page"><Link href="/safety" className="text-link"><ArrowLeft size={13} /> Safety & care</Link><div className="eyebrow" style={{ marginTop: 24 }}><ShieldCheck size={13} /> PRIVATE STATUS CHECK</div><h1>Track a concern</h1><p className="welcome-copy">Only the account that submitted the concern can view its status.</p><form onSubmit={lookup} className="module-item" style={{ display: "grid", gap: 13, marginTop: 23, maxWidth: 540 }}><label className="field-label">Reference code<input name="referenceCode" required minLength={10} maxLength={10} pattern="[A-Fa-f0-9]{10}" className="field-control" placeholder="10-character code" autoCapitalize="characters" /></label><button className="primary-button" type="submit" disabled={busy} style={{ justifySelf: "start" }}><Search size={14} />{busy ? "Checking..." : "Check status"}</button>{error && <p role="alert" className="form-alert">{error} {error.startsWith("Sign in") && <Link href="/login">Sign in</Link>}</p>}</form>{result && <section className="panel" style={{ maxWidth: 540, padding: 18, marginTop: 13 }}><div className="eyebrow"><span className="live-dot" /> STATUS UPDATE</div><h2 style={{ margin: "12px 0 5px", fontSize: 18 }}>{labels[result.status] ?? result.status}</h2><p style={{ fontSize: 10, color: "#777d72" }}>Reference {result.referenceCode} · Submitted {new Date(result.createdAt).toLocaleDateString()}</p></section>}</div></AppShell>;
}
