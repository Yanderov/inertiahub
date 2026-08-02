"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Activity, ShieldCheck, Server, RefreshCw, CheckCircle2, Clock, Cpu, HardDrive } from "lucide-react";

interface StatusResponse {
  status: string;
  timestamp: string;
  uptime: string;
  uptimeSeconds: number;
  services: Array<{
    name: string;
    status: string;
    latencyMs: number;
  }>;
  system: {
    nodeVersion: string;
    platform: string;
    memory: {
      rssMb: number;
      heapUsedMb: number;
      heapTotalMb: number;
    };
  };
}

export default function StatusPage() {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchStatus = () => {
    fetch("/api/v1/system/status")
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLastRefreshed(new Date());
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-surface-base text-foreground">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12 pb-8 border-b border-border/60">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Telemetry Probe
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              InertiaHub System Status
            </h1>
            <p className="text-foreground-muted text-sm">
              Real-time uptime monitoring and latency benchmarks across our distributed cloud cluster.
            </p>
          </div>

          <button
            onClick={fetchStatus}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-surface-elevated border border-border hover:bg-surface-elevated/80 text-foreground-subtle hover:text-foreground transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-brand-400" : ""}`} />
            Refresh Probe
          </button>
        </div>

        {/* Global Banner Card */}
        <div className="p-8 rounded-3xl bg-surface-elevated/70 border border-border/80 mb-10 backdrop-blur-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {data?.status === "ALL_SYSTEMS_OPERATIONAL"
                    ? "All Core Systems Operational"
                    : "Systems Responding with Normal Latency"}
                </h2>
                <p className="text-xs text-foreground-muted mt-0.5">
                  Last verified: {lastRefreshed.toLocaleTimeString()} • Auto-probed every 5s
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm">
              <div>
                <p className="text-xs text-foreground-muted font-medium">Cluster Uptime</p>
                <p className="font-bold text-emerald-400">{data?.uptime || "99.99%"}</p>
              </div>
              <div>
                <p className="text-xs text-foreground-muted font-medium">Target SLA</p>
                <p className="font-bold text-foreground">99.99%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Individual Services Matrix */}
        <div className="space-y-4 mb-12">
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground-muted">
            Microservice Endpoints
          </h3>
          <div className="space-y-3">
            {data?.services?.map((svc, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-surface-elevated/40 border border-border/70 flex items-center justify-between hover:border-brand-500/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="font-semibold text-sm text-foreground">{svc.name}</span>
                </div>

                <div className="flex items-center gap-6">
                  <span className="text-xs font-mono text-foreground-muted">
                    {svc.latencyMs >= 0 ? `${svc.latencyMs}ms latency` : "Probing..."}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {svc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System & Memory Telemetry */}
        {data?.system && (
          <div className="p-6 rounded-3xl bg-surface-base border border-border/60 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-1">
              <p className="text-xs text-foreground-muted flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-brand-400" /> Runtime Runtime
              </p>
              <p className="text-sm font-bold font-mono text-foreground">{data.system.nodeVersion} on {data.system.platform}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-foreground-muted flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-accent-400" /> Memory RSS
              </p>
              <p className="text-sm font-bold font-mono text-foreground">{data.system.memory.rssMb} MB</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-foreground-muted flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" /> Active Heap
              </p>
              <p className="text-sm font-bold font-mono text-foreground">{data.system.memory.heapUsedMb} / {data.system.memory.heapTotalMb} MB</p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
