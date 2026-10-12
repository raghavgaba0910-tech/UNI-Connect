"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion, useReducedMotion } from "framer-motion";
import { Bell, BookOpen, BriefcaseBusiness, Compass, HeartHandshake, Home, LogIn, Menu, Megaphone, MoonStar, PackageSearch, ShieldAlert, ShieldCheck, Sun, UserRound, UsersRound, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

const navigation: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Campus home", href: "/", icon: Home },
  { label: "Community", href: "/community", icon: UsersRound },
  { label: "Safety & care", href: "/safety", icon: ShieldAlert },
  { label: "Lost & found", href: "/lost-found", icon: PackageSearch },
  { label: "Notice board", href: "/notices", icon: Megaphone },
  { label: "Student support", href: "/support", icon: HeartHandshake },
  { label: "Stay & share", href: "/accommodation", icon: Compass },
  { label: "UniMarket", href: "/market", icon: BriefcaseBusiness },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const activeHref = pathname === "/" ? "/" : `/${pathname.split("/")[1]}`;

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href="/" className="brand" aria-label="UniConnect campus home">
          <span className="brand-mark">u.</span>
          <span><span className="brand-name">UniConnect</span><span className="brand-sub">COER CAMPUS / 2026</span></span>
        </Link>
        <p className="nav-caption">Your campus</p>
        <nav className="nav-list" aria-label="Campus navigation">
          {navigation.map(({ label, href, icon: Icon }) => {
            const selected = activeHref === href || (href !== "/" && activeHref.startsWith(href));
            return <Link className={`nav-link${selected ? " active" : ""}`} href={href} key={href} aria-current={selected ? "page" : undefined}>
              <Icon className="nav-icon" strokeWidth={1.8} /><span>{label}</span>
            </Link>;
          })}
        </nav>
        <div className="nav-spacer" />
        <div className="sidebar-bottom">
          <p className="nav-caption">Your space</p>
          <Link className={`nav-link${activeHref === "/profile" ? " active" : ""}`} href="/profile"><UserRound className="nav-icon" /><span>My profile</span></Link>
          <Link className={`nav-link${activeHref === "/admin" ? " active" : ""}`} href="/admin"><ShieldCheck className="nav-icon" /><span>Admin workspace</span></Link>
          <div className="campus-card"><p>Connected campus</p><strong>COER University · Roorkee</strong></div>
          <div className="profile-mini"><div className="avatar">AS</div><div><strong>Campus guest</strong><span>Preview account</span></div></div>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="mobile-menu icon-button"
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close campus navigation" : "Open campus navigation"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
            >
              {menuOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
            <BookOpen size={13} style={{ verticalAlign: "-2px", marginRight: 7 }} />COER UNIVERSITY
            <span style={{ margin: "0 8px", color: "#b5baae" }}>/</span>
            <strong>{activeHref === "/" ? "CAMPUS HOME" : activeHref.slice(1).replaceAll("-", " ").toUpperCase()}</strong>
          </div>
          <div className="top-actions">
            <button className="icon-button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>{theme === "dark" ? <Sun size={16} /> : <MoonStar size={16} />}</button>
            <Link className="icon-button" href="/login" title="Sign in" aria-label="Sign in"><LogIn size={16} /></Link>
            <span className="top-separator" />
            <Link className="icon-button" href="/notices" title="Notifications and notices" aria-label="Open notices"><Bell size={16} /></Link>
            <div className="avatar" aria-label="Guest profile">AS</div>
          </div>
        </header>
        {menuOpen && (
          <>
            <button
              className="mobile-drawer-backdrop"
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close campus navigation"
            />
            <nav className="mobile-drawer" id="mobile-navigation" aria-label="More campus destinations">
              <div className="mobile-drawer-head">
                <span>Explore campus</span>
                <button className="icon-button" type="button" onClick={() => setMenuOpen(false)} aria-label="Close campus navigation">
                  <X size={16} />
                </button>
              </div>
              {navigation.slice(5).map(({ label, href, icon: Icon }) => (
                <Link className="mobile-drawer-link" href={href} key={href}>
                  <Icon size={17} strokeWidth={1.8} />
                  <span>{label}</span>
                </Link>
              ))}
              <Link className="mobile-drawer-link" href="/profile">
                <UserRound size={17} strokeWidth={1.8} />
                <span>My profile</span>
              </Link>
              <Link className="mobile-drawer-link" href="/admin">
                <ShieldCheck size={17} strokeWidth={1.8} />
                <span>Admin workspace</span>
              </Link>
            </nav>
          </>
        )}
        <motion.div key={pathname} initial={reduceMotion ? false : { opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.22 }}>
          {children}
        </motion.div>
      </main>
      <footer className="mobile-nav-space" aria-hidden="true" />
    </div>
  );
}
