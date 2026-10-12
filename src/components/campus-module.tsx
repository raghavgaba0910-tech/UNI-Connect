"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, CircleHelp, Filter, MapPin, Plus, Search, ShieldCheck, X } from "lucide-react";
import { AppShell } from "@/components/app-shell";

type RecordItem = { title: string; description: string; category: string; meta: string; tag?: string };
type ModuleConfig = { title: string; intro: string; eyebrow: string; action: string; search: string; records: readonly RecordItem[]; signedInRequired?: boolean; actionHref?: string };

export function CampusModule({ config }: { config: ModuleConfig }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const normalizedQuery = query.trim().toLowerCase();
  const categories = ["All", ...Array.from(new Set(config.records.map((record) => record.category)))];
  const records = useMemo(() => config.records.filter((record) => {
    const searchText = `${record.title} ${record.description} ${record.category} ${record.meta} ${record.tag ?? ""}`.toLowerCase();
    const matchesText = searchText.includes(normalizedQuery);
    return matchesText && (filter === "All" || record.category === filter);
  }), [config.records, filter, normalizedQuery]);
  const hasActiveFilters = normalizedQuery.length > 0 || filter !== "All";

  return <AppShell><div className="page-content module-page">
    <div className="eyebrow"><span className="live-dot" /> {config.eyebrow}</div>
    <h1>{config.title}</h1><p className="welcome-copy">{config.intro}</p>
    <div className="module-toolbar">
      <label className="search-box">
        <Search size={16} aria-hidden="true" />
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={config.search} aria-label={config.search} />
      </label>
      <div className="module-toolbar-actions">
        <label className="filter-button">
          <Filter size={14} aria-hidden="true" />
          <select aria-label="Filter category" value={filter} onChange={(event) => setFilter(event.target.value)}>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>
        </label>
        <Link className="primary-button" style={{ marginTop: 0 }} href={config.actionHref ?? "/login?next=new-post"}><Plus size={15} />{config.action}</Link>
      </div>
    </div>
    <div className="module-results">
      <p className="module-result-count" aria-live="polite">Showing {records.length} of {config.records.length} {config.records.length === 1 ? "result" : "results"}</p>
      {hasActiveFilters && (
        <button className="clear-filters" type="button" onClick={() => { setQuery(""); setFilter("All"); }}>
          <X size={13} /> Clear filters
        </button>
      )}
    </div>
    <div className="module-list">
      {records.map((record) => <article className="module-item" key={record.title}>
        <div className="module-item-heading"><h3>{record.title}</h3>{record.tag && <span className="badge academic">{record.tag}</span>}</div>
        <p>{record.description}</p>
        <div className="module-meta"><CalendarDays size={13} />{record.meta}<span>·</span><MapPin size={13} />COER campus</div>
      </article>)}
      {records.length === 0 && <div className="panel empty-state"><CircleHelp size={19} style={{ display: "block", margin: "0 auto 9px" }} />No matches yet. Try a different search or category.</div>}
    </div>
    <p style={{ color: "#8a9084", fontSize: 9, lineHeight: 1.7, marginTop: 17 }}><ShieldCheck size={12} style={{ verticalAlign: "-2px", marginRight: 5 }} />{config.signedInRequired ? "Posting requires a verified account. Sample entries shown for preview." : "Sample campus posts shown for preview. Sign in to create or manage posts."} <Link href="/login" style={{ color: "#4e742f", fontWeight: 700 }}>Sign in <ArrowRight size={10} style={{ verticalAlign: "-2px" }} /></Link></p>
  </div></AppShell>;
}
