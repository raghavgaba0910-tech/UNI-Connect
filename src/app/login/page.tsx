"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Mail, ShieldCheck } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function sendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setMessage("Add your Supabase project URL and anon key to .env.local, then restart the dev server.");
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: mode === "register" },
      });
      if (error) {
        setMessage(error.message);
        return;
      }
      setSent(true);
      setMessage("Check your inbox for a one-time sign-in code.");
    } catch {
      setMessage("We couldn't reach the sign-in service. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setMessage("Supabase is not configured yet. Follow the setup guide in README.md.");
      return;
    }

    setBusy(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: "email",
      });
      if (error) {
        setMessage(error.message);
        return;
      }
      window.location.assign("/");
    } catch {
      setMessage("We couldn't reach the sign-in service. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-layout">
      <section
        className="login-story"
        style={{
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "36px 5vw",
          background: "#20231f",
          color: "#f6f7f0",
        }}
      >
        <Link href="/" className="brand" style={{ padding: 0, margin: 0, color: "inherit" }}>
          <span className="brand-mark">u.</span>
          <span>
            <span className="brand-name">UniConnect</span>
            <span className="brand-sub">COER CAMPUS / 2026</span>
          </span>
        </Link>

        <div style={{ position: "relative", zIndex: 1, maxWidth: 520, padding: "70px 0" }}>
          <div className="eyebrow" style={{ color: "#b9f36b" }}>
            <span className="live-dot" /> YOUR PEOPLE ARE HERE
          </div>
          <h1
            style={{
              fontSize: "clamp(36px, 5vw, 63px)",
              lineHeight: 1.04,
              maxWidth: 490,
              margin: "18px 0",
              color: "#f6f7f0",
            }}
          >
            Campus feels better when we&apos;re connected.
          </h1>
          <p style={{ maxWidth: 370, color: "#aeb3a7", fontSize: 13, lineHeight: 1.8 }}>
            Find your people, share what you know, and get support when it matters.
          </p>
          <div
            style={{
              display: "flex",
              gap: 9,
              alignItems: "center",
              marginTop: 27,
              color: "#b9f36b",
              fontSize: 11,
            }}
          >
            <ShieldCheck size={15} /> Built around student privacy
          </div>
        </div>

        <div style={{ color: "#82877d", font: "10px var(--font-mono), monospace" }}>
          COER UNIVERSITY · ROORKEE
        </div>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 390,
            height: 390,
            right: -120,
            top: "28%",
            borderRadius: "50%",
            border: "1px solid #41473c",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: 220,
            height: 220,
            right: -34,
            top: "39%",
            borderRadius: "50%",
            background: "#b9f36b",
            opacity: 0.1,
          }}
        />
      </section>

      <section className="login-form-area" style={{ display: "grid", placeItems: "center", padding: 26 }}>
        <div style={{ width: "min(100%, 340px)" }}>
          <Link href="/" className="text-link">
            <ArrowLeft size={13} /> Back to campus
          </Link>

          <div style={{ marginTop: 48 }}>
            <div className="eyebrow">
              <Mail size={13} /> STUDENT ACCESS
            </div>

            <h2 style={{ margin: "12px 0 7px", fontSize: 25, letterSpacing: 0 }}>
              {mode === "login" ? "Welcome back" : "Join your campus"}
            </h2>

            <p style={{ color: "#777d72", fontSize: 11, lineHeight: 1.7, marginBottom: 26 }}>
              {sent ? "Enter the one-time code from your email." : "Use your student email to receive a one-time sign-in code."}
            </p>

            {!sent ? (
              <form onSubmit={sendCode}>
                <label htmlFor="email" style={{ display: "block", marginBottom: 7, fontSize: 10, fontWeight: 700 }}>
                  Student email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@coer.ac.in"
                  style={{
                    width: "100%",
                    height: 43,
                    padding: "0 12px",
                    border: "1px solid #e1e4d9",
                    borderRadius: 8,
                    background: "white",
                    fontSize: 11,
                  }}
                />
                <button
                  className="primary-button"
                  type="submit"
                  disabled={busy}
                  style={{ width: "100%", justifyContent: "center", marginTop: 13, opacity: busy ? 0.7 : 1 }}
                >
                  {busy ? "Sending..." : "Email me a sign-in code"}
                  <ArrowRight size={14} />
                </button>
              </form>
            ) : (
              <form onSubmit={verifyCode}>
                <label htmlFor="code" style={{ display: "block", marginBottom: 7, fontSize: 10, fontWeight: 700 }}>
                  One-time code
                </label>
                <input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  value={token}
                  onChange={(event) => setToken(event.target.value)}
                  placeholder="Enter the code from your email"
                  style={{
                    width: "100%",
                    height: 43,
                    padding: "0 12px",
                    border: "1px solid #e1e4d9",
                    borderRadius: 8,
                    background: "white",
                    fontSize: 11,
                  }}
                />
                <button
                  className="primary-button"
                  type="submit"
                  disabled={busy}
                  style={{ width: "100%", justifyContent: "center", marginTop: 13 }}
                >
                  {busy ? "Checking..." : "Verify and continue"}
                  <Check size={14} />
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setSent(false);
                    setToken("");
                    setMessage("");
                  }}
                  style={{ width: "100%", marginTop: 9 }}
                >
                  Use a different email
                </button>
              </form>
            )}

            {message && (
              <p
                role="status"
                style={{
                  padding: 11,
                  borderRadius: 7,
                  background: message.startsWith("Check") ? "#edf6e4" : "#fff0ec",
                  color: message.startsWith("Check") ? "#476635" : "#a94430",
                  fontSize: 10,
                  lineHeight: 1.6,
                  marginTop: 14,
                }}
              >
                {message}
              </p>
            )}

            <p style={{ marginTop: 22, color: "#777d72", textAlign: "center", fontSize: 10 }}>
              {mode === "login" ? "New to UniConnect?" : "Already have an account?"}{" "}
              <button
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setSent(false);
                  setMessage("");
                }}
                style={{ border: 0, background: "transparent", color: "#4e742f", fontSize: 10, fontWeight: 800, cursor: "pointer" }}
              >
                {mode === "login" ? "Create an account" : "Sign in"}
              </button>
            </p>

            <p style={{ marginTop: 25, color: "#8a9084", fontSize: 9, lineHeight: 1.7, textAlign: "center" }}>
              Email domain restrictions must be configured and verified with COER before public registration is enabled.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
