# Eigenmark: Machine-Verifiable Rights & Autonomous Settlement Layer for AI Agents

Hackathon Submission: 3rd-Web-Hack  
Theme: Hack the Web, build solutions to existing Blockchain problems  
Live Web Application: https://www.eigenmark.app  
Hosted MCP Endpoint (Streamable HTTP): https://www.eigenmark.app/api/mcp  
GitHub Repository: https://github.com/wisdomdivine/eigenmark  
Smart Contract (Arbitrum Sepolia): 0x71207757FB3F8118EC0BAb8f2251E09973892306  
License: MIT License  

---

## 1. Executive Summary

Eigenmark is a machine-verifiable rights and automated royalty settlement protocol designed for the autonomous AI agent economy.

As autonomous AI agents ingest, remix, and synthesize digital content across the web, traditional copyright mechanisms and standard blockchain hashes fail. Modifying a single pixel or re-encoding media invalidates conventional cryptographic hashes (such as SHA-256 or Keccak-256), while human-centric legal agreements cannot operate at the millisecond latency required by autonomous inference pipelines.

Eigenmark bridges this gap through three foundational layers:
1. Perceptual Invariant Hashing: Uses Discrete Cosine Transforms (DCT) to compute 64-bit structural visual fingerprints (pHash) that remain stable under compression, scaling, and format transcoding.
2. Hosted Model Context Protocol (MCP) Server: Implements the current Model Context Protocol standard over Streamable HTTP and local STDIO, allowing autonomous AI agents (Claude, Cursor, AutoGPT, LLM workflows) to verify provenance, check usage policies, and execute settlements programmatically via JSON-RPC 2.0.
3. Arbitrum Sepolia Smart Contract Settlement: Executes atomic two-party lineage royalty splits in USDC on Arbitrum L2, distributing payments to original creators and derivative remixers at fractional-cent gas costs (< 85,000 gas, < $0.002).

---

## 2. Positioning and Strategic Scope

### How Eigenmark Relates to Story Protocol
Story Protocol provides a global programmable IP registry and arbitration layer. Eigenmark focuses on the critical pre-flight gap: **machine-to-machine invariant matching and real-time agent tool execution before asset consumption**.

When an autonomous agent prepares to use an asset in an image-to-image or fine-tuning pipeline, it queries Eigenmark via MCP to:
1. Verify if the asset or a visually modified descendant is registered.
2. Resolve the underlying C2PA soft-binding manifest.
3. Retrieve machine-readable commercial terms and trigger an atomic L2 settlement before ingestion.

Eigenmark functions as the lightweight, machine-native verification and micro-settlement layer that autonomous agents call directly from their execution environments.

---

## 3. Core Problems Solved

### Problem 1: The Cryptographic Hash Fragility Trap
Standard blockchains rely on exact preimage hashes. If an AI agent or user makes minor edits to an image (such as cropping by 2%, adjusting compression quality, or transcoding between PNG and WebP), the SHA-256 hash changes completely. The blockchain treats the edited asset as an unrelated item, breaking the chain of attribution.

### Problem 2: Human-Gated Web3 vs Machine-Native AI Agents
Existing decentralized applications assume a human user interacting through a browser wallet popup. Autonomous AI agents running inside server-side inference loops cannot interact with browser extensions. They require standard machine-to-machine interfaces with deterministic tool calling and automated settlement capabilities.

### Problem 3: Multi-Party Derivative Royalty Settlement
Generative workflows frequently remix original creator works. When a derivative asset is licensed, existing platforms often pay only the final uploader. Eigenmark routes payments on-chain to both the primary creator and the derivative remixer in a single atomic transaction.

---

## 4. System Architecture & Technical Implementation

```
+-----------------------------------------------------------------------+
|                       Autonomous AI Agent Layer                       |
|               (Claude / Cursor / Autonomous LLM Pipeline)             |
+-----------------------------------------------------------------------+
                                   |
              Streamable HTTP / STDIO (JSON-RPC 2.0)
                                   v
+-----------------------------------------------------------------------+
|                    Model Context Protocol (MCP) Server                |
|  Hosted Endpoint: https://www.eigenmark.app/api/mcp                   |
|  - verify_provenance()            - check_usage_policy()              |
|  - license_asset()                - generate_proof_certificate()      |
|  - find_related_assets()                                              |
+-----------------------------------------------------------------------+
                                   |
                +------------------+------------------+
                |                                     |
                v                                     v
+--------------------------------+   +----------------------------------+
|  Perceptual Invariant Engine   |   |   Arbitrum L2 Settlement Layer   |
|  - 64-bit DCT pHash extraction |   |   - ArbitrumRoyaltySplitter.sol  |
|  - Hamming distance indexing   |   |   - Atomic USDC distribution     |
|  - C2PA soft-binding recovery  |   |   - Two-party lineage split      |
|  - Lineage DAG resolution      |   |   - Gas: < 85,000 (< $0.002)     |
+--------------------------------+   +----------------------------------+
                |                                     |
                +------------------+------------------+
                                   v
+-----------------------------------------------------------------------+
|                 Storage, Registry & Frontend Layer                    |
|  - PostgreSQL Database with pgcrypto cryptographic indexing          |
|  - Next.js 14 App Router with Server Components & Security Headers    |
|  - Interactive Provenance Graph (Lineage Tree, Invariant Radar)       |
+-----------------------------------------------------------------------+
```

