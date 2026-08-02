"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ShieldCheck, KeyRound, Lock, User, AlertCircle, CheckCircle2, QrCode, Copy, RefreshCw } from "lucide-react";

export default function AccountSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // 2FA Setup state
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState("");
  const [totpLoading, setTotpLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/v1/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const initiate2FASetup = async () => {
    setTotpLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/v1/auth/2fa/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to setup 2FA");
      setQrCodeData(data.qrCode);
      setSecret(data.secret);
      setShow2FAModal(true);
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setTotpLoading(false);
    }
  };

  const verifyAndEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setTotpLoading(true);
    setMsg(null);
    try {
      const res = await fetch("/api/v1/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid 2FA token");
      setMsg({ type: "success", text: "Two-Factor Authentication successfully enabled!" });
      setShow2FAModal(false);
      setVerificationCode("");
      fetchSession();
    } catch (err: any) {
      setMsg({ type: "error", text: err.message });
    } finally {
      setTotpLoading(false);
    }
  };

  const disable2FA = async () => {
    if (!confirm("Are you sure you want to disable Two-Factor Authentication?")) return;
    try {
      const res = await fetch("/api/v1/auth/2fa/disable", { method: "POST" });
      if (res.ok) {
        setMsg({ type: "success", text: "2FA has been disabled." });
        fetchSession();
      }
    } catch (e) {
      setMsg({ type: "error", text: "Failed to disable 2FA" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-base text-foreground">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-base text-foreground">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        {/* Header */}
        <div className="mb-10 space-y-2 pb-6 border-b border-border/60">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Account & Security</h1>
          <p className="text-sm text-foreground-muted">Manage your authentication credentials, zero-trust 2FA keys, and permissions.</p>
        </div>

        {msg && (
          <div
            className={`mb-8 p-4 rounded-2xl flex items-center gap-3 text-sm ${
              msg.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
            }`}
          >
            {msg.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            {msg.text}
          </div>
        )}

        <div className="space-y-8">
          {/* Profile Details Card */}
          <div className="p-8 rounded-3xl bg-surface-elevated/50 border border-border/80 space-y-6">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <User className="w-5 h-5 text-brand-400" /> Profile Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <span className="text-xs font-semibold uppercase text-foreground-muted">Full Name</span>
                <p className="text-base font-semibold text-foreground mt-1">{user?.name || "Anonymous User"}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-foreground-muted">Email Address</span>
                <p className="text-base font-semibold text-foreground mt-1">{user?.email}</p>
              </div>
              <div>
                <span className="text-xs font-semibold uppercase text-foreground-muted">Assigned RBAC Role</span>
                <p className="mt-1">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-500/15 text-brand-300 border border-brand-500/30">
                    {user?.role || "USER"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* 2FA TOTP Card */}
          <div className="p-8 rounded-3xl bg-surface-elevated/50 border border-border/80 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" /> Two-Factor Authentication (TOTP)
                </h2>
                <p className="text-xs text-foreground-muted mt-1">
                  Protect your account with RFC 6238 time-based one-time password security tokens.
                </p>
              </div>

              {user?.isTwoFactorEnabled ? (
                <button
                  onClick={disable2FA}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
                >
                  Disable 2FA
                </button>
              ) : (
                <button
                  onClick={initiate2FASetup}
                  disabled={totpLoading}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:opacity-90 shadow-md transition-all"
                >
                  {totpLoading ? "Configuring..." : "Enable 2FA Protection"}
                </button>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-surface-base/60 border border-border/50 flex items-center justify-between">
              <span className="text-xs text-foreground-muted">Current Security Status:</span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  user?.isTwoFactorEnabled
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}
              >
                {user?.isTwoFactorEnabled ? "2FA Active (High Security)" : "2FA Disabled (Recommended to Enable)"}
              </span>
            </div>
          </div>
        </div>

        {/* 2FA Setup Modal */}
        {show2FAModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="max-w-md w-full rounded-3xl bg-surface-elevated border border-border p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-brand-400" /> Setup Authenticator App
                </h3>
                <button
                  onClick={() => setShow2FAModal(false)}
                  className="text-foreground-muted hover:text-foreground text-xs"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-foreground-muted leading-relaxed">
                Scan this QR code with Google Authenticator, 1Password, or Authy.
              </p>

              {/* QR Code container */}
              <div className="flex justify-center p-4 rounded-2xl bg-white">
                {qrCodeData ? (
                  <img src={qrCodeData} alt="2FA QR Code" className="w-48 h-48" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-xs text-black">
                    Generating QR...
                  </div>
                )}
              </div>

              {/* Secret string backup */}
              <div className="p-3 rounded-xl bg-surface-base border border-border/60 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-foreground-muted">Manual Entry Secret</span>
                <p className="font-mono text-xs text-brand-300 font-bold tracking-wider select-all">{secret}</p>
              </div>

              {/* Verification input */}
              <form onSubmit={verifyAndEnable2FA} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1.5">
                    Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    className="w-full px-4 py-3 rounded-xl bg-surface-base border border-border text-center font-mono text-lg tracking-widest text-foreground focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShow2FAModal(false)}
                    className="w-1/2 py-3 px-4 rounded-xl text-xs font-semibold bg-surface-base border border-border text-foreground-subtle hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={totpLoading || verificationCode.length !== 6}
                    className="w-1/2 py-3 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-accent-600 hover:opacity-90 disabled:opacity-50"
                  >
                    {totpLoading ? "Verifying..." : "Confirm & Activate"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
