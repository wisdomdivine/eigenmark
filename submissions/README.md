# Eigenmark: Machine-Verifiable Rights & Autonomous Settlement Layer for AI Agents

Hackathon Submission: 3rd-Web-Hack  
Theme: Hack the Web, build solutions to existing Blockchain problems  
Live Production: https://www.eigenmark.app  
Repository: https://github.com/wisdomnova/eigenmark  
Smart Contract (Arbitrum Sepolia): 0x71207757FB3F8118EC0BAb8f2251E09973892306  

---

## 1. Executive Summary

Eigenmark is a machine-verifiable rights and automated royalty settlement protocol designed for the emerging autonomous AI agent economy.

As autonomous AI agents ingest, remix, fine-tune, and synthesize multimodal assets across the internet, traditional copyright mechanisms and standard blockchain hashes fail. Modifying a single pixel or re-encoding media invalidates conventional cryptographic hashes (such as SHA-256 or Keccak-256), while human-centric legal agreements cannot operate at the sub-second speed required by autonomous agent pipelines.

Eigenmark bridges this gap through three foundational pillars:
1. Perceptual Invariant Hashing: Uses Discrete Cosine Transforms (DCT) to compute 64-bit structural visual fingerprints (pHash) that remain invariant under compression, scaling, color adjustment, and derivative remixing.
2. Model Context Protocol (MCP) Server: Implements the official Model Context Protocol (v2024-11-05) standard, allowing autonomous AI agents (Claude, Cursor, AutoGPT, LLM pipelines) to verify provenance, check usage policies, and execute settlements programmatically via JSON-RPC 2.0.
3. Arbitrum Sepolia Smart Contract Layer: Executes atomic, multi-recipient micro-royalty splits in USDC on Arbitrum L2, distributing payments to original creators and derivative remixers at fractional-cent gas costs.

---

## 2. The Core Problems Solved

### Problem 1: The Cryptographic Hash Fragility Trap
Standard blockchains use exact preimage hashes (SHA-256, Keccak-256). If an AI agent or creator makes minor edits to an image (such as cropping 1 pixel, adjusting color saturation, or transcoding between PNG and WebP), the cryptographic hash completely changes. The blockchain treats the edited asset as an unrelated item, destroying the chain of attribution and enabling unauthorized replication.

### Problem 2: Human-Gated Web3 vs Machine-Native AI Agents
Current decentralized applications assume a human user interacting through a browser wallet popup (such as MetaMask) and signing manual transactions. Autonomous AI agents running inside inference loops cannot click browser extensions. They require standard machine-to-machine interfaces with deterministic tool calling and automated settlement capabilities.

### Problem 3: Multi-Generation Attribution & Recursive Royalties
Generative AI enables deep derivative trees where Asset A inspires Derivative B, which in turn becomes the source for Derivative C. Existing NFT platforms lack the data models to resolve multi-hop recursive parent lineage, resulting in primary creators being excluded from downstream derivative revenue.

---

## 3. System Architecture & Technical Implementation

Eigenmark consists of five interconnected subsystems:

```
+-----------------------------------------------------------------------+
|                       Autonomous AI Agent Layer                       |
|               (Claude 3.7 / Cursor / Custom Agent Run)                |
+-----------------------------------------------------------------------+
                                   |
                         JSON-RPC 2.0 over STDIO
                                   v
+-----------------------------------------------------------------------+
|                    Model Context Protocol (MCP) Server                |
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
|  - 64-bit pHash computation    |   |   - ArbitrumRoyaltySplitter.sol  |
|  - Discrete Cosine Transform   |   |   - Atomic USDC distribution     |
|  - Sub-bit Hamming distance    |   |   - Multi-party escrow settlement|
|  - Lineage DAG resolution      |   |   - Gas: < 85,000 (< $0.002)     |
+--------------------------------+   +----------------------------------+
                |                                     |
                +------------------+------------------+
                                   v
+-----------------------------------------------------------------------+
|                 Storage, Registry & Frontend Layer                    |
|  - Supabase PostgreSQL (pgcrypto, vector indexing, connection pool)   |
|  - Next.js 14 App Router with Server Components & Security Headers    |
|  - Interactive Provenance Graph (Lineage DAG, Radar, Geometry)        |
+-----------------------------------------------------------------------+
```

---

## 4. Subsystem Breakdown

### 4.1. Perceptual Invariant Fingerprinting
- Algorithm: 64-bit perceptual hashing using Discrete Cosine Transform (DCT) on luminance planes.
- Robustness: Invariant against JPEG compression, resolution downscaling, affine transformation, and color grading.
- Distance Metric: Bitwise Hamming distance computation. Assets with a distance <= 6 bits are classified as visual descendants or direct variations with a similarity score >= 90.6%.

### 4.2. Model Context Protocol (MCP) Server
- Standard: Built against `@modelcontextprotocol/sdk` (v2024-11-05).
- Transport: STDIO JSON-RPC 2.0 communication.
- Registered Agent Tools:
  - `verify_provenance`: Traverses recursive parent hashes and calculates pHash invariant match percentage.
  - `check_usage_policy`: Validates licensing terms, commercial rights, required royalty percentages, and automated settlement rules.
  - `license_asset`: Generates calldata and broadcasts settlement transactions to the Arbitrum smart contract.
  - `generate_proof_certificate`: Mints ERC-721 licensing certificates and binds immutable IPFS metadata manifests.
  - `find_related_assets`: Queries the registry for visually similar parent or derivative works using Hamming distance thresholds.

