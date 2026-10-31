"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconNetwork,
  IconRadar,
  IconChartPie,
  IconArrowUpRight,
  IconFingerprint,
  IconCheck,
  IconRefresh,
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
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId) || (assets.length > 0 ? assets[0] : null);

  const parentAssets = assets.filter((a) => !a.parentId);
  const derivativeAssets = assets.filter((a) => a.parentId);

  const hasDerivatives = derivativeAssets.length > 0;
  const parentCx = hasDerivatives ? 170 : 325;
  const derivativeCx = 475;
  const maxRows = Math.max(parentAssets.length, derivativeAssets.length, 1);
  const rowSpacing = 135;
  const startY = 75;
  const dynamicSvgHeight = Math.max(400, startY + maxRows * rowSpacing + 50);

  const resetLayout = () => {
    const initialPositions: Record<string, { x: number; y: number }> = {};
    parentAssets.forEach((asset, idx) => {
      initialPositions[asset.id] = {
        x: parentCx,
        y: startY + idx * rowSpacing,
      };
    });
    derivativeAssets.forEach((asset, idx) => {
      initialPositions[asset.id] = {
        x: derivativeCx,
        y: startY + idx * rowSpacing,
      };
    });
    setNodePositions(initialPositions);
  };

  useEffect(() => {
    resetLayout();
  }, [assets]);

  const handleMouseDown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggedNodeId(id);
    setSelectedAssetId(id);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggedNodeId || !svgRef.current) return;
    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return;
    const x = (e.clientX - CTM.e) / CTM.a;
    const y = (e.clientY - CTM.f) / CTM.d;

    const clampedX = Math.max(50, Math.min(600, x));
    const clampedY = Math.max(50, Math.min(dynamicSvgHeight - 50, y));

    setNodePositions((prev) => ({
      ...prev,
      [draggedNodeId]: { x: clampedX, y: clampedY },
    }));
  };

  const handleMouseUp = () => {
    setDraggedNodeId(null);
  };

  // Compute stats for header
  const totalAssets = assets.length;
  const derivativeCount = derivativeAssets.length;
  const avgSplit =
    assets.length > 0
      ? (assets.reduce((acc, a) => acc + (a.royaltySplit || 0), 0) / assets.length).toFixed(1)
      : "10.0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-6xl mx-auto my-8 flex flex-col gap-6 select-none font-sans"
    >
      {/* Top Header & High-Impact Metric Banner */}
      <div className="bg-surface p-8 rounded-3xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-brand font-normal block mb-2">
            Eigenmark Provenance Topology
          </span>
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

            <div className="flex items-center gap-3">
              {viewMode === "network" && (
                <button
                  onClick={resetLayout}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider text-text-muted hover:text-text-primary bg-surface-active/50 hover:bg-surface-active transition-all cursor-pointer"
                  title="Reset Node Positions"
                >
                  <IconRefresh size={12} />
                  <span>Reset Nodes</span>
                </button>
              )}
              <span className="text-[10px] font-mono text-text-muted uppercase tracking-wider hidden sm:block">
                Interactive Draggable Canvas
              </span>
            </div>
          </div>

          {/* VIEW SWITCHER WITH FRAMER MOTION ANIMATION */}
          <AnimatePresence mode="wait">
            {/* VIEW 1: Lineage Network Tree */}
            {viewMode === "network" && (
              <motion.div
                key="network-view"
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.2 }}
                className="w-full flex-1 flex flex-col items-center justify-start relative min-h-[380px] max-h-[500px] overflow-y-auto overflow-x-hidden pr-2"
              >
              {assets.length === 0 ? (
                <div className="text-center py-16 m-auto">
                  <p className="text-xs font-light text-text-muted">
                    No provenance assets anchored yet. Register or derive an asset to populate the graph.
                  </p>
                </div>
              ) : (
                <svg
                  ref={svgRef}
                  width="100%"
                  height={dynamicSvgHeight}
                  viewBox={`0 0 650 ${dynamicSvgHeight}`}
                  className="max-w-full overflow-visible my-auto select-none"
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  <defs>
                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#34D399" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>

                  {/* Draw Connecting Curved Splines with Animated Flow Particles */}
                  {derivativeAssets.map((child, idx) => {
                    const parentIdx = parentAssets.findIndex(
                      (p) => p.id === child.parentId || p.contentHash === child.parentId
                    );
                    const safeParentIdx = parentIdx === -1 ? 0 : parentIdx;

                    const parentAssetObj = parentAssets.find(
                      (p) => p.id === child.parentId || p.contentHash === child.parentId
                    ) || parentAssets[safeParentIdx];

                    const parentPos = parentAssetObj && nodePositions[parentAssetObj.id]
                      ? nodePositions[parentAssetObj.id]
                      : { x: parentCx, y: startY + safeParentIdx * rowSpacing };

                    const childPos = nodePositions[child.id]
                      ? nodePositions[child.id]
                      : { x: derivativeCx, y: startY + idx * rowSpacing };

                    const splineD = `M ${parentPos.x + 30} ${parentPos.y} C ${parentPos.x + 140} ${parentPos.y}, ${childPos.x - 140} ${childPos.y}, ${childPos.x - 30} ${childPos.y}`;

                    return (
                      <g key={`spline-${child.id}`}>
                        {/* Dynamic Spline Path */}
                        <path
                          d={splineD}
                          fill="none"
                          stroke="url(#lineGrad)"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                        />

                        {/* Split Rate Tag Pill on Center of Curve */}
                        <rect
                          x={(parentPos.x + childPos.x) / 2 - 28}
                          y={(parentPos.y + childPos.y) / 2 - 12}
                          width="56"
                          height="24"
                          rx="12"
                          fill="#14161A"
                          stroke="#60A5FA"
                          strokeWidth="1"
                        />
                        <text
                          x={(parentPos.x + childPos.x) / 2}
                          y={(parentPos.y + childPos.y) / 2 + 4}
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

                  {/* Parent Origin Nodes (Genesis Works) */}
                  {parentAssets.map((asset, index) => {
                    const pos = nodePositions[asset.id] || {
                      x: parentCx,
                      y: startY + index * rowSpacing,
                    };
                    const isSelected = selectedAsset?.id === asset.id;
                    const isBeingDragged = draggedNodeId === asset.id;
                    const displayTitle = asset.title.length > 24 ? asset.title.slice(0, 22) + "..." : asset.title;

                    return (
                      <g
                        key={asset.id}
                        className="cursor-grab active:cursor-grabbing transition-opacity duration-150"
                        onMouseDown={(e) => handleMouseDown(asset.id, e)}
                      >
                        {/* Node Circle */}
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={isBeingDragged ? "32" : "28"}
                          fill={isSelected ? "#1E2127" : "#14161A"}
                          stroke={isSelected ? "#60A5FA" : "#2E333D"}
                          strokeWidth={isBeingDragged ? "3" : "2"}
                        />

                        {/* Node Inner Symbol */}
                        <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="#60A5FA" fontSize="11" fontWeight="400" fontFamily="monospace">
                          GEN-0
                        </text>

                        {/* Title & Hash Label Below */}
                        <text x={pos.x} y={pos.y + 46} textAnchor="middle" fill="#F9FAFB" fontSize="12" fontWeight="300" pointerEvents="none">
                          {displayTitle}
                        </text>
                        <text x={pos.x} y={pos.y + 60} textAnchor="middle" fill="#9CA3AF" fontSize="9" fontFamily="monospace" pointerEvents="none">
                          {asset.creatorAddress.substring(0, 6)}...{asset.creatorAddress.slice(-4)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Derivative Remix Nodes */}
                  {derivativeAssets.map((asset, index) => {
                    const pos = nodePositions[asset.id] || {
                      x: derivativeCx,
                      y: startY + index * rowSpacing,
                    };
                    const isSelected = selectedAsset?.id === asset.id;
                    const isBeingDragged = draggedNodeId === asset.id;
                    const displayTitle = asset.title.length > 24 ? asset.title.slice(0, 22) + "..." : asset.title;

                    return (
                      <g
                        key={asset.id}
                        className="cursor-grab active:cursor-grabbing transition-opacity duration-150"
                        onMouseDown={(e) => handleMouseDown(asset.id, e)}
                      >
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={isBeingDragged ? "32" : "28"}
                          fill={isSelected ? "#1E2127" : "#14161A"}
                          stroke={isSelected ? "#34D399" : "#2E333D"}
                          strokeWidth={isBeingDragged ? "3" : "2"}
                        />
                        <text x={pos.x} y={pos.y + 4} textAnchor="middle" fill="#34D399" fontSize="11" fontWeight="400" fontFamily="monospace">
                          REMIX
                        </text>
                        <text x={pos.x} y={pos.y + 46} textAnchor="middle" fill="#F9FAFB" fontSize="12" fontWeight="300" pointerEvents="none">
                          {displayTitle}
                        </text>
                        <text x={pos.x} y={pos.y + 60} textAnchor="middle" fill="#9CA3AF" fontSize="9" fontFamily="monospace" pointerEvents="none">
                          {asset.creatorAddress.substring(0, 6)}...{asset.creatorAddress.slice(-4)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}
            </motion.div>
          )}

          {/* VIEW 2: Invariant Polygon Radar Chart */}
          {viewMode === "radar" && (
            <motion.div
              key="radar-view"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.2 }}
              className="w-full flex-1 flex flex-col items-center justify-center relative min-h-[380px]"
            >
              <div className="absolute top-0 left-0 text-left">
                <span className="text-3xl font-light text-text-primary tracking-tight">
                  94.8%
                </span>
                <span className="text-[10px] uppercase font-mono text-brand block mt-0.5">
                  Invariant Fidelity Score
                </span>
              </div>

              <svg width="340" height="340" viewBox="0 0 340 340" className="overflow-visible select-none">
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
                    .map((p) => p.join(","))
                    .join(" ");

                  return (
                    <polygon
                      key={i}
                      points={points}
                      fill="none"
                      stroke="#2E333D"
                      strokeWidth="1"
                      strokeDasharray={i === 4 ? "none" : "2 2"}
                    />
                  );
                })}

                {/* Radar Axis Spokes */}
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
            </motion.div>
          )}

          {/* VIEW 3: Proportional Royalty Packing Circles */}
          {viewMode === "composition" && (
            <motion.div
              key="composition-view"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.2 }}
              className="w-full flex-1 flex flex-col lg:flex-row items-center justify-around gap-8 min-h-[380px]"
            >
              <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Large Circle (Primary Creator Split) */}
                <div className="absolute w-44 h-44 rounded-full bg-brand/20 flex flex-col items-center justify-center top-2 left-2 transition-transform duration-300 hover:scale-105">
                  <span className="text-2xl font-light text-text-primary">85%</span>
                  <span className="text-[9px] uppercase font-mono text-brand">Origin Split</span>
                </div>

                {/* Derivative Remix Circle */}
                <div className="absolute w-28 h-28 rounded-full bg-success/20 flex flex-col items-center justify-center bottom-2 right-2 transition-transform duration-300 hover:scale-105">
                  <span className="text-lg font-light text-text-primary">15%</span>
                  <span className="text-[9px] uppercase font-mono text-success">Remix Split</span>
                </div>

                {/* Mini Protocol Fee Node */}
                <div className="absolute w-12 h-12 rounded-full bg-surface-active flex items-center justify-center top-0 right-8">
                  <span className="text-[9px] font-mono text-text-muted">0%</span>
                </div>
              </div>

              {/* Legend and Explanation */}
              <div className="flex flex-col gap-4 text-left max-w-xs">
                <h4 className="text-sm font-light text-text-primary">
                  Proportional Settlement Geometry
                </h4>
                <p className="text-xs font-light text-text-muted leading-relaxed">
                  Nested circles illustrate the relative allocation of gross licensing fees disbursed directly to original and derivative author wallets via smart contract calls.
                </p>
                <div className="flex flex-col gap-2 text-xs font-light">
                  <div className="text-text-primary">
                    Primary Parent Creator (85% to 90%)
                  </div>
                  <div className="text-text-primary">
                    Derivative Remix Creator (10% to 15%)
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

          {/* Bottom Protocol Info Tag */}
          <div className="mt-6 pt-4 text-[10px] font-mono text-text-muted flex items-center justify-between shrink-0">
            <span>Arbitrum Sepolia Ledger Synchronized</span>
            <span>Deterministic SHA 256 and visual hash</span>
          </div>
        </div>

        {/* Right Node Metadata Card (4 Cols) */}
        <div className="lg:col-span-4 bg-surface p-6 sm:p-8 rounded-3xl flex flex-col justify-between text-left">
          <AnimatePresence mode="wait">
            {selectedAsset ? (
              <motion.div
                key={selectedAsset.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-5"
              >
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
                  <div className="w-full h-36 rounded-2xl bg-background overflow-hidden flex items-center justify-center">
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
                      Cryptographic SHA 256
                    </span>
                    <span className="font-mono text-text-primary block truncate mt-0.5">
                      {selectedAsset.contentHash}
                    </span>
                  </div>

                  <div>
                    <span className="text-text-muted block text-[9px] uppercase tracking-wider">
                      Visual Perceptual Hash
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

                  <div className="pt-2 flex justify-between items-center">
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
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center justify-center py-16 text-center text-text-muted"
              >
                <IconFingerprint size={32} className="text-brand mb-3" />
                <p className="text-xs font-light">Select any node in the topology graph to inspect on-chain provenance records.</p>
              </motion.div>
            )}
          </AnimatePresence>

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
    </motion.div>
  );
}
