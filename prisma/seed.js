const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting InertiaHub Database Seed...");

  // 1. Clean existing seed records if needed (idempotent upsert)
  const adminEmail = process.env.ADMIN_INIT_EMAIL || "admin@inertiahub.com";
  const adminPassword = process.env.ADMIN_INIT_PASSWORD || "InertiaAdmin2026!";
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      name: process.env.ADMIN_INIT_NAME || "InertiaHub Superadmin",
      isEmailVerified: true,
    },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
      name: process.env.ADMIN_INIT_NAME || "InertiaHub Superadmin",
      role: "ADMIN",
      isEmailVerified: true,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
  });

  const editorPasswordHash = await bcrypt.hash("InertiaEditor2026!", 12);
  const editor = await prisma.user.upsert({
    where: { email: "editor@inertiahub.com" },
    update: {
      passwordHash: editorPasswordHash,
      role: "EDITOR",
      name: "Lead Content Editor",
      isEmailVerified: true,
    },
    create: {
      email: "editor@inertiahub.com",
      passwordHash: editorPasswordHash,
      name: "Lead Content Editor",
      role: "EDITOR",
      isEmailVerified: true,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
  });

  console.log(`✅ Admin user seeded: ${admin.email}`);
  console.log(`✅ Editor user seeded: ${editor.email}`);

  // 2. Roles & Permissions
  const permissions = [
    { name: "Create Content", slug: "content:create", description: "Create news, blog, and pages" },
    { name: "Edit Content", slug: "content:edit", description: "Edit existing content" },
    { name: "Delete Content", slug: "content:delete", description: "Delete content" },
    { name: "Manage Users", slug: "users:manage", description: "Manage users and roles" },
    { name: "Manage Settings", slug: "settings:manage", description: "Change site settings" },
    { name: "View Analytics", slug: "analytics:view", description: "Access traffic analytics" },
    { name: "Manage Media", slug: "media:manage", description: "Upload and delete media" },
    { name: "Manage API Keys", slug: "api_keys:manage", description: "Create and revoke API keys" },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { slug: perm.slug },
      update: { name: perm.name, description: perm.description },
      create: perm,
    });
  }

  // 3. Dynamic Platform Statistics
  const statistics = [
    {
      key: "sla_availability",
      label: "Platform Availability",
      value: "99.99%",
      numericValue: 99.99,
      icon: "ShieldCheck",
      suffix: "%",
      description: "Guaranteed enterprise uptime SLA with automated multi-zone failover",
      isPublic: true,
      order: 1,
    },
    {
      key: "edge_latency",
      label: "Global Edge Latency",
      value: "12ms",
      numericValue: 12,
      icon: "Zap",
      suffix: "ms",
      description: "Sub-15 millisecond round-trip response time worldwide",
      isPublic: true,
      order: 2,
    },
    {
      key: "monthly_events",
      label: "Monthly Events Streamed",
      value: "4.8B+",
      numericValue: 4800000000,
      icon: "Activity",
      suffix: "+",
      description: "Ultra-high throughput streaming and event processing",
      isPublic: true,
      order: 3,
    },
    {
      key: "edge_nodes",
      label: "Active Edge PoPs",
      value: "140+",
      numericValue: 140,
      icon: "Globe",
      suffix: "+",
      description: "Distributed across tier-1 internet exchange points globally",
      isPublic: true,
      order: 4,
    },
  ];

  for (const stat of statistics) {
    await prisma.statistic.upsert({
      where: { key: stat.key },
      update: stat,
      create: stat,
    });
  }
  console.log("✅ Platform statistics seeded");

  // 4. Announcements
  await prisma.announcement.upsert({
    where: { id: "seed-announcement-1" },
    update: {
      title: "InertiaHub Platform 2.0 Engine is officially live",
      content: "Experience ultra-low latency event streaming, redesigned SaaS dashboard, and granular role management.",
      type: "SUCCESS",
      link: "/changelog",
      linkText: "View Release Changelog",
      isActive: true,
      priority: 10,
    },
    create: {
      id: "seed-announcement-1",
      title: "InertiaHub Platform 2.0 Engine is officially live",
      content: "Experience ultra-low latency event streaming, redesigned SaaS dashboard, and granular role management.",
      type: "SUCCESS",
      link: "/changelog",
      linkText: "View Release Changelog",
      isActive: true,
      priority: 10,
    },
  });

  // 5. News Articles
  const newsItems = [
    {
      slug: "announcing-inertiahub-global-architecture-v2",
      title: "Announcing InertiaHub Global Architecture & Edge Mesh v2.0",
      summary: "A revolutionary leap in high-throughput cloud state synchronization, edge compute orchestration, and sub-millisecond data delivery.",
      category: "Platform Updates",
      coverImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
      isPinned: true,
      status: "PUBLISHED",
      authorId: admin.id,
      content: `## The Next Evolution of Distributed Edge Infrastructure

Today, we are thrilled to officially unveil **InertiaHub Platform 2.0**—engineered from the ground up for modern engineering teams who demand uncompromising speed, resilience, and operational observability.

### Why We Built the 2.0 Mesh
As real-time applications evolve from simple client-server requests to massive distributed event ecosystems, conventional cloud architectures encounter latency bottlenecks and synchronization friction. 

InertiaHub resolves these challenges through:
1. **Intelligent Edge Routing**: Dynamic traffic balancing across 140+ Points of Presence worldwide.
2. **Automated State Replication**: CRDT-backed state synchronization with deterministic conflict resolution.
3. **Enterprise Zero-Trust Security**: Native mutual TLS (mTLS), scoped API token authorization, and TOTP authentication.

### What This Means for Teams
Developers can now deploy complex multi-region workloads with confidence, slashing latency by up to 64% while maintaining guaranteed 99.99% uptime SLAs.`,
    },
    {
      slug: "security-hardening-and-rbac-enhancements",
      title: "Security Hardening, Two-Factor Authentication & Audit Logging",
      summary: "Comprehensive upgrades to our security posture including cryptographic session tokens, TOTP support, and tamper-evident audit logs.",
      category: "Security",
      coverImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80",
      isPinned: false,
      status: "PUBLISHED",
      authorId: admin.id,
      content: `## Enterprise Security at the Core

Security is not an afterthought at InertiaHub; it is our bedrock. In this update, we have implemented several enterprise-grade security mechanisms designed to protect sensitive organization data.

### Key Security Enhancements
- **Strict Role-Based Access Control (RBAC)**: Fine-grained permissions for Admins, Editors, and Users.
- **Hardware-backed TOTP 2FA**: Standardized RFC 6238 time-based one-time password verification.
- **Continuous Audit Trail**: Immutable logging of all sensitive administrative mutations, complete with IP hashing and user-agent metadata.`,
    },
    {
      slug: "developer-ecosystem-and-rest-api-v1",
      title: "Introducing InertiaHub REST API v1 & Webhook Engine",
      summary: "Seamlessly integrate your backend systems with our versioned REST APIs, complete with rate limiting, Zod schema validation, and OpenAPI specs.",
      category: "Developer",
      coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
      isPinned: false,
      status: "PUBLISHED",
      authorId: editor.id,
      content: `## Programmatic Control with REST API v1

We believe every aspect of our platform should be programmable. Today, we are releasing the complete **InertiaHub REST API v1** suite.

### Core API Capabilities
- **Strict JSON Payloads**: Strongly validated with runtime type schemas.
- **Intelligent Sliding-Window Rate Limiting**: Ensures fair usage and shields your services against DDoS.
- **Scoped API Tokens**: Granular API keys with custom expirations and restricted privilege masks.`,
    },
  ];

  for (const item of newsItems) {
    await prisma.news.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    });
  }
  console.log("✅ News articles seeded");

  // 6. Blog Posts
  const blogPosts = [
    {
      slug: "architecting-high-throughput-distributed-systems",
      title: "Architecting High-Throughput Distributed State Engines in Modern SaaS",
      excerpt: "Deep dive into the architectural paradigms required to maintain sub-15ms response times across millions of concurrent connections.",
      tags: ["Architecture", "Engineering", "High-Availability", "Cloud"],
      readingTime: 6,
      coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      authorId: admin.id,
      content: `## The Modern Latency Frontier

When scaling real-time web platforms, every millisecond counts. Traditional relational database round-trips from client to origin server across continental distances introduce hundreds of milliseconds in unavoidable latency.

### The Multi-Tier Caching & Invalidation Model
To achieve deterministic sub-15ms edge responses, InertiaHub uses a three-tier architecture:
1. **Edge Memory Layer**: Localized hot state kept within memory at the edge node.
2. **Persistent Replica Layer**: Read-optimized distributed PostgreSQL clusters with connection pooling.
3. **Write-Ahead Consensus**: Fast-path write pipelines with optimistic UI updates.

\`\`\`typescript
// Example: Sub-millisecond localized caching strategy
export async function getCachedMetric(key: string): Promise<MetricRecord> {
  const local = await edgeCache.get(key);
  if (local) return local;
  
  const fresh = await database.metrics.findUnique({ where: { key } });
  await edgeCache.set(key, fresh, { ttl: 60 });
  return fresh;
}
\`\`\`

### Conclusion
By minimizing data transit distances and leveraging intelligent connection pools, modern SaaS platforms can deliver desktop-class responsiveness anywhere in the world.`,
    },
    {
      slug: "zero-trust-rbac-and-security-best-practices",
      title: "Zero-Trust Role-Based Access Control and Modern Session Security",
      excerpt: "A practical guide to securing multi-tenant web applications using HTTP-only session cookies, bcrypt hashing, and TOTP 2FA.",
      tags: ["Security", "Authentication", "TypeScript", "Prisma"],
      readingTime: 5,
      coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      authorId: admin.id,
      content: `## Securing Identity in High-Stakes Environments

Authentication is the front line of defense for any enterprise application. Relying purely on client-side stored tokens exposes applications to XSS vulnerabilities and session hijacking.

### 1. HTTP-Only Cookie Sessions
We utilize cryptographically signed session tokens stored in \`HttpOnly\`, \`Secure\`, and \`SameSite=Lax\` cookies. This ensures client-side JavaScript cannot directly access or leak session identifiers.

### 2. Time-Based One-Time Passwords (TOTP)
By integrating RFC 6238 TOTP, users can pair any standard authenticator app (Google Authenticator, 1Password, Bitwarden) for an additional layer of verification.

### 3. Comprehensive Audit Logging
Every privilege escalation, role modification, or credential update generates an immutable record stored with metadata for retrospective security audits.`,
    },
    {
      slug: "designing-ultra-fast-reactive-web-uis",
      title: "Designing Ultra-Fast Reactive Web UIs with Fluid Micro-Interactions",
      excerpt: "How modern dark-mode design systems, glassmorphism, and responsive layout constraints create unforgettable user experiences.",
      tags: ["UI/UX", "Design Systems", "TailwindCSS", "React"],
      readingTime: 4,
      coverImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
      status: "PUBLISHED",
      authorId: editor.id,
      content: `## Beyond Generic UI: The Art of Polish

A high-performing platform must not only run fast—it must *feel* fast and premium. Visual polish is not merely cosmetic; it communicates reliability, craftsmanship, and trust.

### Key Tenets of Luxury SaaS Design
1. **Curated Dark Theme**: Moving away from flat harsh black (#000) to rich obsidian tones (#08090d and #0f1117) with refined subtle borders.
2. **Dynamic Depth**: Multi-layered glassmorphic surfaces with delicate backdrop blurs and subtle neon accents.
3. **Intentional Motion**: Micro-interactions that acknowledge user input within 150ms without unnecessary bounce or distraction.`,
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }
  console.log("✅ Blog posts seeded");

  // 7. Changelog Releases
  const changelogs = [
    {
      version: "v2.4.0",
      title: "Next-Gen Global Edge Routing, Live Metrics & CMS Engine",
      description: "Major milestone release featuring our unified dynamic CMS, enhanced admin panel, real-time analytics engine, and sub-15ms global routing.",
      status: "PUBLISHED",
      releaseDate: new Date(),
      changes: [
        { type: "added", text: "Enterprise Admin Control Panel with dynamic CMS block editor" },
        { type: "added", text: "Automated media library with Sharp WebP image compression & thumbnail generation" },
        { type: "added", text: "Real-time anonymous page analytics tracker with device and browser breakdown" },
        { type: "added", text: "Scoped API key management with granular privilege controls" },
        { type: "changed", text: "Upgraded global edge network routing for a 40% reduction in peak TTFB" },
        { type: "fixed", text: "Resolved token expiration edge cases during concurrent session refreshes" },
        { type: "security", text: "Integrated TOTP two-factor authentication and tamper-evident audit logging" },
      ],
    },
    {
      version: "v2.3.0",
      title: "Granular RBAC, Media Storage Service & Security Hardening",
      description: "Introduced enterprise role-based permissions, media asset management, and end-to-end audit trails.",
      status: "PUBLISHED",
      releaseDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      changes: [
        { type: "added", text: "Role-Based Access Control system with Admin, Editor, and User roles" },
        { type: "added", text: "Comprehensive Audit Log tracking for all administrative operations" },
        { type: "changed", text: "Optimized database indexing for news, blog, and changelog queries" },
        { type: "fixed", text: "Fixed pagination offset calculation on high-volume message feeds" },
      ],
    },
    {
      version: "v2.2.0",
      title: "Core Performance Upgrade & Sub-Millisecond Event Pipeline",
      description: "Initial foundational release of the high-throughput InertiaHub engine and public developer API v1.",
      status: "PUBLISHED",
      releaseDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      changes: [
        { type: "added", text: "REST API v1 with Zod validation and sliding-window rate limiting" },
        { type: "added", text: "Dynamic platform statistics and status health monitoring endpoints" },
        { type: "added", text: "Newsletter subscription and contact message routing pipelines" },
      ],
    },
  ];

  for (const release of changelogs) {
    await prisma.changelog.upsert({
      where: { version: release.version },
      update: release,
      create: release,
    });
  }
  console.log("✅ Changelog releases seeded");

  // 8. Site Settings
  const defaultSettings = [
    {
      key: "site_general",
      category: "GENERAL",
      value: {
        siteName: "InertiaHub",
        tagline: "The High-Velocity SaaS & Real-Time Engine Platform",
        supportEmail: "support@inertiahub.com",
        contactEmail: "contact@inertiahub.com",
        copyright: "© 2026 InertiaHub Inc. All rights reserved.",
        maintenanceMode: false,
      },
    },
    {
      key: "site_branding",
      category: "BRANDING",
      value: {
        logoText: "InertiaHub",
        primaryColor: "#0067f5",
        accentColor: "#00f0ff",
        theme: "dark",
      },
    },
    {
      key: "site_seo",
      category: "SEO",
      value: {
        metaTitle: "InertiaHub - The High-Velocity SaaS & Real-Time Engine Platform",
        metaDescription: "InertiaHub delivers ultra-low latency event streaming, dynamic CMS architecture, and enterprise cloud infrastructure for modern teams.",
        metaKeywords: "SaaS, cloud platform, edge infrastructure, real-time analytics, CMS, high performance",
        ogImage: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80",
        twitterHandle: "@InertiaHub",
      },
    },
    {
      key: "site_security",
      category: "SECURITY",
      value: {
        enforceAdmin2FA: false,
        maxLoginAttempts: 5,
        sessionTimeoutDays: 7,
        rateLimitPerMinute: 60,
      },
    },
  ];

  for (const setting of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value, category: setting.category },
      create: { key: setting.key, value: setting.value, category: setting.category },
    });
  }
  console.log("✅ Site settings seeded");

  // 9. Dynamic Pages
  const pages = [
    {
      slug: "about",
      title: "About InertiaHub",
      description: "Our mission to empower engineering teams with uncompromising speed and modern cloud architecture.",
      status: "PUBLISHED",
      seoTitle: "About Us | InertiaHub",
      seoDescription: "Learn about the vision, team, and infrastructure behind the InertiaHub platform.",
      content: {
        hero: {
          badge: "Our Mission",
          heading: "Pioneering the Future of High-Velocity Cloud Architecture",
          subheading: "We build tools, infrastructure, and platforms that empower developers and enterprises to scale without complexity.",
        },
        sections: [
          {
            title: "Engineered for Resilience",
            body: "At InertiaHub, we engineer systems that operate seamlessly under heavy workloads. Our distributed network spans over 140 points of presence globally, delivering sub-15 millisecond response times to users everywhere.",
          },
          {
            title: "Security by Design",
            body: "Every layer of our infrastructure is built upon zero-trust principles. From cryptographic session isolation to granular role-based permissions, your data remains secure and private at all times.",
          },
          {
            title: "Developer Experience First",
            body: "We craft APIs and interfaces that developers love to use. Clean documentation, predictable REST endpoints, and dynamic CMS capabilities make integrating with InertiaHub effortless.",
          },
        ],
      },
    },
    {
      slug: "security",
      title: "Security & Compliance",
      description: "Our commitment to enterprise-grade data protection, encryption, and zero-trust architecture.",
      status: "PUBLISHED",
      seoTitle: "Security & Compliance | InertiaHub",
      seoDescription: "Explore InertiaHub's multi-layered security controls, data encryption, and compliance standards.",
      content: {
        hero: {
          badge: "Zero-Trust Architecture",
          heading: "Enterprise Security Built Into Every Layer",
          subheading: "Your data security and operational integrity are our highest priorities.",
        },
        sections: [
          {
            title: "End-to-End Encryption",
            body: "All data in transit is encrypted using modern TLS 1.3 ciphers, and sensitive stored data is hashed and encrypted at rest with industry-standard cryptographic primitives.",
          },
          {
            title: "Multi-Factor Authentication",
            body: "Hardware and app-based TOTP 2FA provides standard-compliant secondary verification for all privileged administrative accounts.",
          },
          {
            title: "Continuous Observability & Audit Logs",
            body: "Every critical system event and administrative action is logged to tamper-evident audit trails with IP and timestamp metadata.",
          },
        ],
      },
    },
  ];

  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: page,
      create: page,
    });
  }
  console.log("✅ Dynamic CMS pages seeded");

  console.log("\n🎉 Database Seed Completed Successfully!");
  console.log("-----------------------------------------");
  console.log(`Admin Login:    ${adminEmail}`);
  console.log(`Admin Password: ${adminPassword}`);
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
