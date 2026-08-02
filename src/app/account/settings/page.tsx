"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Lock, User, QrCode, RefreshCw } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AccountSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      setQrCodeData(data.qrCodeDataUrl || data.qrCode || "");
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

  return (
    <div className="admin-shell min-h-screen flex bg-black text-zinc-100 antialiased">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 px-6 py-8 sm:px-8 lg:px-10 max-w-5xl w-full">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <RefreshCw className="w-5 h-5 animate-spin text-zinc-600" />
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-end justify-between pb-5 border-b border-white/5">
                <div>
                  <h1 className="text-xl font-semibold tracking-tight text-zinc-100">
                    Account & Security
                  </h1>
                  <p className="text-[13px] text-zinc-600 mt-1">
                    Authentication credentials, 2FA keys, and permissions.
                  </p>
                </div>
              </div>

              {msg && (
                <div
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-lg text-[13px] ${
                    msg.type === "success"
                      ? "bg-white/[0.04] text-zinc-300 border border-white/5"
                      : "bg-white/[0.04] text-rose-400 border border-white/5"
                  }`}
                >
                  {msg.text}
                </div>
              )}

              <section className="space-y-6">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                    <User className="w-4 h-4 text-zinc-500" /> Profile Information
                  </h2>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/[0.06]">
                    <div className="bg-black px-5 py-4">
                      <div className="text-[11px] uppercase tracking-wider text-zinc-600">
                        Full Name
                      </div>
                      <div className="text-sm text-zinc-200 mt-1.5">
                        {user?.name || "Anonymous User"}
                      </div>
                    </div>
                    <div className="bg-black px-5 py-4">
                      <div className="text-[11px] uppercase tracking-wider text-zinc-600">
                        Email Address
                      </div>
                      <div className="text-sm text-zinc-200 mt-1.5 font-mono">
                        {user?.email}
                      </div>
                    </div>
                    <div className="bg-black px-5 py-4">
                      <div className="text-[11px] uppercase tracking-wider text-zinc-600">
                        Role
                      </div>
                      <div className="text-sm text-zinc-200 mt-1.5">
                        {user?.role || "USER"}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-zinc-500" /> Two-Factor Authentication
                    </h2>
                    {user?.isTwoFactorEnabled ? (
                      <button
                        onClick={disable2FA}
                        className="px-3 py-1.5 rounded-md text-[12px] font-medium bg-white/[0.06] text-rose-400 hover:bg-white/[0.09] transition-colors"
                      >
                        Disable 2FA
                      </button>
                    ) : (
                      <button
                        onClick={initiate2FASetup}
                        disabled={totpLoading}
                        className="px-3 py-1.5 rounded-md text-[12px] font-medium bg-white/[0.06] text-zinc-200 hover:bg-white/[0.09] transition-colors"
                      >
                        {totpLoading ? "Configuring..." : "Enable 2FA Protection"}
                      </button>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between px-5 py-4 bg-white/[0.03] border border-white/5 rounded-md">
                    <span className="text-[13px] text-zinc-500">Current security status</span>
                    <span
                      className={`text-[12px] font-medium ${
                        user?.isTwoFactorEnabled ? "text-zinc-200" : "text-zinc-600"
                      }`}
                    >
                      {user?.isTwoFactorEnabled ? "2FA Active" : "2FA Disabled"}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>

      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="max-w-md w-full rounded-lg bg-[#0c0c0e] border border-white/10 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <QrCode className="w-4 h-4 text-zinc-500" /> Setup Authenticator App
              </h3>
              <button
                onClick={() => setShow2FAModal(false)}
                className="text-zinc-600 hover:text-zinc-300 text-[13px]"
              >
                ✕
              </button>
            </div>

            <p className="text-[12px] text-zinc-500 leading-relaxed">
              Scan this QR code with Google Authenticator, 1Password, or Authy.
            </p>

            <div className="flex justify-center p-4 rounded-md bg-white">
              {qrCodeData ? (
                <img src={qrCodeData} alt="2FA QR Code" className="w-48 h-48" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-xs text-black">
                  Generating QR...
                </div>
              )}
            </div>

            <div className="p-3 rounded-md bg-white/[0.04] border border-white/5 text-center space-y-1">
              <span className="text-[10px] uppercase font-semibold text-zinc-600">
                Manual Entry Secret
              </span>
              <p className="font-mono text-[12px] text-zinc-200 font-medium tracking-wider select-all">
                {secret}
              </p>
            </div>

            <form onSubmit={verifyAndEnable2FA} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 uppercase mb-1.5">
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
                  className="w-full px-4 py-2.5 rounded-md bg-black border border-white/10 text-center font-mono text-lg tracking-widest text-zinc-100 focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShow2FAModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-md text-[12px] font-medium bg-white/[0.04] border border-white/10 text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={totpLoading || verificationCode.length !== 6}
                  className="flex-1 py-2.5 px-4 rounded-md text-[12px] font-medium bg-white/[0.06] text-zinc-100 hover:bg-white/[0.09] disabled:opacity-50 transition-colors"
                >
                  {totpLoading ? "Verifying..." : "Confirm & Activate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