---

## 5. Subsystem Breakdown

### 5.1. Model Context Protocol (MCP) Server
- Standards Compliance: Current Model Context Protocol specification supporting Streamable HTTP (POST /api/mcp) and STDIO transports.
- Public Hosted Endpoint: `https://www.eigenmark.app/api/mcp`
- Registered Agent Tools:
  - `verify_provenance`: Traverses parent lineage and returns creator address, timestamp, and visual similarity.
  - `check_usage_policy`: Validates licensing terms, commercial rights, required royalty percentages, and automated settlement rules.
  - `license_asset`: Generates calldata and execution parameters for Arbitrum smart contract settlement, with x402 payment rail compatibility.
  - `generate_proof_certificate`: Mints licensing certificate metadata linked to an immutable IPFS manifest.
  - `find_related_assets`: Queries the registry for visually similar parent or derivative works using Hamming distance thresholds.

### 5.2. Perceptual Invariant Engine & Robustness Benchmark
Eigenmark uses 64-bit perceptual hashing (DCT on luminance planes). The table below outlines empirical robustness across common media modifications:

| Transformation Type | Parameter / Magnitude | Hamming Distance (bits) | Match Result (<= 6 bits) |
| :--- | :--- | :--- | :--- |
| JPEG Re-compression | Quality 50% | 0 to 2 bits | Preserved (Pass) |
| JPEG Heavy Compression | Quality 20% | 2 to 4 bits | Preserved (Pass) |
| Resolution Downscaling | 50% scale | 0 to 1 bit | Preserved (Pass) |
| Format Transcoding | PNG to WebP | 0 bits | Preserved (Pass) |
| Minor Edge Crop | 5% boundary crop | 3 to 5 bits | Preserved (Pass) |
| Moderate Crop | 15% crop | 8 to 12 bits | Requires Neural Signal |
| Rotation | 15 degree rotation | 16 to 24 bits | Sensitive (Known Limit) |
| AI Img2Img Remix | Denoising 0.45 | 18 to 32 bits | Requires Neural Signal |

*Engineering Note on Technical Boundaries*: DCT perceptual hashing provides an ultra-fast, low-compute first filter for structural invariance under compression, scaling, and minor color adjustments. For heavy generative remixes (img2img) and non-affine rotations, Eigenmark's architecture is designed to integrate high-dimensional neural embeddings (such as CLIP and Meta PDQ 256-bit hashes) as a secondary validation layer.

### 5.3. Smart Contract Settlement (`ArbitrumRoyaltySplitter.sol`)
- Network: Arbitrum Sepolia Testnet (Chain ID: 421614).
- Contract Address: `0x71207757FB3F8118EC0BAb8f2251E09973892306`.
- Execution Logic:
  - Accepts deposits in testnet USDC.
  - Splits payment atomically between the original creator and the derivative remixer based on registered terms (e.g. 20% to primary creator, 80% to derivative creator).
  - Emits on-chain event `LicenseSettled(bytes32 indexed assetId, address indexed licensee, uint256 price, uint256 parentRoyalty)`.
  - Gas consumption: Under 85,000 gas units per execution.

### 5.4. Authorship Model & First-Registrant Priority
Eigenmark establishes **immutable chronological registration priority and invariant lineage**, rather than biological proof of original artistic authorship. 
To address the first-registrant dilemma:
1. Registrations include cryptographic timestamps anchored on-chain.
2. Assets include a dispute challenge flag where conflicting priority claims can be escalated for arbitration.
3. Invariant matching identifies earlier chronological registrations if duplicate or closely matching assets are submitted later.

### 5.5. C2PA Soft-Binding Resolver & Regulatory Relevance
Under the European Union AI Act (Article 50), AI-generated and modified content requires verifiable transparency markings. Because standalone metadata is frequently stripped by social platforms and CDNs, Eigenmark serves as a **C2PA Soft-Binding Resolver**: using the underlying perceptual hash to match altered media back to its original on-chain manifest even after metadata removal.

---

## 6. Verification & Evaluation Guide

### 6.1. Interactive Web Simulation
1. Visit https://www.eigenmark.app/dashboard.
2. Navigate to the Settlement & Agent Console.
3. Select the "Autonomous Agent (MCP)" tab.
4. Click "Run Agent Simulation" to watch the 4-step MCP execution flow with live JSON-RPC telemetry and Arbitrum settlement logs.

### 6.2. Querying the Hosted MCP Endpoint via cURL
Any evaluator or autonomous agent can query the live hosted endpoint directly:

```bash
# 1. List available MCP tools
curl -X POST https://www.eigenmark.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'

# 2. Call check_usage_policy tool
curl -X POST https://www.eigenmark.app/api/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "check_usage_policy",
      "arguments": {
        "content_hash": "0xab12c345de6789f01234567890abcdef1234567890abcdef1234567890ab1234",
        "intended_use": "commercial_derivative"
      }
    }
  }'
```

