"use client";

import { useRouter } from "next/navigation";
import LandingHero from "@/components/landing/LandingHero";
import LandingFeatures from "@/components/landing/LandingFeatures";
import TechnicalDimensions from "@/components/landing/TechnicalDimensions";
import MinimalFooter from "@/components/landing/MinimalFooter";

export default function Home() {
  const router = useRouter();

  const handleEnterPortal = () => {
    router.push("/portal/register");
  };

  return (
    <main className="flex flex-col min-h-screen bg-[#0A0B0D] font-sans text-text-primary antialiased">
      <LandingHero onEnterPortal={handleEnterPortal} />
      <LandingFeatures />
      <TechnicalDimensions />
      <MinimalFooter />
    </main>
  );
}
