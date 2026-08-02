import Navbar from "@/components/layout/Navbar";
import DynamicGridBackground from "@/components/ui/DynamicGridBackground";
import Footer from "@/components/layout/Footer";

export default function ChangelogPage() {
  const releases = [
    {
      id: "v3.5.0",
      version: "v3.5.0",
      title: "Multi-Game Engine & Internal Executor Support",
      date: "Latest",
      changes: [
        "Added Pressure (Hadal Blacksite) script with monster warning radar, keycard ESP & infinite oxygen",
        "Added Demonology ghost hunting suite with ghost ESP, automated evidence logging & sanity tracker",
        "Added Murder Mystery 2 role ESP, knife silent aim & pixel surf engine",
        "Exclusive optimizations for Potassium, Volt, and Velocity internal executors",
      ],
    },
    {
      id: "v3.4.0",
      version: "v3.4.0",
      title: "Universal Loader & Atmospheric Post-Processing",
      date: "Previous",
      changes: [
        "Automated game detection upon injection",
        "10 built-in colorway themes (Graphite, Ocean, Forest, Wine, Violet, etc.)",
        "Multilingual UI with English, Russian, Ukrainian & Spanish support",
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
            Multi-game script update history and internal injector patches.
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
