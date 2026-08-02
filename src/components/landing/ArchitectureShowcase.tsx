"use client";

import { useState } from "react";
import { Terminal, Copy, CheckCircle, Database, Lock, Code2, Globe, Cpu } from "lucide-react";

export default function ArchitectureShowcase() {
  const [activeTab, setActiveTab] = useState<"api" | "auth" | "db" | "sdk">("api");
  const [copied, setCopied] = useState(false);

  const tabs = [
    { id: "api", label: "REST API v1", icon: Code2 },
    { id: "auth", label: "Zero-Trust Auth", icon: Lock },
    { id: "db", label: "PostgreSQL & Prisma", icon: Database },
    { id: "sdk", label: "TypeScript SDK", icon: Cpu },
  ];

  const codeSnippets: Record<string, string> = {
    api: `// Fetch dynamic platform news with pagination & category filtering
const response = await fetch("https://api.inertiahub.io/v1/news?category=ENGINEERING&page=1&limit=10", {
  headers: {
    "Authorization": "Bearer inhub_live_9f83a71bc9d3e84",
    "Content-Type": "application/json"
  }
});

const { data, pagination } = await response.json();
console.log(\`Fetched \${data.length} articles across \${pagination.totalPages} pages\`);`,

    auth: `// Zero-Trust Session Verification Middleware
export async function verifyPlatformSession(token: string) {
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true }
  });

  if (!session || session.expiresAt < new Date()) {
    throw new UnauthorizedException("Session invalid or expired");
  }

  // Enforce Hardware-backed 2FA if configured
  if (session.user.isTwoFactorEnabled && !session.twoFactorVerified) {
    return { requireTotp: true, userId: session.user.id };
  }

  return { authenticated: true, user: session.user };
}`,

    db: `// Production PostgreSQL schema model
model News {
  id          String     @id @default(cuid())
  title       String
  slug        String     @unique
  summary     String?    @db.Text
  content     String     @db.Text
  category    String     @default("ANNOUNCEMENT")
  status      PostStatus @default(PUBLISHED)
  views       Int        @default(0)
  publishedAt DateTime?  @default(now())
  author      User       @relation(fields: [authorId], references: [id])
  authorId    String

  @@index([status, category, publishedAt])
}`,

    sdk: `import { InertiaClient } from "@inertiahub/sdk";

const client = new InertiaClient({
  apiKey: process.env.INERTIAHUB_API_KEY,
  environment: "production"
});

// Stream real-time cluster telemetry
const telemetry = await client.telemetry.getLiveHealth();
console.log("Database Latency:", telemetry.services.database.latencyMs, "ms");`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="architecture" className="py-20 sm:py-32 relative bg-surface-subtle/50 border-t border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Descriptions */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent-500/10 text-accent-400 border border-accent-500/20">
              <Cpu className="w-3.5 h-3.5" />
              Developer Experience
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              A clean, type-safe API that developers actually love
            </h2>

            <p className="text-foreground-muted leading-relaxed">
              Every route in InertiaHub is strictly validated with Zod schemas, backed by full PostgreSQL relations, and exposed through versioned REST endpoints.
            </p>

            {/* Feature Bullets */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Complete Open Type System</h4>
                  <p className="text-xs text-foreground-muted">Prisma generates runtime types for full compile-time validation.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Zero Leaks Rate Limiting</h4>
                  <p className="text-xs text-foreground-muted">Sliding token bucket rate limiters prevent API abuse without latency spikes.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-accent-500/20 text-accent-400 flex items-center justify-center shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Granular Permission Tokens</h4>
                  <p className="text-xs text-foreground-muted">Provision scoped API keys with strict read/write permission arrays.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Code Showcase */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-surface-base border border-border shadow-2xl overflow-hidden backdrop-blur-xl">
              {/* Tab Selector */}
              <div className="flex items-center justify-between px-4 py-3 bg-surface-elevated/70 border-b border-border/80 overflow-x-auto">
                <div className="flex items-center gap-1.5">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-brand-500/15 text-brand-300 border border-brand-500/30 shadow-sm"
                            : "text-foreground-muted hover:text-foreground hover:bg-surface-base"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-surface-base transition-colors shrink-0"
                  aria-label="Copy snippet"
                >
                  {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Code Editor Body */}
              <div className="p-6 font-mono text-xs text-foreground-subtle overflow-x-auto bg-[#0a0d14] leading-relaxed">
                <pre>
                  <code>{codeSnippets[activeTab]}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
