import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, Check, Clock3, GraduationCap, HeartHandshake, Megaphone, MessageCircle, PackageSearch, ShieldAlert, Sparkles, UsersRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";

const services = [
  { title: "Community connect", detail: "Find a study buddy or build something together.", href: "/community", icon: UsersRound, color: "#e5f2d7", ink: "#557637" },
  { title: "Safety & care", detail: "Raise a concern privately and track its progress.", href: "/safety", icon: ShieldAlert, color: "#ffe9e2", ink: "#bd5b43" },
  { title: "Lost & found", detail: "Help campus essentials find their way home.", href: "/lost-found", icon: PackageSearch, color: "#e5eff0", ink: "#467579" },
  { title: "Student support", detail: "Get guidance for wellbeing and your next step.", href: "/support", icon: HeartHandshake, color: "#fff1d1", ink: "#9b7326" },
];

const notices = [
  { day: "06", month: "OCT", title: "Mid-semester examination schedule", info: "Examination Cell · Updated 9:15 AM", label: "IMPORTANT", kind: "urgent" },
  { day: "08", month: "OCT", title: "Design thinking lab: open registrations", info: "Innovation Cell · 2:00 PM, Block C", label: "ACADEMIC", kind: "academic" },
  { day: "11", month: "OCT", title: "Campus clean-up & chai morning", info: "Student Council · Saturday, 8:30 AM", label: "CAMPUS LIFE", kind: "event" },
];

export default function HomePage() {
  const today = new Date();
  const currentDate = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(today);
  const dateTime = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(today);

  return <AppShell><div className="page-content">
    <section className="welcome-row">
      <div><div className="eyebrow"><span className="live-dot" /> YOUR CAMPUS, IN SYNC</div><h1>Good to see you</h1><p className="welcome-copy">A little more connected. A little more at home.</p></div>
      <time className="date-pill" dateTime={dateTime}>{currentDate}</time>
    </section>

    <section className="hero-panel" aria-labelledby="hero-title">
      <div className="hero-copy"><div className="hero-kicker">A better campus starts with us</div><h2 id="hero-title">Find your people.<br />Make campus yours.</h2><p>Need a hand, have one to offer, or just looking for your people? Your campus community is right here.</p><Link className="primary-button" href="/community">Explore your community <ArrowRight size={14} /></Link></div>
      <div className="hero-art" aria-hidden="true"><div className="art-circle" /><div className="art-square"><GraduationCap /></div><span className="art-star">✳</span><div className="art-note">good things grow together</div></div>
    </section>

    <section aria-labelledby="services-title">
      <div className="section-head"><div><h2 id="services-title">The campus, in your corner</h2><p>Little things that make student life easier.</p></div><Link className="text-link" href="/support">See all services <ArrowUpRight size={13} /></Link></div>
      <div className="service-grid">{services.map(({ title, detail, href, icon: Icon, color, ink }) => <Link className="service-card" href={href} key={title}>
        <ArrowUpRight className="service-arrow" /><div className="service-icon" style={{ background: color, color: ink }}><Icon /></div><h3>{title}</h3><p>{detail}</p>
      </Link>)}</div>
    </section>

    <div className="home-columns">
      <section className="panel" aria-labelledby="notice-heading"><div className="panel-head"><h2 id="notice-heading">Around campus</h2><span>THE LATEST</span></div><div className="notice-list">{notices.map((notice) => <article className="notice-item" key={notice.title}><div className="notice-date"><b>{notice.day}</b><span>{notice.month}</span></div><div className="notice-info"><h3>{notice.title}</h3><p>{notice.info}</p></div><span className={`badge ${notice.kind}`}>{notice.label}</span></article>)}</div><div style={{ padding: "0 17px 14px" }}><Link className="text-link" href="/notices">All campus notices <ArrowRight size={12} /></Link></div></section>
      <section className="panel" aria-labelledby="pulse-heading"><div className="panel-head"><h2 id="pulse-heading">Campus pulse</h2><span>THIS WEEK</span></div><div className="activity-list">
        <div className="activity-row"><div className="activity-mark"><MessageCircle /></div><div><p><strong>12 new study circles</strong> opened in Community Connect.</p><small><Clock3 size={10} style={{ verticalAlign: "-1px" }} /> &nbsp;Just now</small></div></div>
        <div className="activity-row"><div className="activity-mark"><CalendarDays /></div><div><p><strong>3 events</strong> are coming up across campus.</p><small><Clock3 size={10} style={{ verticalAlign: "-1px" }} /> &nbsp;Today</small></div></div>
        <div className="activity-row"><div className="activity-mark"><Check /></div><div><p><strong>One small act:</strong> share a skill, find a book, say hello.</p><small><Sparkles size={10} style={{ verticalAlign: "-1px" }} /> &nbsp;Your campus, together</small></div></div>
      </div></section>
    </div>
  </div></AppShell>;
}
