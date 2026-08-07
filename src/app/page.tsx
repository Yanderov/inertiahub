import Navbar from "@/components/layout/Navbar";
import DynamicGridBackground from "@/components/ui/DynamicGridBackground";
import ScriptHero from "@/components/script/ScriptHero";
import ScriptStats from "@/components/script/ScriptStats";
import ScriptModuleShowcase from "@/components/script/ScriptModuleShowcase";
import ScriptCodeViewer from "@/components/script/ScriptCodeViewer";
import ScriptGallery from "@/components/script/ScriptGallery";
import ScriptFeatures from "@/components/script/ScriptFeatures";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] text-[#f4f4f5] relative selection:bg-white/20 selection:text-white">
      {/* Dynamic Grid Background */}
      <DynamicGridBackground />

      <Navbar />
      <main className="flex-1 relative z-10">
        <ScriptHero />
        <ScriptStats />
        <ScriptModuleShowcase />
        <ScriptCodeViewer />
        <ScriptGallery />
        <ScriptFeatures />
      </main>
      <Footer />
    </div>
  );
}
