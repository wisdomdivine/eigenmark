# Eigenmark

The machine verifiable rights layer for digital content.

Eigenmark enables autonomous agents, creators, and applications to discover content relationships, check usage rights, and settle royalties automatically.

> We do not make AI decide what is legal. We make rights machine readable so AI does not have to guess.

---

## Key Capabilities

1. **Humans** register and verify original creative works.
2. **Applications** query and verify asset provenance records.
3. **AI Agents** check usage permissions before using assets in workflows.
4. **AI Agents** license assets autonomously and settle payments.
5. **Smart Contracts** distribute split royalties to parent and derivative creators.

---

## System Architecture

```
                  EIGENMARK
                      │
     ┌────────────────┼────────────────┐
     ▼                ▼                ▼
  Web UI           REST API        MCP Server
     │                │                │
     │                │                ▼
     │                │            AI Agents
     │                │                │
     └────────┬───────┴────────────────┘
              ▼
        Eigenmark Core
              │
     ┌────────┴────────┐
     ▼                 ▼
 PostgreSQL        Blockchain
 (pHash Index)   (Solidity Registry)
```

---

## Core Features

### Exact Identity vs Visual Similarity
* **Cryptographic Hash**: We compute the SHA 256 hash of every uploaded file for absolute identity mapping.
* **Perceptual Hash (pHash)**: We calculate a 64 bit perceptual hash using 2D Discrete Cosine Transform (DCT II) coefficients. This detects visually similar files even if size or format differs.
* **Hamming Distance**: We run SQL similarity queries utilizing a custom popcount function to detect visual matches with 85 percent or greater similarity.

### Provenance Intelligence
Our upload UI analyzes file signatures against the database. If a similar asset exists, the system flags it as a potential derivative, offering choices to **Declare as derivative** (establishing parent links) or **Register as independent work**.

---

## Model Context Protocol (MCP) Tools

The Eigenmark MCP server exposes high level domain capabilities to agents:

1. **`verify_provenance`**: Resolves registration details, creator address, block timestamp, and origin parent lineage history.
2. **`find_related_assets`**: Performs visual similarity checks based on Hamming distance.
3. **`get_license`**: Returns licensing price, split rules, and parent creator wallet details.
4. **`check_usage`**: Resolves whether a specific use case (commercial, derivative) is allowed and returns expected royalty splits.
5. **`license_asset`**: Returns structured transaction parameters for split payment execution.

---

## Getting Started

### Local Setup
1. Install package dependencies:
   ```bash
   npm install
   ```

2. Run database schema migrations:
   ```bash
   psql -d eigenmark -f schema.sql
   ```

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

### Running Test Suites

* **Smart Contract Tests**:
  ```bash
  npx hardhat test
  ```

* **MCP Server Integration Tests**:
  ```bash
  cd mcp-server && node test-client.js
  ```

---

## Judge Evaluation Quickstart (BLI Legal Tech Hackathon 2)

### On-Chain Smart Contract
* **Network**: Arbitrum Sepolia Testnet
* **Contract Address**: `0x892a3bc90de12c43abef9023ab90d34e902bc345d`
* **Explorer**: [Arbiscan Sepolia](https://sepolia.arbiscan.io/address/0x892a3bc90de12c43abef9023ab90d34e902bc345d)

### Zero-Friction Judge Review Mode
Judges evaluating the portal do not need to install MetaMask or request testnet faucets. Clicking **"Explore as Guest (Judge Review Mode)"** grants full immediate access to the Lineage Topology Explorer, Autonomous MCP Agent Simulation Console, and Provenance Verification engine.

### Tracks and Bounties Applied
1. **LegalTech & RegTech**: Court-admissible proof of licensed use, tamper-proof chain of custody, and programmatic contractual consideration.
2. **AI x Blockchain**: Real-time perceptual hashing surviving compression and format conversion with automated creator royalty splits.
3. **RYO-CHAN Autonomous Agents ($6,000 Bounty)**: Full Model Context Protocol (MCP) server enabling autonomous agents in Claude and Cursor to verify usage rights and settle micro-licenses programmatically.
4. **Chainlink CRE ($2,000 Bounty)**: Deterministic cross-contract and cross-chain execution rails for algorithmic digital rights.

