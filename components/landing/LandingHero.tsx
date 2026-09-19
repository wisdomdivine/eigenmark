"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/context/StateContext";
import WalletModal from "@/components/ui/WalletModal";

interface LandingHeroProps {
  onEnterPortal: () => void;
}

export default function LandingHero({ onEnterPortal }: LandingHeroProps) {
  const router = useRouter();
  const { isConnected, connectWallet, currentUser, disconnectWallet } = useAppState();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAction = () => {
    if (isConnected) {
      router.push("/portal/register");
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <section className="relative w-full min-h-screen bg-[#0A0B0D] text-text-primary flex flex-col justify-between overflow-hidden">
      {/* Subtle Dot Matrix Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Top Navigation Bar */}
      <header className="relative z-30 w-full px-6 sm:px-12 py-6 flex items-center justify-between border-b border-white/[0.06] bg-[#0A0B0D]/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Eigenmark Logo" className="w-7 h-7 object-contain" />
          <span className="text-lg font-light tracking-tight text-white">
            Eigenmark
          </span>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-widest text-zinc-400">
          <a href="#lineage" className="hover:text-white transition-colors duration-200">
            Lineage
          </a>
          <a href="#radar" className="hover:text-white transition-colors duration-200">
            Invariant Radar
          </a>
          <a href="#mcp" className="hover:text-white transition-colors duration-200">
            MCP Protocol
          </a>
          <a href="#settlement" className="hover:text-white transition-colors duration-200">
            Settlement
          </a>
          <a 
            href="https://github.com/wisdomdivine/eigenmark" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-white transition-colors duration-200"
          >
            Docs
          </a>
        </nav>

        {/* Wallet & Portal Actions */}
        <div className="flex items-center gap-3">
          {isConnected ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-zinc-400 hidden sm:inline-block">
                {currentUser.address.substring(0, 6)}...{currentUser.address.slice(-4)}
              </span>
              <button
                onClick={disconnectWallet}
                className="px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition-colors duration-200"
              >
                Disconnect
              </button>
              <button
                onClick={() => router.push("/portal/register")}
                className="px-5 py-2 text-xs font-mono uppercase tracking-wider text-black bg-white hover:bg-zinc-200 transition-colors duration-200 rounded-full cursor-pointer"
              >
                Enter Portal
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2 text-xs font-mono uppercase tracking-wider text-white border border-white/20 hover:border-white/40 hover:bg-white/[0.04] transition-all duration-200 rounded-full cursor-pointer"
              >
                Connect Wallet
              </button>
              <button
                onClick={handleAction}
                className="px-5 py-2 text-xs font-mono uppercase tracking-wider text-black bg-[#60A5FA] hover:bg-white transition-colors duration-200 rounded-full cursor-pointer"
              >
                Launch Console
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Typography & CTA */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 pt-20 sm:pt-28 pb-12 flex flex-col items-center text-center">
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-white leading-[1.12] max-w-4xl">
          Where autonomous AI agents{" "}
          <span className="text-[#60A5FA]">verify rights.</span>
        </h1>

        <p className="text-sm sm:text-base md:text-lg font-light text-zinc-400 max-w-2xl mt-6 leading-relaxed">
          Compute perceptual invariants, verify multi-generation parent lineage, and execute atomic royalty splits via Model Context Protocol.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
          <button
            onClick={handleAction}
            className="px-7 py-3 text-xs font-mono uppercase tracking-widest text-black bg-[#60A5FA] hover:bg-white transition-colors duration-200 rounded-full cursor-pointer"
          >
            {isConnected ? "Launch Portal Console" : "Launch Console"}
          </button>
          <a
            href="https://www.eigenmark.app/api/mcp"
            target="_blank"
            rel="noopener noreferrer"
            className="px-7 py-3 text-xs font-mono uppercase tracking-widest text-white border border-white/20 hover:border-white/40 hover:bg-white/[0.04] transition-all duration-200 rounded-full"
          >
            View MCP Endpoint
          </a>
        </div>
      </div>

      {/* Bottom Generative Data Mosaic (Pixel Matrix + Halftone Raster Structure) */}
      <div className="relative z-10 w-full h-44 sm:h-56 md:h-64 mt-auto overflow-hidden pointer-events-none select-none">
        {/* Left Side: Stepped Pixel Square Matrix */}
        <div className="absolute bottom-0 left-0 flex items-end">
          <svg
            className="w-[280px] sm:w-[420px] md:w-[560px] h-[180px] sm:h-[220px] md:h-[250px]"
            viewBox="0 0 400 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Column 1 (Leftmost edge) */}
            <rect x="0" y="20" width="16" height="16" fill="#60A5FA" fillOpacity="0.85" />
            <rect x="0" y="40" width="16" height="16" fill="#93C5FD" fillOpacity="0.95" />
            <rect x="0" y="60" width="16" height="16" fill="#3B82F6" fillOpacity="0.75" />
            <rect x="0" y="80" width="16" height="16" fill="#60A5FA" fillOpacity="0.9" />
            <rect x="0" y="100" width="16" height="16" fill="#BFDBFE" fillOpacity="0.7" />
            <rect x="0" y="120" width="16" height="16" fill="#60A5FA" fillOpacity="0.8" />
            <rect x="0" y="140" width="16" height="16" fill="#3B82F6" fillOpacity="0.85" />
            <rect x="0" y="160" width="16" height="16" fill="#93C5FD" fillOpacity="0.9" />
            <rect x="0" y="180" width="16" height="16" fill="#60A5FA" fillOpacity="0.75" />

            {/* Column 2 */}
            <rect x="20" y="40" width="16" height="16" fill="#BFDBFE" fillOpacity="0.8" />
            <rect x="20" y="60" width="16" height="16" fill="#60A5FA" fillOpacity="0.9" />
            <rect x="20" y="80" width="16" height="16" fill="#93C5FD" fillOpacity="0.7" />
            <rect x="20" y="100" width="16" height="16" fill="#3B82F6" fillOpacity="0.85" />
            <rect x="20" y="120" width="16" height="16" fill="#60A5FA" fillOpacity="0.8" />
            <rect x="20" y="140" width="16" height="16" fill="#BFDBFE" fillOpacity="0.95" />
            <rect x="20" y="160" width="16" height="16" fill="#3B82F6" fillOpacity="0.75" />
            <rect x="20" y="180" width="16" height="16" fill="#60A5FA" fillOpacity="0.85" />

            {/* Column 3 */}
            <rect x="40" y="60" width="16" height="16" fill="#60A5FA" fillOpacity="0.85" />
            <rect x="40" y="80" width="16" height="16" fill="#93C5FD" fillOpacity="0.9" />
            <rect x="40" y="100" width="16" height="16" fill="#60A5FA" fillOpacity="0.7" />
            <rect x="40" y="120" width="16" height="16" fill="#BFDBFE" fillOpacity="0.85" />
            <rect x="40" y="140" width="16" height="16" fill="#3B82F6" fillOpacity="0.8" />
            <rect x="40" y="160" width="16" height="16" fill="#60A5FA" fillOpacity="0.95" />
            <rect x="40" y="180" width="16" height="16" fill="#93C5FD" fillOpacity="0.75" />

            {/* Column 4 */}
            <rect x="60" y="80" width="16" height="16" fill="#3B82F6" fillOpacity="0.8" />
            <rect x="60" y="100" width="16" height="16" fill="#BFDBFE" fillOpacity="0.9" />
            <rect x="60" y="120" width="16" height="16" fill="#60A5FA" fillOpacity="0.75" />
            <rect x="60" y="140" width="16" height="16" fill="#93C5FD" fillOpacity="0.85" />
            <rect x="60" y="160" width="16" height="16" fill="#60A5FA" fillOpacity="0.8" />
            <rect x="60" y="180" width="16" height="16" fill="#3B82F6" fillOpacity="0.9" />

            {/* Column 5 */}
            <rect x="80" y="100" width="16" height="16" fill="#60A5FA" fillOpacity="0.85" />
            <rect x="80" y="120" width="16" height="16" fill="#93C5FD" fillOpacity="0.75" />
            <rect x="80" y="140" width="16" height="16" fill="#BFDBFE" fillOpacity="0.9" />
            <rect x="80" y="160" width="16" height="16" fill="#3B82F6" fillOpacity="0.8" />
            <rect x="80" y="180" width="16" height="16" fill="#60A5FA" fillOpacity="0.85" />

            {/* Column 6 */}
            <rect x="100" y="120" width="16" height="16" fill="#BFDBFE" fillOpacity="0.8" />
            <rect x="100" y="140" width="16" height="16" fill="#60A5FA" fillOpacity="0.9" />
            <rect x="100" y="160" width="16" height="16" fill="#93C5FD" fillOpacity="0.75" />
            <rect x="100" y="180" width="16" height="16" fill="#3B82F6" fillOpacity="0.85" />

            {/* Column 7 */}
            <rect x="120" y="140" width="16" height="16" fill="#60A5FA" fillOpacity="0.85" />
            <rect x="120" y="160" width="16" height="16" fill="#BFDBFE" fillOpacity="0.7" />
            <rect x="120" y="180" width="16" height="16" fill="#60A5FA" fillOpacity="0.9" />

            {/* Column 8 */}
            <rect x="140" y="160" width="16" height="16" fill="#93C5FD" fillOpacity="0.8" />
            <rect x="140" y="180" width="16" height="16" fill="#3B82F6" fillOpacity="0.85" />

            {/* Column 9 */}
            <rect x="160" y="180" width="16" height="16" fill="#60A5FA" fillOpacity="0.75" />
          </svg>
        </div>

        {/* Right Side: Halftone Dot Matrix + Frequency Scanlines */}
        <div className="absolute bottom-0 right-0 flex items-end justify-end">
          <svg
            className="w-[280px] sm:w-[420px] md:w-[560px] h-[180px] sm:h-[220px] md:h-[250px]"
            viewBox="0 0 400 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Top Right Ascending Circles */}
            <circle cx="380" cy="20" r="8" fill="#93C5FD" fillOpacity="0.9" />
            <circle cx="360" cy="30" r="8" fill="#60A5FA" fillOpacity="0.8" />
            <circle cx="380" cy="40" r="8" fill="#3B82F6" fillOpacity="0.85" />

            <circle cx="340" cy="45" r="8" fill="#BFDBFE" fillOpacity="0.75" />
            <circle cx="360" cy="55" r="8" fill="#60A5FA" fillOpacity="0.9" />
            <circle cx="380" cy="65" r="8" fill="#93C5FD" fillOpacity="0.8" />

            <circle cx="320" cy="60" r="8" fill="#60A5FA" fillOpacity="0.85" />
            <circle cx="340" cy="70" r="8" fill="#3B82F6" fillOpacity="0.7" />
            <circle cx="360" cy="80" r="8" fill="#BFDBFE" fillOpacity="0.9" />
            <circle cx="380" cy="90" r="8" fill="#60A5FA" fillOpacity="0.85" />

            <circle cx="300" cy="80" r="8" fill="#93C5FD" fillOpacity="0.8" />
            <circle cx="320" cy="90" r="8" fill="#60A5FA" fillOpacity="0.75" />
            <circle cx="340" cy="100" r="8" fill="#BFDBFE" fillOpacity="0.9" />
            <circle cx="360" cy="110" r="8" fill="#3B82F6" fillOpacity="0.85" />
            <circle cx="380" cy="120" r="8" fill="#60A5FA" fillOpacity="0.9" />

            <circle cx="280" cy="100" r="8" fill="#60A5FA" fillOpacity="0.75" />
            <circle cx="300" cy="110" r="8" fill="#BFDBFE" fillOpacity="0.85" />
            <circle cx="320" cy="120" r="8" fill="#93C5FD" fillOpacity="0.7" />
            <circle cx="340" cy="130" r="8" fill="#60A5FA" fillOpacity="0.9" />
            <circle cx="360" cy="140" r="8" fill="#3B82F6" fillOpacity="0.8" />
            <circle cx="380" cy="150" r="8" fill="#BFDBFE" fillOpacity="0.95" />

            <circle cx="260" cy="120" r="8" fill="#93C5FD" fillOpacity="0.85" />
            <circle cx="280" cy="130" r="8" fill="#60A5FA" fillOpacity="0.8" />
            <circle cx="300" cy="140" r="8" fill="#3B82F6" fillOpacity="0.75" />
            <circle cx="320" cy="150" r="8" fill="#BFDBFE" fillOpacity="0.9" />
            <circle cx="340" cy="160" r="8" fill="#60A5FA" fillOpacity="0.85" />
            <circle cx="360" cy="170" r="8" fill="#93C5FD" fillOpacity="0.8" />
            <circle cx="380" cy="180" r="8" fill="#3B82F6" fillOpacity="0.9" />

            <circle cx="240" cy="140" r="8" fill="#60A5FA" fillOpacity="0.75" />
            <circle cx="260" cy="150" r="8" fill="#BFDBFE" fillOpacity="0.85" />
            <circle cx="280" cy="160" r="8" fill="#93C5FD" fillOpacity="0.7" />
            <circle cx="300" cy="170" r="8" fill="#60A5FA" fillOpacity="0.9" />
            <circle cx="320" cy="180" r="8" fill="#3B82F6" fillOpacity="0.85" />

            <circle cx="220" cy="160" r="8" fill="#93C5FD" fillOpacity="0.8" />
            <circle cx="240" cy="170" r="8" fill="#60A5FA" fillOpacity="0.75" />
            <circle cx="260" cy="180" r="8" fill="#BFDBFE" fillOpacity="0.9" />

            <circle cx="200" cy="180" r="8" fill="#60A5FA" fillOpacity="0.85" />
          </svg>
        </div>
      </div>

      {/* Wallet Connection Modal Overlay */}
      <WalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={connectWallet}
      />
    </section>
  );
}