### 4.3. Smart Contract Settlement (`ArbitrumRoyaltySplitter.sol`)
- Network: Arbitrum Sepolia Testnet (Chain ID: 421614).
- Contract Address: `0x71207757FB3F8118EC0BAb8f2251E09973892306`.
- Execution Logic:
  - Accepts atomic deposits in testnet USDC.
  - Recursively splits revenue according to registered parent terms (e.g. 20% to original creator, 80% to derivative creator).
  - Emits indexed event `LicenseSettled(bytes32 indexed assetId, address indexed licensee, uint256 price, uint256 parentRoyalty)`.
  - Transaction gas cost: Under 85,000 gas units (< $0.002 per execution).

### 4.4. Interactive Lineage Graph & Visualizations
The portal features three analytical views:
1. Recursive Lineage DAG: Visual tree illustrating parent-to-child derivative paths across multiple generations.
2. Invariant Radar: Multi-axis metric chart displaying structural similarity, compression invariance, spatial symmetry, and frequency distribution.
3. Royalty Cluster Geometry: Circle-packing visualization of capital distribution across primary and secondary rights holders.

### 4.5. Web Application Infrastructure
- Framework: Next.js 14 (App Router) with React 18 and TypeScript.
- Design System: Custom dark mode palette (`#0A0B0D` background, `#14161A` surface, `#60A5FA` accent) adhering to clean typography without decorative clutter.
- Database: Supabase PostgreSQL connected via SSL transaction pooler (`aws-0-eu-west-2.pooler.supabase.com:6543`).
- Security Middleware: Implements strict Content-Security-Policy (CSP), HTTP Strict Transport Security (HSTS), X-Frame-Options: DENY, and X-Content-Type-Options: nosniff.
- SEO & Discoverability: Full OpenGraph, Twitter Cards ($1200x630), JSON-LD Sitelinks Searchbox schemas, dynamic sitemap.xml, and robots.txt.

---

## 5. Verification & Testing

### 5.1. Automated Agent Simulation
Evaluators can test the autonomous agent workflow directly in the web application:
1. Navigate to https://www.eigenmark.app/dashboard.
2. Open the Settlement & Agent Console.
3. Select the "Autonomous Agent (MCP)" tab.
4. Click "Run Agent Simulation".
5. Observe the 4-step tool execution sequence, JSON-RPC telemetry, request/response inspector, and simulated on-chain Arbitrum receipt.

### 5.2. Running the MCP Server Locally
```bash
# Clone the repository
git clone https://github.com/wisdomnova/eigenmark.git
cd eigenmark/mcp-server

# Install dependencies
npm install

# Start the MCP STDIO Server
npm start

# Run end-to-end integration test suite
node test-client.js
```

### 5.3. Frontend & Type Safety Verification
```bash
cd /path/to/eigenmark
npm install
npx tsc --noEmit
npm run build
```

---

## 6. Project Directory Layout

```
eigenmark/
├── app/                            # Next.js 14 App Router
│   ├── api/                        # REST API endpoints (/api/assets, /api/agreements, /api/users)
│   ├── dashboard/                  # Dashboard and analytics pages
│   ├── layout.tsx                  # Root layout with JSON-LD schema and metadata
│   ├── page.tsx                    # Landing page with hero and feature showcase
│   ├── opengraph-image.png         # Dynamic social preview banner (1200x630)
│   ├── twitter-image.png           # Twitter summary card
│   ├── sitemap.ts                  # Dynamic XML sitemap generator
│   └── robots.ts                   # Search crawler directives
├── components/                     # React UI component library
│   ├── dashboard/                  # ProvenanceGraph, LicensingConsole, AssetRegistry
│   ├── landing/                    # HeroSection, FeatureMatrix, WorkflowDemo
│   └── ui/                         # Dropdown, Modal, Button, Badge
├── contracts/                      # Solidity smart contracts
│   └── ArbitrumRoyaltySplitter.sol # Multi-party royalty escrow and split contract
├── mcp-server/                     # Model Context Protocol server
│   ├── index.js                    # STDIO JSON-RPC 2.0 tool handlers
│   ├── test-client.js              # Integration test harness
│   └── package.json                # MCP SDK dependencies
├── public/                         # Static assets, vector logo, and icons
│   ├── logo.svg                    # Official geometric invariant vector logo
│   ├── og.png                      # Standard OpenGraph image (1200x630)
│   ├── og-square.png               # Square social avatar (1024x1024)
│   └── favicon.ico                 # Browser favicon
├── submissions/                    # Hackathon submission documentation
│   └── README.md                   # Detailed submission document
├── middleware.ts                   # Security and header middleware
├── next.config.mjs                 # Next.js configuration
├── tailwind.config.ts              # Design system tokens and styling rules
└── tsconfig.json                   # Strict TypeScript compiler options
```

---

## 7. Roadmap & Future Work

1. EigenLayer AVS Integration: Transition perceptual hash verification from centralized workers to an Actively Validated Service (AVS) secured by restaked ETH.
2. Temporal Video Embeddings: Extend static image pHash to 3D convolutional video embeddings (C3D) and audio acoustic fingerprinting.
3. Cross-Chain Settlement via Chainlink CCIP: Allow autonomous agents operating on Base, Ethereum, or Solana to query Eigenmark and settle royalties in their native tokens.

---

## 8. License & Acknowledgements

- License: MIT License.
- Hackathon: 3rd-Web-Hack.
- Team: Eigenmark Contributors.
