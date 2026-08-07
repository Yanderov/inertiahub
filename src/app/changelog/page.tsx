import Navbar from "@/components/layout/Navbar";
import DynamicGridBackground from "@/components/ui/DynamicGridBackground";
import Footer from "@/components/layout/Footer";

export default function ChangelogPage() {
  const releases = [
    {
      id: "v2.4.0",
      version: "v2.4.0",
      title: "Ultra Desync & Quantum Blink Gun Grab",
      date: "Latest",
      changes: [
        "Rebuilt Desync Engine from scratch with 6 modes: Ultra Jitter, Hyper Orbit, Teleport Blink, Sky/Void, and Chaos",
        "Quantum Blink Gun Grab: 0ms dropped gun pickup with multi-limb touch replication",
        "Velocity Desync with Break Predict & Sky Launch to evade aimbots",
        "Fixed Sheriff Silent Aim remote call signature and vector calculation",
        "Exclusive optimizations for Potassium, Volt, and Velocity internal executors",
      ],
    },
    {
      id: "v2.3.0",
      version: "v2.3.0",
      title: "Silent Aim & ESP Overhaul",
      date: "Previous",
      changes: [
        "Rebuilt Sheriff and Knife silent aim with predictive trajectory compensation",
        "Full role ESP with color-coded highlights and gun drop tracers",
        "Pixel Surf Engine for smooth slope movement and auto bunny-hop",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-black text-white relative selection:bg-white/20 selection:text-white">
      <DynamicGridBackground />
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 w-full relative z-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-white" />
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              Version History
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Changelog
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Murder Mystery 2 script update history and engine patches.
          </p>
        </div>

        {/* Releases */}
        <div className="space-y-4">
          {releases.map((rel) => (
            <div
              key={rel.id}
              className="p-5 rounded-2xl bg-[#0c0c0c]/85 border border-zinc-800 backdrop-blur-sm shadow-md"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold font-mono text-white">
                    {rel.version}
                  </span>
                  <span className="text-xs text-zinc-400 font-medium">
                    — {rel.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-800">
                  {rel.date}
                </span>
              </div>

              <ul className="space-y-2 text-xs text-zinc-400">
                {rel.changes.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-zinc-400 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
