import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div className="bg-[#f8f9fb] relative min-h-screen w-full font-sans text-gray-900">
      <LandingNavbar />
      
      <main className="flex flex-col w-full">
        <LandingHero />
        <LandingFeatures />
      </main>

      <LandingFooter />
    </div>
  );
}
