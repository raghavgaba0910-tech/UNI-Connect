"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";

export default function NewComplaintPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [referenceCode, setReferenceCode] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const values = Object.fromEntries(new FormData(event.currentTarget).entries());
      if (!values.incidentDate) delete values.incidentDate;
      const response = await fetch("/api/complaints", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const result = await response.json();
      if (!response.ok) {
        setError(response.status === 401 ? "Sign in with your student account before submitting." : result.error ?? "The concern could not be submitted.");
        return;
      }
      setReferenceCode(result.referenceCode);
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return <AppShell><div className="page-content module-page"><Link href="/safety" className="text-link"><ArrowLeft size={13} /> Safety & care</Link><div className="eyebrow" style={{ marginTop: 24 }}><ShieldCheck size={13} /> PRIVATE SUBMISSION</div><h1>Share a campus concern</h1><p className="welcome-copy" style={{ maxWidth: 570, lineHeight: 1.8 }}>Your name is not shown with an anonymous concern. Sign-in is still required so authorized staff can follow up safely. If anyone is in immediate danger, contact emergency services or campus security directly.</p>
    {referenceCode ? <div className="panel" style={{ padding: 22, marginTop: 22 }}><div className="eyebrow"><span className="live-dot" /> SUBMITTED</div><h2 style={{ fontSize: 19, margin: "12px 0 7px" }}>Your reference code</h2><p style={{ color: "#777d72", fontSize: 11 }}>Save this code to check the status of your concern.</p><div style={{ display: "inline-block", marginTop: 12, padding: "12px 16px", background: "#f3f5ed", borderRadius: 8, font: "18px var(--font-mono), monospace", letterSpacing: ".08em" }}>{referenceCode}</div><div style={{ marginTop: 17 }}><Link className="text-link" href="/safety/track">Track this concern <ArrowRight size={12} /></Link></div></div> : <form onSubmit={submit} className="module-item" style={{ marginTop: 22, display: "grid", gap: 15 }}>
      <label className="field-label">Category<select name="category" required className="field-control"><option value="">Choose a category</option><option value="safety">Safety</option><option value="harassment">Harassment or discrimination</option><option value="facilities">Campus facilities</option><option value="academic">Academic concern</option><option value="other">Other</option></select></label>
      <label className="field-label">Short title<input name="title" required minLength={4} maxLength={140} className="field-control" placeholder="What happened?" /></label>
      <label className="field-label">What would you like us to know?<textarea name="description" required minLength={10} maxLength={10000} rows={5} className="field-control" placeholder="Share only details that will help the campus team respond." /></label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}><label className="field-label">Campus location<input name="location" maxLength={200} className="field-control" placeholder="Optional" /></label><label className="field-label">Incident date<input type="date" name="incidentDate" className="field-control" /></label></div>
      {error && <p role="alert" className="form-alert">{error} {error.startsWith("Sign in") && <Link href="/login">Sign in <ArrowRight size={11} /></Link>}</p>}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}><span style={{ color: "#858b7f", fontSize: 9 }}><ShieldCheck size={12} style={{ verticalAlign: "-2px", marginRight: 5 }} />Your reference code is private. Keep it somewhere safe.</span><button className="primary-button" type="submit" disabled={busy}>{busy ? "Submitting..." : "Submit concern"}<ArrowRight size={14} /></button></div>
    </form>}</div></AppShell>;
}
