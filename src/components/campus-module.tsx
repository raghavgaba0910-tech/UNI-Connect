"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, CircleHelp, Filter, MapPin, Plus, Search, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";

type RecordItem = { title: string; description: string; category: string; meta: string; tag?: string };
type ModuleConfig = { title: string; intro: string; eyebrow: string; action: string; search: string; records: readonly RecordItem[]; signedInRequired?: boolean; actionHref?: string };

export function CampusModule({ config }: { config: ModuleConfig }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const categories = ["All", ...Array.from(new Set(config.records.map((record) => record.category)))];
  const records = useMemo(() => config.records.filter((record) => {
    const matchesText = `${record.title} ${record.description} ${record.category}`.toLowerCase().includes(query.toLowerCase());
    return matchesText && (filter === "All" || record.category === filter);
  }), [config.records, filter, query]);

  return <AppShell><div className="page-content module-page">
    <div className="eyebrow"><span className="live-dot" /> {config.eyebrow}</div>
    <h1>{config.title}</h1><p className="welcome-copy">{config.intro}</p>
    <div className="module-toolbar"><label className="search-box"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={config.search} aria-label={config.search} /></label><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><label className="filter-button"><Filter size={13} /><select aria-label="Filter category" value={filter} onChange={(event) => setFilter(event.target.value)} style={{ border: 0, outline: 0, background: "transparent", color: "inherit", fontSize: 10, cursor: "pointer", maxWidth: 130 }}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label><Link className="primary-button" style={{ marginTop: 0 }} href={config.actionHref ?? "/login?next=new-post"}><Plus size={14} />{config.action}</Link></div></div>
    <div className="module-list" aria-live="polite">{records.map((record) => <article className="module-item" key={record.title}><div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}><h3>{record.title}</h3>{record.tag && <span className="badge academic">{record.tag}</span>}</div><p>{record.description}</p><div className="module-meta"><CalendarDays size={12} />{record.meta}<span>·</span><MapPin size={12} />COER campus</div></article>)}{records.length === 0 && <div className="panel empty-state"><CircleHelp size={18} style={{ display: "block", margin: "0 auto 9px" }} />No matches yet. Try a different search or category.</div>}</div>
    <p style={{ color: "#8a9084", fontSize: 9, lineHeight: 1.7, marginTop: 17 }}><ShieldCheck size={12} style={{ verticalAlign: "-2px", marginRight: 5 }} />{config.signedInRequired ? "Posting requires a verified account. Sample entries shown for preview." : "Sample campus posts shown for preview. Sign in to create or manage posts."} <Link href="/login" style={{ color: "#4e742f", fontWeight: 700 }}>Sign in <ArrowRight size={10} style={{ verticalAlign: "-2px" }} /></Link></p>
  </div></AppShell>;
}
