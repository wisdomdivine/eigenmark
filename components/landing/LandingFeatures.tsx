"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingFeatures() {
  const modules = [
    {
      index: "01",
      title: "Perceptual Signatures",
      description:
        "Extracts 64-bit DCT perceptual hashes in browser. Preserves structural invariants across compression, format transcoding, and scaling.",
      schematic: (
        <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-24 h-16">
          <circle cx="60" cy="40" r="32" stroke="#4B5563" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="60" cy="40" r="22" stroke="#4B5563" strokeWidth="1" />
          <circle cx="60" cy="40" r="12" stroke="#60A5FA" strokeWidth="1.5" />
          <circle cx="60" cy="40" r="3" fill="#60A5FA" />
          <line x1="20" y1="40" x2="100" y2="40" stroke="#4B5563" strokeWidth="0.75" />
          <line x1="60" y1="0" x2="60" y2="80" stroke="#4B5563" strokeWidth="0.75" />
        </svg>
      ),
    },
    {
      index: "02",
      title: "Lineage DAG Resolution",
      description:
        "Traverses recursive parent hashes to identify derivative relations, preserving chronological attribution for original creators.",
      schematic: (
        <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-24 h-16">
          <path d="M 20 40 C 45 40, 55 18, 95 18" stroke="#4B5563" strokeWidth="1.25" />
          <path d="M 20 40 C 45 40, 55 40, 95 40" stroke="#60A5FA" strokeWidth="1.25" />
          <path d="M 20 40 C 45 40, 55 62, 95 62" stroke="#4B5563" strokeWidth="1.25" />
          <circle cx="20" cy="40" r="4" fill="#60A5FA" />
          <circle cx="95" cy="18" r="3" fill="#9CA3AF" />
          <circle cx="95" cy="40" r="3" fill="#60A5FA" />
          <circle cx="95" cy="62" r="3" fill="#9CA3AF" />
        </svg>
      ),
    },
    {
      index: "03",
      title: "Model Context Protocol",
      description:
        "Exposes Streamable HTTP and STDIO endpoints for autonomous agents to inspect provenance, check policies, and prepare calldata.",
      schematic: (
        <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-24 h-16">
          <rect x="52" y="32" width="16" height="16" fill="#60A5FA" />
          <line x1="60" y1="32" x2="60" y2="12" stroke="#4B5563" strokeWidth="1" />
          <line x1="60" y1="48" x2="60" y2="68" stroke="#4B5563" strokeWidth="1" />
          <line x1="52" y1="40" x2="28" y2="40" stroke="#4B5563" strokeWidth="1" />
          <line x1="68" y1="40" x2="92" y2="40" stroke="#4B5563" strokeWidth="1" />
          <circle cx="60" cy="12" r="2.5" fill="#9CA3AF" />
          <circle cx="60" cy="68" r="2.5" fill="#9CA3AF" />
          <circle cx="28" cy="40" r="2.5" fill="#9CA3AF" />
          <circle cx="92" cy="40" r="2.5" fill="#9CA3AF" />
        </svg>
      ),
    },
    {
      index: "04",
      title: "Arbitrum Settlement",
      description:
        "Solidity contracts execute atomic two-party royalty splits in USDC on Arbitrum Sepolia with sub-cent transaction gas costs.",
      schematic: (
        <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-24 h-16">
          <rect x="18" y="34" width="14" height="14" fill="#60A5FA" />
          <path d="M 32 41 L 62 41 L 76 22 L 94 22" stroke="#4B5563" strokeWidth="1" />
          <path d="M 62 41 L 76 60 L 94 60" stroke="#4B5563" strokeWidth="1" />
          <rect x="94" y="16" width="12" height="12" fill="#1F2937" stroke="#9CA3AF" strokeWidth="1" />
          <rect x="94" y="54" width="12" height="12" fill="#1F2937" stroke="#9CA3AF" strokeWidth="1" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-24 bg-[#0A0B0D] text-text-primary px-6 sm:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Metric Summary Line with Staggered Entrance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 pb-20 mb-20 text-left"
        >
          <div>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block mb-2">
              Invariant Fingerprint
            </span>
            <span className="text-4xl sm:text-5xl font-light text-white tracking-tight">
              64-bit DCT
            </span>
          </div>
          <div>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block mb-2">
              L2 Settlement Gas
            </span>
            <span className="text-4xl sm:text-5xl font-light text-white tracking-tight">
              &lt; 85,000
            </span>
          </div>
          <div>
            <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block mb-2">
              Protocol Standard
            </span>
            <span className="text-4xl sm:text-5xl font-light text-white tracking-tight">
              MCP 2.0
            </span>
          </div>
        </motion.div>

        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-left mb-12"
        >
          <span className="text-xs font-mono uppercase tracking-widest text-[#60A5FA] block mb-2">
            Architecture Modules
          </span>
          <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
            Infrastructure built for machine verification.
          </h2>
        </motion.div>

        {/* 4-Column Flat Surface Cards with Stagger */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((item, index) => (
            <motion.div
              key={item.index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="bg-[#14161A] p-6 rounded-none flex flex-col justify-between min-h-[340px] text-left transition-colors duration-150 hover:bg-[#1A1D23]"
            >
              <div>
                <span className="text-xs font-mono text-zinc-500 block mb-4">
                  {item.index}
                </span>
                <h3 className="text-base font-normal text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs font-light text-zinc-400 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="my-6 flex items-center justify-center py-4">
                {item.schematic}
              </div>

              <div className="pt-2">
                <Link
                  href="/dashboard"
                  className="text-xs font-mono text-zinc-400 hover:text-white transition-colors duration-150 flex items-center gap-1.5"
                >
                  <span>Inspect module</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