### 6.3. Running the Local MCP STDIO Server
```bash
git clone https://github.com/wisdomdivine/eigenmark.git
cd eigenmark/mcp-server
npm install
npm start
```

---

## 7. Demo Video Script (3-Minute Walkthrough)

- **0:00 to 0:45: The Problem**  
  Show an AI agent remixing an image in a script. Demonstrate how changing 1 pixel or compressing the JPEG alters the SHA-256 hash completely, breaking conventional blockchain provenance and cutting out original creators.
- **0:45 to 1:30: Perceptual Invariant Matching & Lineage DAG**  
  Open the Eigenmark portal (https://www.eigenmark.app). Show the Provenance Graph and Invariant Radar. Demonstrate how pHash maintains attribution across derivatives with a 93.8% invariant match score.
- **1:30 to 2:15: Autonomous MCP Tool Execution**  
  Open the Settlement Console in Autonomous Agent Mode. Trigger the 4-step MCP workflow: `verify_provenance` -> `check_usage_policy` -> `license_asset` -> `generate_proof_certificate`. Show the real-time JSON-RPC request and response telemetry.
- **2:15 to 3:00: On-Chain Arbitrum Settlement & Summary**  
  Show the Arbitrum Sepolia transaction receipt and Arbiscan verification where USDC is automatically split between the original creator (20%) and derivative remixer (80%). Conclude on how Eigenmark unlocks autonomous, machine-verifiable commerce for AI agents.

---

## 8. Pitch Deck Slide Outline

- **Slide 1: Title & Vision**  
  Eigenmark: Machine-Verifiable Rights & Autonomous Settlement Layer for AI Agents.
- **Slide 2: The Core Problem**  
  The Generative AI IP Breakdown: Hash fragility under media compression, agent isolation from human browser wallets, and uncompensated derivative remixing.
- **Slide 3: The Three-Pillar Solution**  
  Perceptual Invariants (DCT pHash) + Hosted Model Context Protocol (MCP) + Arbitrum L2 Smart Contract Settlement.
- **Slide 4: System Architecture**  
  End-to-end diagram from Autonomous AI Agent -> Streamable HTTP MCP -> Smart Contract Splitter.
- **Slide 5: Live Provenance Graph & Invariant Radar**  
  Visual DAG lineage tree, multi-axis invariant radar score (94.8%), and capital distribution geometry.
- **Slide 6: Smart Contract & Arbitrum Settlement**  
  `ArbitrumRoyaltySplitter.sol` (`0x71207757FB3F8118EC0BAb8f2251E09973892306`) with sub-cent gas execution.
- **Slide 7: Strategic Positioning & Market Need**  
  Positioning as the pre-flight verification layer for agent pipelines, complementary to Story Protocol's global IP registry, aligned with C2PA soft-binding and EU AI Act Article 50.
- **Slide 8: Live Product & Hosted Tools**  
  Live web portal at https://www.eigenmark.app and public Streamable HTTP MCP endpoint at https://www.eigenmark.app/api/mcp.
- **Slide 9: Realistic Roadmap**  
  Phase 1: Meta PDQ 256-bit and CLIP embedding integration for heavy img2img remixes. Phase 2: x402 HTTP 402 native payment header support. Phase 3: ERC-8004 agent identity integration.
- **Slide 10: Conclusion & Submission Links**  
  GitHub: https://github.com/wisdomdivine/eigenmark | Live Demo: https://www.eigenmark.app

---

## 9. Directory Structure

```
eigenmark/
├── app/                            # Next.js 14 App Router
│   ├── api/                        # REST and MCP API endpoints
│   │   ├── mcp/                    # Streamable HTTP MCP JSON-RPC endpoint
│   │   ├── assets/                 # Asset registry API
│   │   └── agreements/             # Licensing agreements API
│   ├── dashboard/                  # Dashboard and settlement consoles
│   ├── layout.tsx                  # Root layout with metadata and schema
│   ├── page.tsx                    # Landing page
│   ├── opengraph-image.png         # OpenGraph social preview banner
│   └── twitter-image.png           # Twitter summary card
├── components/                     # Component library
│   ├── dashboard/                  # ProvenanceGraph, LicensingConsole, AssetRegistry
│   └── ui/                         # Dropdown, Button, Badge
├── contracts/                      # Solidity smart contracts
│   └── ArbitrumRoyaltySplitter.sol # Atomic two-party royalty escrow contract
├── mcp-server/                     # Standalone STDIO MCP Server
│   ├── index.js                    # STDIO JSON-RPC tool handlers
│   └── test-client.js              # Integration test harness
├── public/                         # Static assets and official vector logos
│   ├── logo.svg                    # Vector geometric invariant logo
│   └── og.png                      # Standard 1200x630 OG image
├── submissions/                    # Hackathon submission documentation
│   └── README.md                   # Submission documentation
├── LICENSE                         # MIT License
├── middleware.ts                   # Security header middleware
└── package.json                    # Project configuration
```

---

## 10. License

MIT License. Copyright (c) 2026 Eigenmark Contributors.
