import Navbar from "@/components/layout/Navbar";
import DynamicGridBackground from "@/components/ui/DynamicGridBackground";
import ScriptHero from "@/components/script/ScriptHero";
import ScriptStats from "@/components/script/ScriptStats";
import ScriptModuleShowcase from "@/components/script/ScriptModuleShowcase";
import ScriptGallery from "@/components/script/ScriptGallery";
import ScriptFeatures from "@/components/script/ScriptFeatures";
import ScriptExecutors from "@/components/script/ScriptExecutors";
import ScriptChangelogFeed from "@/components/script/ScriptChangelogFeed";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white relative selection:bg-white/20 selection:text-white">
      {/* Dense Dynamic Checkered Grid with Mouse Lighting */}
      <DynamicGridBackground />

      <Navbar />
      <main className="flex-1 relative z-10">
        <ScriptHero />
        <ScriptStats />
        <ScriptModuleShowcase />
        <ScriptGallery />
        <ScriptFeatures />
        <ScriptExecutors />
        <ScriptChangelogFeed />
      </main>
      <Footer />
    </div>
  );
}
