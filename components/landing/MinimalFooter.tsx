"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function MinimalFooter() {
  return (
    <footer className="w-full bg-[#0A0B0D] text-text-primary px-6 sm:px-12 pt-20 pb-16">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-16 pb-16"
        >
          {/* Left: Primary Navigation Links */}
          <div className="flex flex-col gap-3 text-left">
            <span className="text-xs font-mono uppercase tracking-widest text-[#60A5FA] mb-2 block">
              Navigation
            </span>
            <Link
              href="/dashboard"
              className="text-2xl sm:text-3xl font-light text-zinc-300 hover:text-white transition-colors duration-150 tracking-tight"
            >
              Provenance Registry
            </Link>
            <Link
              href="/dashboard"
              className="text-2xl sm:text-3xl font-light text-zinc-300 hover:text-white transition-colors duration-150 tracking-tight"
            >
              Invariant Radar
            </Link>
            <a
              href="https://www.eigenmark.app/api/mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl sm:text-3xl font-light text-zinc-300 hover:text-white transition-colors duration-150 tracking-tight"
            >
              MCP Specification
            </a>
            <Link
              href="/portal/register"
              className="text-2xl sm:text-3xl font-light text-zinc-300 hover:text-white transition-colors duration-150 tracking-tight"
            >
              Settlement Console
            </Link>
            <a
              href="https://github.com/wisdomdivine/eigenmark"
              target="_blank"
              rel="noopener noreferrer"
              className="text-2xl sm:text-3xl font-light text-zinc-300 hover:text-white transition-colors duration-150 tracking-tight"
            >
              GitHub Repository
            </a>
          </div>

          {/* Right: Technical Protocol Metadata */}
          <div className="flex flex-col justify-between text-left">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-[#60A5FA] mb-4 block">
                Protocol Telemetry
              </span>

              <div className="flex flex-col gap-4 text-xs font-mono text-zinc-400">
                <div>
                  <span className="text-zinc-600 block text-[10px] uppercase tracking-wider">
                    Settlement Layer
                  </span>
                  <span className="text-zinc-200">
                    Arbitrum Sepolia Testnet (Chain ID: 421614)
                  </span>
                </div>

                <div>
                  <span className="text-zinc-600 block text-[10px] uppercase tracking-wider">
                    Split Contract
                  </span>
                  <span className="text-zinc-200 break-all">
                    0x71207757FB3F8118EC0BAb8f2251E09973892306
                  </span>
                </div>

                <div>
                  <span className="text-zinc-600 block text-[10px] uppercase tracking-wider">
                    Agent Protocol
                  </span>
                  <span className="text-zinc-200">
                    Model Context Protocol (Streamable HTTP / STDIO)
                  </span>
                </div>

                <div>
                  <span className="text-zinc-600 block text-[10px] uppercase tracking-wider">
                    License
                  </span>
                  <span className="text-zinc-200">
                    MIT Open Source
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-8 text-xs font-mono text-zinc-500">
              Autonomous verification infrastructure for generative AI media.
            </div>
          </div>
        </motion.div>

        {/* Minimal Sub-Footer Divider Line */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-zinc-500"
        >
          <div>
            &copy; 2026 Eigenmark. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/wisdomdivine/eigenmark"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition-colors duration-150"
            >
              Source Code
            </a>
            <a
              href="https://www.eigenmark.app/api/mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition-colors duration-150"
            >
              API Endpoint
            </a>
            <a
              href="https://sepolia.arbiscan.io/address/0x71207757FB3F8118EC0BAb8f2251E09973892306"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 transition-colors duration-150"
            >
              Arbiscan
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
