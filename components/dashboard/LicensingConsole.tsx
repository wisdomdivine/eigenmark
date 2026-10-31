"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Dropdown from "@/components/ui/Dropdown";

interface Asset {
  id: string;
  title: string;
  description: string;
  aiModel: string;
  contentHash: string;
  royaltySplit: number;
  creatorAddress: string;
  parentId?: string;
  timestamp: string;
  transactionHash: string;
}

interface LicensingAgreement {
  id: string;
  assetId: string;
  licenseeAddress: string;
  transactionHash: string;
  price: number;
  royaltySplit: number;
  timestamp: string;
}

interface LicensingConsoleProps {
  currentUser: { name: string; address: string; role: string };
  assets: Array<Asset>;
  agreements: Array<LicensingAgreement>;
  onBuyLicense: (agreement: {
    assetId: string;
    licenseeAddress: string;
    price: number;
    royaltySplit: number;
  }) => Promise<void>;
}

interface AgentStep {
  step: number;
  title: string;
  tool: string;
  status: "idle" | "running" | "completed" | "error";
  description: string;
  request: Record<string, unknown>;
  response: Record<string, unknown>;
  durationMs: number;
}

export default function LicensingConsole({
  currentUser,
  assets,
  agreements,
  onBuyLicense,
}: LicensingConsoleProps) {
  const [activeTab, setActiveTab] = useState<"agent" | "manual">("agent");
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [price, setPrice] = useState(10);
  const [logs, setLogs] = useState<Array<string>>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Agent Simulation State
  const [agentScenario, setAgentScenario] = useState<"derivative" | "training" | "lora">("derivative");
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [agentActiveStep, setAgentActiveStep] = useState<number>(-1);
  const [agentCompleted, setAgentCompleted] = useState(false);
  const [expandedToolIndex, setExpandedToolIndex] = useState<number | null>(0);

  // Find derivative assets (those with parents)
  const derivatives = assets.filter((a) => a.parentId);
  const selectedAsset = assets.find((a) => a.id === selectedAssetId) || derivatives[0] || assets[0];

  const scenarioOptions = [
    {
      value: "derivative",
      label: "Derivative Video Remix",
      sublabel: "Original creator receives agreed royalty share automatically",
    },
    {
      value: "training",
      label: "Autonomous LLM Ingestion",
      sublabel: "Permission to include artwork in AI model training sets",
    },
    {
      value: "lora",
      label: "Artist Style Training",
      sublabel: "Permission to train a custom style model with direct payouts",
    },
  ];

  const agentSteps: Array<AgentStep> = [
    {
      step: 1,
      title: "Verify Lineage and Provenance",
      tool: "verify_provenance",
      status:
        agentActiveStep > 0
          ? "completed"
          : agentActiveStep === 0
          ? "running"
          : "idle",
      description: "Inspect original artwork lineage and confirm visual similarity",
      request: {
        method: "tools/call",
        params: {
          name: "verify_provenance",
          arguments: {
            content_hash: selectedAsset?.contentHash || "0x7f9a882e34c190ab77...",
            visual_match_tolerance: 6,
          },
        },
      },
      response: {
        verified: true,
        parent_asset: {
          content_hash: "0xab12c345de6789f01234567890abcdef1234567890ab...",
          creator: "0x1111111111111111111111111111111111111111",
          royalty_rate_pct: selectedAsset?.royaltySplit || 20,
        },
        difference_score: 4,
        similarity_score: "93.75%",
        lineage_depth: 2,
      },
      durationMs: 142,
    },
    {
      step: 2,
      title: "Check Licensing Terms",
      tool: "check_usage_policy",
      status:
        agentActiveStep > 1
          ? "completed"
          : agentActiveStep === 1
          ? "running"
          : "idle",
      description: "Inspect creator terms and verify automatic authorization",
      request: {
        method: "tools/call",
        params: {
          name: "check_usage_policy",
          arguments: {
            asset_id: selectedAsset?.id || "ast_8892f01",
            licensee: "0x981F42cA90b4dE150024823Eb1fA30E6607e47cA",
            intended_use:
              agentScenario === "derivative"
                ? "commercial_derivative_synthesis"
                : agentScenario === "training"
                ? "llm_model_ingestion"
                : "lora_weight_fine_tuning",
          },
        },
      },
      response: {
        policy_status: "AUTHORIZED",
        license_price_usdc: price,
        automated_settlement_enabled: true,
        arbitrum_contract: "0x71207757FB3F8118EC0BAb8f2251E09973892306",
        split_distribution: {
          original_creator_share: `${selectedAsset?.royaltySplit || 20}%`,
          derivative_creator_share: `${100 - (selectedAsset?.royaltySplit || 20)}%`,
        },
      },
      durationMs: 88,
    },
    {
      step: 3,
      title: "Send Payment on Arbitrum",
      tool: "license_asset",
      status:
        agentActiveStep > 2
          ? "completed"
          : agentActiveStep === 2
          ? "running"
          : "idle",
      description: "Execute smart contract to distribute instant creator splits",
      request: {
        method: "tools/call",
        params: {
          name: "license_asset",
          arguments: {
            asset_id: selectedAsset?.id || "ast_8892f01",
            amount_usdc: price,
            network: "arbitrum_sepolia",
            max_gas_gwei: 0.1,
          },
        },
      },
      response: {
        status: "SETTLED",
        transaction_hash: "0x4f829b10a5620984918e907d471026027ab57849103c80918a20984719082049",
        block_number: 84920412,
        gas_used: "84,120 gas (~$0.0011)",
        escrow_settled: true,
        transfers: [
          {
            to: getParentCreatorAddress(selectedAsset?.id || ""),
            amount: `${price * ((selectedAsset?.royaltySplit || 20) / 100)} USDC`,
            role: "primary_creator",
          },
          {
            to: selectedAsset?.creatorAddress || "0x2222...2222",
            amount: `${price * (1 - (selectedAsset?.royaltySplit || 20) / 100)} USDC`,
            role: "derivative_creator",
          },
        ],
      },
      durationMs: 420,
    },
    {
      step: 4,
      title: "Issue Tamper Proof Receipt",
      tool: "generate_proof_certificate",
      status:
        agentActiveStep > 3
          ? "completed"
          : agentActiveStep === 3
          ? "running"
          : "idle",
      description: "Create digital license receipt and record on permanent registry",
      request: {
        method: "tools/call",
        params: {
          name: "generate_proof_certificate",
          arguments: {
            transaction_hash: "0x4f829b10a5620984918e907d471026027ab57849103c80918a20984719082049",
            asset_id: selectedAsset?.id || "ast_8892f01",
          },
        },
      },
      response: {
        certificate_token_id: "0x7a892b...4092",
        permanent_storage_id: "bafybeiczsscdspl7kiog7eoxikx4w646s",
        onchain_proof_verified: true,
        registry_status: "ACTIVE_VALID",
      },
      durationMs: 195,
    },
  ];

  function getParentCreatorAddress(assetId: string) {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset || !asset.parentId) return "0x1111111111111111111111111111111111111111";
    const parent = assets.find((p) => p.id === asset.parentId || p.contentHash === asset.parentId);
    return parent ? parent.creatorAddress : "0x1111111111111111111111111111111111111111";
  }

  const runAgentSimulation = async () => {
    if (isAgentRunning) return;
    setIsAgentRunning(true);
    setAgentCompleted(false);

    for (let i = 0; i < 4; i++) {
      setAgentActiveStep(i);
      setExpandedToolIndex(i);
      await new Promise((res) => setTimeout(res, 750));
    }

    setAgentActiveStep(4);
    setAgentCompleted(true);
    setIsAgentRunning(false);
  };

  const handlePurchase = async () => {
    if (!selectedAssetId) return;
    const target = assets.find((a) => a.id === selectedAssetId);
    if (!target) return;

    setIsProcessing(true);
    setLogs([
      "Connecting wallet and verifying USDC balance",
      "Broadcasting transaction to Arbitrum network...",
    ]);

    try {
      await onBuyLicense({
        assetId: selectedAssetId,
        licenseeAddress: currentUser.address,
        price: price,
        royaltySplit: target.royaltySplit,
      });

      setLogs((prev) => [
        ...prev,
        `Resolving parent lineage: royalty split of ${target.royaltySplit}%`,
        `Transferring automated splits: ${price * (target.royaltySplit / 100)} USDC to primary creator, ${price * (1 - target.royaltySplit / 100)} USDC to derivative creator`,
        "Writing license certificate to immutable registry",
        "License settlement successful and recorded on chain",
      ]);
    } catch (error) {
      console.error("Purchase failed:", error);
      setLogs((prev) => [...prev, "Transaction failed or was rejected."]);
    } finally {
      setIsProcessing(false);
    }
  };

  const getParentCreatorName = (assetId: string) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset || !asset.parentId) return "Original";
    const parent = assets.find((p) => p.id === asset.parentId || p.contentHash === asset.parentId);
    if (!parent) return "Parent Asset";
    return `${parent.creatorAddress.substring(0, 6)}...${parent.creatorAddress.slice(-4)}`;
  };

  const getDerivativeCreatorName = (assetId: string) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return "Derivative Creator";
    return `${asset.creatorAddress.substring(0, 6)}...${asset.creatorAddress.slice(-4)}`;
  };

  const derivativeOptions = (derivatives.length > 0 ? derivatives : assets).map((asset) => ({
    value: asset.id,
    label: asset.title,
    sublabel: `${asset.contentHash.substring(0, 16)}...`,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-4xl bg-surface p-6 sm:p-10 rounded-3xl mx-auto my-10"
    >
      {/* Header and Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 text-left">
        <div>
          <span className="text-xs uppercase tracking-widest text-brand font-normal block mb-1">
            Automated Licensing and Settlement
          </span>
          <h2 className="text-2xl font-light text-text-primary tracking-tight">
            Licensing Console
          </h2>
          <p className="text-xs font-light text-text-muted mt-1 leading-relaxed max-w-xl">
            Review ownership records, automate creator royalty payouts, and run autonomous agent licensing workflows.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("agent")}
            className={`px-4 py-2.5 text-xs rounded-xl transition-colors duration-150 cursor-pointer font-light ${
              activeTab === "agent"
                ? "bg-surface-active text-text-primary font-normal"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Autonomous Agent
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`px-4 py-2.5 text-xs rounded-xl transition-colors duration-150 cursor-pointer font-light ${
              activeTab === "manual"
                ? "bg-surface-active text-text-primary font-normal"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Manual Licensing
          </button>
        </div>
      </div>

      {/* VIEW SWITCHER ANIMATION */}
      <AnimatePresence mode="wait">
        {activeTab === "agent" ? (
          <motion.div
            key="agent-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="flex flex-col gap-8 text-left"
          >
            {/* Agent Configuration and Action Area */}
            <div className="bg-surface-active/20 p-6 rounded-2xl flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-normal text-text-primary">
                    Licensing Agent (Claude and Cursor MCP)
                  </h3>
                  <p className="text-xs font-light text-text-muted mt-1">
                    Connected via Model Context Protocol. Settling on Arbitrum network.
                  </p>
                </div>
                <span className="text-xs text-brand font-light">
                  Status: Ready
                </span>
              </div>

              {/* Scenario Picker with Custom Dropdown & Run Button */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="sm:col-span-2">
                  <Dropdown
                    options={scenarioOptions}
                    value={agentScenario}
                    onChange={(val) => setAgentScenario(val as "derivative" | "training" | "lora")}
                    label="Licensing Scenario"
                  />
                </div>

                <div className="w-full">
                  <motion.button
                    whileTap={{ scale: isAgentRunning ? 1 : 0.98 }}
                    onClick={runAgentSimulation}
                    disabled={isAgentRunning}
                    className={`w-full h-12 text-xs font-normal text-background rounded-xl transition-colors duration-150 cursor-pointer ${
                      isAgentRunning
                        ? "bg-surface-active/50 text-text-muted cursor-not-allowed"
                        : "bg-brand hover:bg-text-primary"
                    }`}
                  >
                    {isAgentRunning ? "Running Workflow..." : "Run Agent Workflow"}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Steps: Spacious 2-Column Grid */}
            <div className="flex flex-col gap-3">
              <span className="text-xs uppercase tracking-wider text-text-muted font-light">
                Autonomous Workflow Steps
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agentSteps.map((step, idx) => {
                  const isCurrent = agentActiveStep === idx;
                  const isDone = agentActiveStep > idx || agentCompleted;
                  const isSelected = expandedToolIndex === idx;

                  return (
                    <motion.div
                      key={step.tool}
                      onClick={() => setExpandedToolIndex(idx)}
                      whileHover={{ scale: 1.008 }}
                      whileTap={{ scale: 0.992 }}
                      transition={{ duration: 0.15 }}
                      className={`p-5 rounded-2xl cursor-pointer transition-colors duration-150 text-left ${
                        isSelected
                          ? "bg-surface-active/60"
                          : "bg-surface-active/20 hover:bg-surface-active/35"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs uppercase tracking-wider text-text-muted font-light">
                          Step 0{step.step}
                        </span>
                        <span
                          className={`text-xs font-light ${
                            isDone
                              ? "text-success"
                              : isCurrent
                              ? "text-brand font-normal"
                              : "text-text-muted"
                          }`}
                        >
                          {isDone ? "Completed" : isCurrent ? "In Progress" : "Waiting"}
                        </span>
                      </div>

                      <h4 className="text-sm font-medium text-text-primary mb-1">
                        {step.title}
                      </h4>

                      <div className="text-xs font-mono text-text-muted mb-2">
                        {step.tool}()
                      </div>

                      <p className="text-xs font-light text-text-muted leading-relaxed">
                        {step.description}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Expanded Step Details & Payloads */}
            <AnimatePresence mode="wait">
              {expandedToolIndex !== null && (
                <motion.div
                  key={`tool-details-${expandedToolIndex}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="bg-surface-active/20 p-6 rounded-2xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-text-muted font-light block">
                        Execution Details
                      </span>
                      <h4 className="text-sm font-medium text-text-primary mt-1">
                        {agentSteps[expandedToolIndex].title} ({agentSteps[expandedToolIndex].tool})
                      </h4>
                    </div>
                    <span className="text-xs font-light text-text-muted">
                      Response time: {agentSteps[expandedToolIndex].durationMs} ms
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-text-muted block mb-2 font-light">
                        Agent Request
                      </span>
                      <pre className="bg-surface-active/40 p-4 rounded-xl text-xs text-text-muted overflow-x-auto leading-relaxed font-mono">
                        {JSON.stringify(agentSteps[expandedToolIndex].request, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <span className="text-xs uppercase tracking-wider text-text-muted block mb-2 font-light">
                        Contract Response
                      </span>
                      <pre className="bg-surface-active/40 p-4 rounded-xl text-xs text-brand/90 overflow-x-auto leading-relaxed font-mono">
                        {JSON.stringify(agentSteps[expandedToolIndex].response, null, 2)}
                      </pre>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Autonomous Execution Receipt */}
            <AnimatePresence>
              {agentCompleted && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="bg-surface-active/30 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <h4 className="text-sm font-normal text-text-primary">
                      Licensing workflow completed successfully
                    </h4>
                    <p className="text-xs font-mono text-text-muted mt-1">
                      Transaction ID: 0x4f829b10a5620984918e907d471026027ab57849103c80918a20984719082049
                    </p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-xs text-text-muted block font-light">Total Settled</span>
                      <span className="text-sm font-mono text-text-primary font-medium">{price}.00 USDC</span>
                    </div>
                    <div>
                      <span className="text-xs text-text-muted block font-light">Network Gas Fee</span>
                      <span className="text-sm font-mono text-text-primary font-medium">Under 1 cent</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="manual-view"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left"
          >
            {/* Purchase Form */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <Dropdown
                  options={derivativeOptions}
                  value={selectedAssetId || (derivativeOptions[0]?.value ?? "")}
                  onChange={setSelectedAssetId}
                  label="Select Creative Work"
                  placeholder="Select a derivative work"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase tracking-wider text-text-muted">
                  Licensing Fee (USDC)
                </label>
                <input
                  type="number"
                  value={price}
                  disabled
                  className="w-full bg-surface-active/40 text-text-muted text-sm font-light h-12 px-4 rounded-xl outline-none mt-1"
                />
                <span className="text-xs text-text-muted mt-1 font-light">
                  Direct on chain micro settlement price for verification.
                </span>
              </div>

              {selectedAsset && (
                <div className="bg-surface-active/20 p-5 rounded-2xl text-xs font-light flex flex-col gap-3">
                  <span className="text-xs uppercase tracking-wider text-brand font-normal block">
                    Expected creator payout split
                  </span>
                  <div className="flex justify-between">
                    <span>
                      Original creator ({getParentCreatorName(selectedAsset.id)})
                    </span>
                    <span className="font-mono text-text-primary">
                      {price * (selectedAsset.royaltySplit / 100)} USDC ({selectedAsset.royaltySplit}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      Derivative creator ({getDerivativeCreatorName(selectedAsset.id)})
                    </span>
                    <span className="font-mono text-text-primary">
                      {price * (1 - selectedAsset.royaltySplit / 100)} USDC ({100 - selectedAsset.royaltySplit}%)
                    </span>
                  </div>
                </div>
              )}

              <motion.button
                whileTap={{ scale: !selectedAsset || isProcessing ? 1 : 0.98 }}
                onClick={handlePurchase}
                disabled={!selectedAsset || isProcessing}
                className={`w-full h-12 text-sm font-normal text-background rounded-xl transition-colors duration-150 cursor-pointer ${
                  selectedAsset && !isProcessing
                    ? "bg-brand hover:bg-text-primary"
                    : "bg-surface-active/50 text-text-muted cursor-not-allowed"
                }`}
              >
                {isProcessing ? "Processing Arbitrum split..." : "Confirm and Pay License"}
              </motion.button>
            </div>

            {/* Processing Logs */}
            <div className="bg-surface-active/20 p-6 rounded-2xl flex flex-col justify-between min-h-[300px]">
              <div>
                <span className="text-xs uppercase tracking-widest text-text-muted font-normal block mb-4">
                  License transaction telemetry
                </span>

                {logs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <span className="text-xs font-light text-text-muted max-w-[240px] leading-relaxed">
                      Select a creative work on the left or test the autonomous agent tab to view live transaction telemetry.
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 font-mono text-xs leading-relaxed">
                    {logs.map((log, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex gap-2 items-start"
                      >
                        <span className="text-brand">✓</span>
                        <span className="text-text-primary">{log}</span>
                      </motion.div>
                    ))}
                    {isProcessing && (
                      <div className="text-text-muted text-xs font-light">
                        Processing transaction on Arbitrum...
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!isProcessing && logs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 pt-4 text-xs font-light text-success flex flex-col gap-1"
                >
                  <span>Arbitrum settlement confirmed</span>
                  <span className="text-xs font-mono text-text-muted truncate">
                    Tx: 0x4f829b10a5620984918e907d471026027ab57849103c80918a20984719082049
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing Agreements */}
      {agreements.length > 0 && (
        <div className="mt-12 text-left">
          <span className="text-xs uppercase tracking-wider text-text-muted block mb-4 font-light">
            Active licensing certificates ({agreements.length})
          </span>
          <div className="flex flex-col gap-3">
            {agreements.map((agreement) => {
              const asset = assets.find((a) => a.id === agreement.assetId);
              return (
                <div
                  key={agreement.id}
                  className="bg-surface-active/20 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-light"
                >
                  <div>
                    <h4 className="text-sm font-normal text-text-primary">
                      {asset?.title || "Derivative Asset"}
                    </h4>
                    <p className="text-xs font-mono text-text-muted mt-1">
                      Licensee: {agreement.licenseeAddress}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-text-primary block font-mono text-sm">
                      {agreement.price} USDC
                    </span>
                    <span className="text-xs text-text-muted block mt-0.5">
                      Automated split executed
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
