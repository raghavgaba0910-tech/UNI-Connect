"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, PackageSearch } from "lucide-react";
import { AppShell } from "@/components/app-shell";

export default function NewLostFoundPage() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setBusy(true);
    setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    if (!values.incidentDate) delete values.incidentDate;
    const response = await fetch("/api/lost-found", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    const result = await response.json();
    setBusy(false);
    if (!response.ok) return setError(response.status === 401 ? "Sign in with your student account before posting." : result.error ?? "The item could not be posted.");
    setMessage("Your item is now on the campus board.");
    form.reset();
  }
  return <AppShell><div className="page-content module-page"><Link href="/lost-found" className="text-link"><ArrowLeft size={13} /> Lost & found</Link><div className="eyebrow" style={{ marginTop: 24 }}><PackageSearch size={13} /> CAMPUS ITEM BOARD</div><h1>Help an item find its person</h1><p className="welcome-copy">Please leave out personal contact details. Replies should happen through the platform.</p><form onSubmit={submit} className="module-item" style={{ marginTop: 22, display: "grid", gap: 15 }}><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}><label className="field-label">Posting type<select name="type" required className="field-control"><option value="lost">I lost something</option><option value="found">I found something</option></select></label><label className="field-label">Category<input name="category" required maxLength={60} className="field-control" placeholder="Books, ID card, electronics..." /></label></div><label className="field-label">Item name<input name="itemName" required minLength={2} maxLength={120} className="field-control" placeholder="A short description" /></label><label className="field-label">Details<textarea name="description" required minLength={5} maxLength={3000} rows={4} className="field-control" placeholder="Color, identifying details, or where to collect it." /></label><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}><label className="field-label">Campus location<input name="location" required maxLength={200} className="field-control" placeholder="Block, library, or common area" /></label><label className="field-label">Date<input type="date" name="incidentDate" className="field-control" /></label></div>{message && <p role="status" className="form-success">{message}</p>}{error && <p role="alert" className="form-alert">{error} {error.startsWith("Sign in") && <Link href="/login">Sign in <ArrowRight size={11} /></Link>}</p>}<div style={{ display: "flex", justifyContent: "flex-end" }}><button className="primary-button" type="submit" disabled={busy}>{busy ? "Posting..." : "Post item"}<ArrowRight size={14} /></button></div></form></div></AppShell>;
}
