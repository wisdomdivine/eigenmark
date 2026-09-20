"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function TechnicalDimensions() {
  const dimensions = [
    {
      index: "DIM_01",
      title: "Invariant Coordinate Space",
      subtitle: "Frequency domain verification",
      description:
        "Extracts discrete cosine transform components into a normalized 64-bit coordinate space, enabling fast bitwise distance computation across derivative media.",
      wireframe: (
        <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-40 opacity-70">
          <line x1="20" y1="20" x2="100" y2="70" stroke="#4B5563" strokeWidth="1" />
          <line x1="220" y1="20" x2="140" y2="70" stroke="#4B5563" strokeWidth="1" />
          <line x1="20" y1="160" x2="100" y2="110" stroke="#4B5563" strokeWidth="1" />
          <line x1="220" y1="160" x2="140" y2="110" stroke="#4B5563" strokeWidth="1" />

          <rect x="20" y="20" width="200" height="140" stroke="#374151" strokeWidth="1" />
          <rect x="60" y="45" width="120" height="90" stroke="#4B5563" strokeWidth="1" />
          <rect x="100" y="70" width="40" height="40" stroke="#60A5FA" strokeWidth="1.5" />
          <circle cx="120" cy="90" r="2" fill="#60A5FA" />
        </svg>
      ),
    },
    {
      index: "DIM_02",
      title: "Agent Execution Layer",
      subtitle: "Machine to machine protocol",
      description:
        "Provides stateless Model Context Protocol endpoints over Streamable HTTP. Autonomous inference pipelines query rights, verify ancestry, and receive calldata in milliseconds.",
      wireframe: (
        <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-40 opacity-70">
          <line x1="120" y1="30" x2="0" y2="170" stroke="#4B5563" strokeWidth="1" />
          <line x1="120" y1="30" x2="40" y2="170" stroke="#4B5563" strokeWidth="1" />
          <line x1="120" y1="30" x2="80" y2="170" stroke="#4B5563" strokeWidth="1" />
          <line x1="120" y1="30" x2="120" y2="170" stroke="#60A5FA" strokeWidth="1.25" />
          <line x1="120" y1="30" x2="160" y2="170" stroke="#4B5563" strokeWidth="1" />
          <line x1="120" y1="30" x2="200" y2="170" stroke="#4B5563" strokeWidth="1" />
          <line x1="120" y1="30" x2="240" y2="170" stroke="#4B5563" strokeWidth="1" />

          <line x1="100" y1="50" x2="140" y2="50" stroke="#374151" strokeWidth="1" />
          <line x1="80" y1="75" x2="160" y2="75" stroke="#374151" strokeWidth="1" />
          <line x1="55" y1="105" x2="185" y2="105" stroke="#4B5563" strokeWidth="1" />
          <line x1="25" y1="140" x2="215" y2="140" stroke="#4B5563" strokeWidth="1" />
        </svg>
      ),
    },
    {
      index: "DIM_03",
      title: "Arbitrum Split Settlement",
      subtitle: "Deterministic value distribution",
      description:
        "Smart contracts route micro-licensing payments across two-party lineage chains in USDC, establishing programmable compensation for generative derivatives.",
      wireframe: (
        <svg viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-40 opacity-70">
          <path d="M 120 25 L 190 65 L 120 105 L 50 65 Z" stroke="#60A5FA" strokeWidth="1.25" />
          <path d="M 50 65 L 50 135 L 120 175 L 120 105" stroke="#4B5563" strokeWidth="1" />
          <path d="M 190 65 L 190 135 L 120 175" stroke="#4B5563" strokeWidth="1" />

          <line x1="50" y1="100" x2="120" y2="140" stroke="#374151" strokeWidth="1" />
          <line x1="190" y1="100" x2="120" y2="140" stroke="#374151" strokeWidth="1" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-24 bg-[#0A0B0D] text-text-primary px-6 sm:px-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-left mb-12"
        >
          <span className="text-xs font-mono uppercase tracking-widest text-[#60A5FA] block mb-2">
            Technical Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-light text-white tracking-tight">
            Engineered for precision and scale.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dimensions.map((dim, index) => (
            <motion.div
              key={dim.index}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{
                duration: 0.6,
                delay: index * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="bg-[#14161A] p-8 flex flex-col justify-between min-h-[440px] text-left transition-colors duration-150 hover:bg-[#1A1D23]"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-xs font-mono text-zinc-500">
                    {dim.index}
                  </span>
                  <span className="text-xs font-mono text-zinc-500">
                    {dim.subtitle}
                  </span>
                </div>

                <h3 className="text-xl font-light text-white mb-3 tracking-tight">
                  {dim.title}
                </h3>
                <p className="text-xs font-light text-zinc-400 leading-relaxed">
                  {dim.description}
                </p>
              </div>

              <div className="my-8 flex items-center justify-center">
                {dim.wireframe}
              </div>

              <div>
                <Link
                  href="/dashboard"
                  className="text-xs font-mono text-zinc-400 hover:text-white transition-colors duration-150 flex items-center gap-1.5"
                >
                  <span>Explore specifications</span>
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
