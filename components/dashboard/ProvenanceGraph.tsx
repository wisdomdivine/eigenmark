"use client";

import { useState } from "react";
import {
  IconNetwork,
  IconRadar,
  IconChartPie,
  IconArrowUpRight,
  IconFingerprint,
  IconCheck,
} from "@tabler/icons-react";

interface Asset {
  id: string;
  title: string;
  description: string;
  aiModel: string;
  contentHash: string;
  royaltySplit: number;
  creatorAddress: string;
  parentId?: string;
  phash?: string;
  mediaUrl?: string;
  timestamp: string;
  transactionHash: string;
}

interface ProvenanceGraphProps {
  assets: Array<Asset>;
}

export default function ProvenanceGraph({ assets }: ProvenanceGraphProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    assets.length > 0 ? assets[0].id : ""
  );
  const [viewMode, setViewMode] = useState<"network" | "radar" | "composition">("network");

  const selectedAsset = assets.find((a) => a.id === selectedAssetId) || (assets.length > 0 ? assets[0] : null);

  const parentAssets = assets.filter((a) => !a.parentId);
  const derivativeAssets = assets.filter((a) => a.parentId);

  // Compute stats for header
  const totalAssets = assets.length;
  const derivativeCount = derivativeAssets.length;
  const avgSplit =
    assets.length > 0
      ? (assets.reduce((acc, a) => acc + (a.royaltySplit || 0), 0) / assets.length).toFixed(1)
      : "10.0";

  return (
    <div className="w-full max-w-6xl mx-auto my-8 flex flex-col gap-6 select-none font-sans">
      {/* Top Header & High-Impact Metric Banner (Inspired by Reference Designs) */}
      <div className="bg-surface p-8 rounded-3xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
            <span className="text-[10px] uppercase tracking-widest text-brand font-normal">
              Eigenmark Provenance Topology
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-light text-text-primary tracking-tight">
            Lineage Network Graph
          </h1>
          <p className="text-xs font-light text-text-muted mt-1 leading-relaxed max-w-xl">
            Deterministic mapping of original creative works, derived variants, and downstream automated smart contract royalty splits.
          </p>
        </div>

        {/* Big Numbers KPI Strip */}
        <div className="flex items-center gap-8 bg-surface-active/30 px-6 py-4 rounded-2xl">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-text-muted block font-mono">
              Network Nodes
            </span>
            <span className="text-3xl font-light text-text-primary tracking-tight">
              {totalAssets}
            </span>
          </div>
          <div className="h-8 w-[1px] bg-surface-active"></div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-text-muted block font-mono">
              Derivatives
            </span>
            <span className="text-3xl font-light text-brand tracking-tight">
              {derivativeCount}
            </span>
          </div>
          <div className="h-8 w-[1px] bg-surface-active"></div>
          <div>
            <span className="text-[10px] uppercase tracking-wider text-text-muted block font-mono">
              Avg Split
            </span>
            <span className="text-3xl font-light text-success tracking-tight">
              {avgSplit}%
            </span>
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas & View Modes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Visualization Panel (8 Cols) */}
        <div className="lg:col-span-8 bg-surface p-6 sm:p-8 rounded-3xl flex flex-col justify-between min-h-[520px] relative overflow-hidden">
          {/* View Mode Switcher Tabs */}
          <div className="flex items-center justify-between pb-6 z-10">
            <div className="flex items-center gap-1.5 bg-surface-active/50 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("network")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-light transition-all duration-200 cursor-pointer ${
                  viewMode === "network"
                    ? "bg-brand text-background font-normal"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <IconNetwork size={14} />
                <span>Lineage Tree</span>
              </button>
              <button
                onClick={() => setViewMode("radar")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-light transition-all duration-200 cursor-pointer ${
                  viewMode === "radar"
                    ? "bg-brand text-background font-normal"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <IconRadar size={14} />
                <span>Invariant Radar</span>
              </button>
              <button
                onClick={() => setViewMode("composition")}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-light transition-all duration-200 cursor-pointer ${
                  viewMode === "composition"
                    ? "bg-brand text-background font-normal"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <IconChartPie size={14} />
                <span>Royalty Cluster</span>
              </button>
            </div>

            <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider hidden sm:block">
              Interactive Explorer
            </span>
          </div>

          {/* Canvas Background Grid (Dotted matrix inspired by Reference 4) */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#60A5FA 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />

          {/* VIEW 1: Lineage Network Tree */}
          {viewMode === "network" && (() => {
            const hasDerivatives = derivativeAssets.length > 0;
            const parentCx = hasDerivatives ? 170 : 325;
            const derivativeCx = 475;
            const maxRows = Math.max(parentAssets.length, derivativeAssets.length, 1);
            const rowSpacing = 135;
            const startY = 75;
            const dynamicSvgHeight = Math.max(400, startY + maxRows * rowSpacing + 50);

            return (
              <div className="w-full flex-1 flex flex-col items-center justify-start relative min-h-[380px] max-h-[500px] overflow-y-auto overflow-x-hidden pr-2">
                {assets.length === 0 ? (
                  <div className="text-center py-16 m-auto">
                    <p className="text-xs font-light text-text-muted">
                      No provenance assets anchored yet. Register or derive an asset to populate the graph.
                    </p>
                  </div>
                ) : (
                  <svg
                    width="100%"
                    height={dynamicSvgHeight}
                    viewBox={`0 0 650 ${dynamicSvgHeight}`}
                    className="max-w-full overflow-visible my-auto"
                  >
                    <defs>
                      <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#34D399" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>

                    {/* Draw Connecting Curved Splines */}
                    {derivativeAssets.map((child, idx) => {
                      const parentIdx = parentAssets.findIndex(
                        (p) => p.id === child.parentId || p.contentHash === child.parentId
                      );
                      const safeParentIdx = parentIdx === -1 ? 0 : parentIdx;

                      const startX = parentCx;
                      const startYPos = startY + safeParentIdx * rowSpacing;
                      const endX = derivativeCx;
                      const endYPos = startY + idx * rowSpacing;

                      return (
                        <g key={`spline-${child.id}`}>
                          {/* Spline Path */}
                          <path
                            d={`M ${startX + 32} ${startYPos} C ${startX + 150} ${startYPos}, ${endX - 150} ${endYPos}, ${endX - 32} ${endYPos}`}
                            fill="none"
                            stroke="url(#lineGrad)"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                          />
                          {/* Split Rate Tag Pill on Center of Curve */}
                          <rect
                            x={(startX + endX) / 2 - 28}
                            y={(startYPos + endYPos) / 2 - 12}
                            width="56"
                            height="24"
                            rx="12"
                            fill="#14161A"
                            stroke="#60A5FA"
                            strokeWidth="1"
                          />
                          <text
                            x={(startX + endX) / 2}
                            y={(startYPos + endYPos) / 2 + 4}
                            textAnchor="middle"
                            fill="#60A5FA"
                            fontSize="10"
                            fontFamily="monospace"
                          >
                            {child.royaltySplit}% split
                          </text>
                        </g>
                      );
                    })}

                    {/* Parent Origin Column */}
                    {parentAssets.map((asset, index) => {
                      const cx = parentCx;
                      const cy = startY + index * rowSpacing;
                      const isSelected = selectedAsset?.id === asset.id;
                      const displayTitle = asset.title.length > 24 ? asset.title.slice(0, 22) + "..." : asset.title;

                      return (
                        <g
                          key={asset.id}
                          className="cursor-pointer transition-transform duration-200"
                          onClick={() => setSelectedAssetId(asset.id)}
                        >
                          {/* Outer Pulsing Glow Circle */}
                          {isSelected && (
                            <circle cx={cx} cy={cy} r="38" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="3 3" />
                          )}
                          {/* Node Circle */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r="28"
                            fill={isSelected ? "#1E2127" : "#14161A"}
                            stroke={isSelected ? "#60A5FA" : "#2E333D"}
                            strokeWidth="2"
                          />
                          {/* Node Inner Symbol */}
                          <text x={cx} y={cy + 4} textAnchor="middle" fill="#60A5FA" fontSize="11" fontWeight="400" fontFamily="monospace">
                            GEN-0
                          </text>
                          {/* Title & Hash Label Below */}
                          <text x={cx} y={cy + 46} textAnchor="middle" fill="#F9FAFB" fontSize="12" fontWeight="300">
                            {displayTitle}
                          </text>
                          <text x={cx} y={cy + 60} textAnchor="middle" fill="#9CA3AF" fontSize="9" fontFamily="monospace">
                            {asset.creatorAddress.substring(0, 6)}...{asset.creatorAddress.slice(-4)}
                          </text>
                        </g>
                      );
                    })}

                    {/* Derivative Column */}
                    {derivativeAssets.map((asset, index) => {
                      const cx = derivativeCx;
                      const cy = startY + index * rowSpacing;
                      const isSelected = selectedAsset?.id === asset.id;
                      const displayTitle = asset.title.length > 24 ? asset.title.slice(0, 22) + "..." : asset.title;

                      return (
                        <g
                          key={asset.id}
                          className="cursor-pointer transition-transform duration-200"
                          onClick={() => setSelectedAssetId(asset.id)}
                        >
                          {isSelected && (
                            <circle cx={cx} cy={cy} r="38" fill="none" stroke="#34D399" strokeWidth="1.5" strokeDasharray="3 3" />
                          )}
                          <circle
                            cx={cx}
                            cy={cy}
                            r="28"
                            fill={isSelected ? "#1E2127" : "#14161A"}
                            stroke={isSelected ? "#34D399" : "#2E333D"}
                            strokeWidth="2"
                          />
                          <text x={cx} y={cy + 4} textAnchor="middle" fill="#34D399" fontSize="11" fontWeight="400" fontFamily="monospace">
                            REMIX
                          </text>
                          <text x={cx} y={cy + 46} textAnchor="middle" fill="#F9FAFB" fontSize="12" fontWeight="300">
                            {displayTitle}
                          </text>
                          <text x={cx} y={cy + 60} textAnchor="middle" fill="#9CA3AF" fontSize="9" fontFamily="monospace">
                            {asset.creatorAddress.substring(0, 6)}...{asset.creatorAddress.slice(-4)}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                )}
              </div>
            );
          })()}

          {/* VIEW 2: Invariant Polygon Radar Chart (Inspired by Reference 1) */}
          {viewMode === "radar" && (
            <div className="w-full flex-1 flex flex-col items-center justify-center relative min-h-[380px]">
              <div className="absolute top-0 left-0 text-left">
                <span className="text-3xl font-light text-text-primary tracking-tight">
                  94.8%
                </span>
                <span className="text-[10px] uppercase font-mono text-brand block mt-0.5">
                  Invariant Fidelity Score
                </span>
              </div>

              <svg width="340" height="340" viewBox="0 0 340 340" className="overflow-visible">
                {/* Concentric Radar Polygons */}
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale, i) => {
                  const r = 110 * scale;
                  const points = [
                    [170, 170 - r],
                    [170 + r * 0.95, 170 - r * 0.31],
                    [170 + r * 0.59, 170 + r * 0.81],
                    [170 - r * 0.59, 170 + r * 0.81],
                    [170 - r * 0.95, 170 - r * 0.31],
                  ]
                    .map(([x, y]) => `${x},${y}`)
                    .join(" ");

                  return (
                    <polygon
                      key={i}
                      points={points}
                      fill={i === 4 ? "none" : "none"}
                      stroke="#2E333D"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Radar Axis Lines */}
                {[
                  [170, 60],
                  [274, 136],
                  [235, 259],
                  [105, 259],
                  [66, 136],
                ].map(([x, y], i) => (
                  <line key={i} x1="170" y1="170" x2={x} y2={y} stroke="#2E333D" strokeWidth="1" />
                ))}

                {/* Active Data Area (Glowing Polygon) */}
                <polygon
                  points="170,72 268,142 225,248 115,245 78,144"
                  fill="rgba(96, 165, 250, 0.15)"
                  stroke="#60A5FA"
                  strokeWidth="2"
                />

                {/* Radar Node Points */}
                {[
                  [170, 72],
                  [268, 142],
                  [225, 248],
                  [115, 245],
                  [78, 144],
                ].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="4" fill="#34D399" />
                ))}

                {/* Axis Labels */}
                <text x="170" y="46" textAnchor="middle" fill="#9CA3AF" fontSize="10" fontFamily="monospace">
                  Visual Invariance (98%)
                </text>
                <text x="290" y="140" textAnchor="start" fill="#9CA3AF" fontSize="10" fontFamily="monospace">
                  Royalty Health (92%)
                </text>
                <text x="245" y="278" textAnchor="middle" fill="#9CA3AF" fontSize="10" fontFamily="monospace">
                  Lineage Depth (88%)
                </text>
                <text x="95" y="278" textAnchor="middle" fill="#9CA3AF" fontSize="10" fontFamily="monospace">
                  Smart Contract Proof (100%)
                </text>
                <text x="50" y="140" textAnchor="end" fill="#9CA3AF" fontSize="10" fontFamily="monospace">
                  Agent Permissions (96%)
                </text>
              </svg>
            </div>
          )}

          {/* VIEW 3: Proportional Royalty Packing Circles (Inspired by References 2 & 3) */}
          {viewMode === "composition" && (
            <div className="w-full flex-1 flex flex-col lg:flex-row items-center justify-around gap-8 min-h-[380px]">
              {/* Pentagram-style Nested Cluster Circles */}
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Large Circle (Primary Creator Split) */}
                <div className="absolute w-44 h-44 rounded-full bg-brand/20 border border-brand flex flex-col items-center justify-center top-2 left-2">
                  <span className="text-2xl font-light text-text-primary">85%</span>
                  <span className="text-[9px] uppercase font-mono text-brand">Origin Split</span>
                </div>

                {/* Derivative Remix Circle */}
                <div className="absolute w-28 h-28 rounded-full bg-success/20 border border-success flex flex-col items-center justify-center bottom-2 right-2">
                  <span className="text-lg font-light text-text-primary">15%</span>
                  <span className="text-[9px] uppercase font-mono text-success">Remix Split</span>
                </div>

                {/* Mini Protocol Fee Node */}
                <div className="absolute w-12 h-12 rounded-full bg-surface-active border border-surface-active flex items-center justify-center top-0 right-8">
                  <span className="text-[9px] font-mono text-text-muted">0%</span>
                </div>
              </div>

              {/* Legend and Explanation */}
              <div className="flex flex-col gap-4 text-left max-w-xs">
                <span className="text-xs uppercase tracking-wider text-text-muted font-normal font-mono">
                  Autonomous Distribution
                </span>
                <p className="text-xs font-light text-text-muted leading-relaxed">
                  Every licensing transaction settled by AI agents distributes payment directly across creator wallets according to anchored lineage terms.
                </p>
                <div className="flex flex-col gap-2 text-xs font-light">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-brand"></span>
                    <span className="text-text-primary">Primary Parent Creator (85% to 90%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-success"></span>
                    <span className="text-text-primary">Derivative Remix Creator (10% to 15%)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Protocol Info Tag */}
          <div className="mt-6 pt-4 border-t border-surface-active text-[10px] font-mono text-text-muted flex items-center justify-between shrink-0">
            <span>Arbitrum Sepolia Ledger Synchronized</span>
            <span>Deterministic SHA-256 & 64-bit DCT pHash</span>
          </div>
        </div>

        {/* Right Node Metadata Card (4 Cols) */}
        <div className="lg:col-span-4 bg-surface p-6 sm:p-8 rounded-3xl flex flex-col justify-between text-left">
          {selectedAsset ? (
            <div className="flex flex-col gap-5">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-brand font-normal block mb-1">
                  Anchored Registry Card
                </span>
                <h3 className="text-xl font-light text-text-primary leading-tight">
                  {selectedAsset.title}
                </h3>
                <span className="text-[10px] font-mono text-text-muted block mt-1">
                  ID: #{selectedAsset.id}
                </span>
              </div>

              {/* Media Preview if available */}
              {selectedAsset.mediaUrl && (
                <div className="w-full h-36 rounded-2xl bg-background overflow-hidden flex items-center justify-center border border-surface-active">
                  <img
                    src={selectedAsset.mediaUrl}
                    alt={selectedAsset.title}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              )}

              {/* Details List */}
              <div className="flex flex-col gap-3 text-xs font-light">
                <div>
                  <span className="text-text-muted block text-[9px] uppercase tracking-wider">
                    Generation Model
                  </span>
                  <span className="text-text-primary block mt-0.5">
                    {selectedAsset.aiModel || "Autonomous System"}
                  </span>
                </div>

                <div>
                  <span className="text-text-muted block text-[9px] uppercase tracking-wider">
                    Cryptographic SHA-256
                  </span>
                  <span className="font-mono text-text-primary block truncate mt-0.5">
                    {selectedAsset.contentHash}
                  </span>
                </div>

                <div>
                  <span className="text-text-muted block text-[9px] uppercase tracking-wider">
                    Visual Perceptual pHash
                  </span>
                  <span className="font-mono text-brand block mt-0.5">
                    {selectedAsset.phash || "0000000000000000"}
                  </span>
                </div>

                <div>
                  <span className="text-text-muted block text-[9px] uppercase tracking-wider">
                    Creator Wallet
                  </span>
                  <span className="font-mono text-text-primary block truncate mt-0.5">
                    {selectedAsset.creatorAddress}
                  </span>
                </div>

                <div className="pt-2 border-t border-surface-active flex justify-between items-center">
                  <span className="text-text-muted">Royalty Split Term</span>
                  <span className="text-brand font-mono">{selectedAsset.royaltySplit}% split</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-text-muted">Lineage Ancestry</span>
                  <span className="text-success flex items-center gap-1 font-mono">
                    <IconCheck size={12} />
                    {selectedAsset.parentId ? "Derivative Node" : "Genesis Origin"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center text-text-muted">
              <IconFingerprint size={32} className="text-brand mb-3" />
              <p className="text-xs font-light">Select any node in the topology graph to inspect on-chain provenance records.</p>
            </div>
          )}

          {/* Bottom Explorer Action Button */}
          {selectedAsset && (
            <a
              href={`https://sepolia.arbiscan.io/tx/${selectedAsset.transactionHash}`}
              target="_blank"
              rel="noreferrer"
              className="mt-6 w-full py-3 px-4 bg-surface-active hover:bg-brand hover:text-background text-text-primary text-xs font-light rounded-xl transition-all duration-200 flex items-center justify-between cursor-pointer"
            >
              <span>Verify on Arbiscan</span>
              <IconArrowUpRight size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
