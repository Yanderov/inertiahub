"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Send, CheckCircle2, AlertCircle, Mail, MapPin, MessageSquare, Shield } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit message");
      }

      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-base text-foreground">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Mail className="w-3.5 h-3.5" />
              Direct Support & Inquiries
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
              Get in touch with our solutions architects
            </h1>

            <p className="text-foreground-muted leading-relaxed">
              Whether you need enterprise onboarding, architecture consulting, or custom SLA pricing, our engineering staff is here to help.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-elevated/40 border border-border/70">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground-muted uppercase">Enterprise Email</h4>
                  <p className="text-sm font-medium text-foreground">enterprise@inertiahub.io</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-elevated/40 border border-border/70">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-foreground-muted uppercase">Security & Vulnerabilities</h4>
                  <p className="text-sm font-medium text-foreground">security@inertiahub.io</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-3xl bg-surface-elevated/60 border border-border shadow-2xl backdrop-blur-xl">
              <h2 className="text-xl font-bold text-foreground mb-6">Send an Inquiry</h2>

              {success ? (
                <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h3 className="text-lg font-bold text-foreground">Message Dispatched</h3>
                  <p className="text-sm text-foreground-muted max-w-md mx-auto">
                    Your inquiry has been stored securely in our queue. A member of our engineering solutions group will reach out shortly.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="mt-4 px-5 py-2 text-xs font-semibold rounded-xl bg-surface-base border border-border text-foreground hover:bg-surface-elevated"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1.5">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Elena Rostova"
                        className="w-full px-4 py-3 rounded-xl bg-surface-base border border-border/80 text-foreground text-sm focus:outline-none focus:border-brand-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1.5">
                        Enterprise Email
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="elena@company.com"
                        className="w-full px-4 py-3 rounded-xl bg-surface-base border border-border/80 text-foreground text-sm focus:outline-none focus:border-brand-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Infrastructure deployment inquiry..."
                      className="w-full px-4 py-3 rounded-xl bg-surface-base border border-border/80 text-foreground text-sm focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground-muted uppercase mb-1.5">
                      Message / Architecture Requirements
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Describe your throughput requirements, expected QPS, or questions..."
                      className="w-full px-4 py-3 rounded-xl bg-surface-base border border-border/80 text-foreground text-sm focus:outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm text-white bg-brand-600 hover:bg-brand-500 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? "Submitting Inquiry..." : "Submit Message"}
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
