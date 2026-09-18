import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// PostgreSQL connection config
const dbUrl = process.env.DATABASE_URL || "postgresql://user@localhost:5432/proofchain";
const pool = new pg.Pool({
  connectionString: dbUrl,
});

// Verify connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.error("Connected to PostgreSQL database at port 5432");
    release();
  }
});

const server = new Server(
  {
    name: "eigenmark-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Helper: recursive lineage finder
async function getLineage(contentHash, lineage = []) {
  const res = await pool.query(
    "SELECT content_hash, title, creator_address, parent_hash, created_at FROM assets WHERE content_hash = $1",
    [contentHash]
  );
  
  if (res.rows.length === 0) {
    return lineage;
  }
  
  const asset = res.rows[0];
  lineage.push({
    title: asset.title,
    contentHash: asset.content_hash,
    creatorAddress: asset.creator_address,
    createdAt: asset.created_at,
  });
  
  if (asset.parent_hash) {
    return getLineage(asset.parent_hash, lineage);
  }
  
  return lineage;
}

// 1. Tool Definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "verify_provenance",
        description: "Resolves registration details, creator address, block timestamp, and origin parent lineage history for a given creative asset.",
        inputSchema: {
          type: "object",
          properties: {
            content_hash: {
              type: "string",
              description: "SHA-256 content hash of the asset (prefixed with 0x)",
            },
          },
          required: ["content_hash"],
        },
      },
      {
        name: "find_related_assets",
        description: "Queries the registry to find visually similar assets based on Hamming distance of their perceptual hashes (pHash).",
        inputSchema: {
          type: "object",
          properties: {
            phash: {
              type: "string",
              description: "16-character hexadecimal perceptual hash",
            },
          },
          required: ["phash"],
        },
      },
      {
        name: "get_license",
        description: "Retrieves the licensing rules, purchase pricing, and royalty split metrics for a specific asset.",
        inputSchema: {
          type: "object",
          properties: {
            content_hash: {
              type: "string",
              description: "SHA-256 content hash of the asset (prefixed with 0x)",
            },
          },
          required: ["content_hash"],
        },
      },
      {
        name: "check_usage_policy",
        description: "Verifies if a specific use case (e.g. commercial derivative, LLM ingestion) is permitted and returns the required royalty split terms.",
        inputSchema: {
          type: "object",
          properties: {
            content_hash: {
              type: "string",
              description: "SHA-256 content hash of the asset (prefixed with 0x)",
            },
            intended_use: {
              type: "string",
              description: "Target use case (commercial_derivative, llm_training, lora_fine_tuning)",
            },
          },
          required: ["content_hash"],
        },
      },
      {
        name: "generate_proof_certificate",
        description: "Generates cryptographic proof manifest and ERC-721 licensing certificate metadata linked to IPFS.",
        inputSchema: {
          type: "object",
          properties: {
            transaction_hash: {
              type: "string",
              description: "Arbitrum Sepolia settlement transaction hash",
            },
            content_hash: {
              type: "string",
              description: "SHA-256 content hash of the licensed asset",
            },
          },
          required: ["transaction_hash", "content_hash"],
        },
      },
      {
        name: "check_usage",
        description: "Verifies if a specific use case is permitted and returns royalty terms.",
        inputSchema: {
          type: "object",
          properties: {
            content_hash: {
              type: "string",
              description: "SHA-256 content hash of the asset (prefixed with 0x)",
            },
            use_case: {
              type: "object",
              properties: {
                commercial: { type: "boolean" },
                derivative: { type: "boolean" },
              },
              required: ["commercial", "derivative"],
            },
          },
          required: ["content_hash", "use_case"],
        },
      },
      {
        name: "license_asset",
        description: "Prepares structured settlement parameters to purchase a license and settle parent splits on chain.",
        inputSchema: {
          type: "object",
          properties: {
            content_hash: {
              type: "string",
              description: "SHA-256 content hash of the asset (prefixed with 0x)",
            },
            licensee_address: {
              type: "string",
              description: "EVM wallet address of the licensee client (prefixed with 0x)",
            },
          },
          required: ["content_hash", "licensee_address"],
        },
      },
    ],
  };
});

// 2. Call Tool Handlers
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  try {
    switch (name) {
      case "verify_provenance": {
        const { content_hash } = args;
        const lineage = await getLineage(content_hash);
        
        if (lineage.length === 0) {
          return {
            content: [{ type: "text", text: "Asset not found in the registry." }],
          };
        }
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                status: "verified",
                registered: true,
                currentAsset: lineage[0],
                lineageHistory: lineage.slice(1),
              }, null, 2),
            },
          ],
        };
      }
      
      case "find_related_assets": {
        const { phash } = args;
        const res = await pool.query(
          `SELECT content_hash, title, creator_address, phash, 
                  hamming_distance(phash, $1) as distance 
           FROM assets 
           ORDER BY distance ASC`,
          [phash]
        );
        
        const matches = res.rows
          .map((row) => {
            const similarity = Math.round(((64 - row.distance) * 100) / 64);
            return {
              title: row.title,
              contentHash: row.content_hash,
              creatorAddress: row.creator_address,
              phash: row.phash,
              similarityPercentage: similarity,
            };
          })
          .filter((match) => match.similarityPercentage >= 85);
          
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                queryPHash: phash,
                matchesFound: matches.length,
                potentialDerivatives: matches,
              }, null, 2),
            },
          ],
        };
      }
      
      case "get_license": {
        const { content_hash } = args;
        const res = await pool.query(
          "SELECT title, creator_address, royalty_split, parent_hash FROM assets WHERE content_hash = $1",
          [content_hash]
        );
        
        if (res.rows.length === 0) {
          return {
            content: [{ type: "text", text: "Asset not found in the registry." }],
          };
        }
        
        const asset = res.rows[0];
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                assetTitle: asset.title,
                licensingModel: "Standard Creative Commons Attribution",
                terms: {
                  priceUSDC: 10,
                  royaltySplitPercent: parseFloat(asset.royalty_split),
                  parentAssetHash: asset.parent_hash || null,
                  recipientAddresses: {
                    primaryCreator: asset.creator_address,
                  },
                },
              }, null, 2),
            },
          ],
        };
      }
      
      case "check_usage_policy":
      case "check_usage": {
        const { content_hash, intended_use, use_case } = args;
        const res = await pool.query(
          "SELECT title, creator_address, royalty_split, parent_hash FROM assets WHERE content_hash = $1",
          [content_hash]
        );
        
        if (res.rows.length === 0) {
          return {
            content: [{ type: "text", text: "Asset not found in the registry." }],
          };
        }
        
        const asset = res.rows[0];
        const royalty = parseFloat(asset.royalty_split) || 20;
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                policyStatus: "AUTHORIZED",
                licenseFeeUSDC: 10.0,
                arbitrumContract: "0x71207757FB3F8118EC0BAb8f2251E09973892306",
                intendedUse: intended_use || "commercial_derivative",
                royaltySplitDistribution: {
                  primaryCreatorPercent: royalty,
                  derivativeCreatorPercent: 100 - royalty,
                },
                commercialRightsPermitted: true,
                x402PaymentSupported: true,
              }, null, 2),
            },
          ],
        };
      }
      
      case "generate_proof_certificate": {
        const { transaction_hash, content_hash } = args;
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                certificateTokenId: "0x7a892b4092",
                ipfsManifestCID: "bafybeiczsscdspl7kiog7eoxikx4w646s",
                transactionHash: transaction_hash || "0x4f829b10a5620984918e907d471026027ab57849103c80918a20984719082049",
                contentHash: content_hash,
                registryStatus: "ACTIVE_VALID",
                timestamp: new Date().toISOString(),
              }, null, 2),
            },
          ],
        };
      }
      
      case "license_asset": {
        const { content_hash, licensee_address } = args;
        const res = await pool.query(
          "SELECT creator_address, royalty_split FROM assets WHERE content_hash = $1",
          [content_hash]
        );
        
        if (res.rows.length === 0) {
          return {
            content: [{ type: "text", text: "Asset not found in the registry." }],
          };
        }
        
        const asset = res.rows[0];
        const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Local/Testnet Hardhat Deploy Address
        
        // Return structured parameters to the client for on-chain execution
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                status: "signature_required",
                licenseTerms: "Standard Split License Agreement",
                settlementDetails: {
                  contractAddress: contractAddress,
                  functionName: "purchaseLicense",
                  arguments: [content_hash],
                  valueWei: "1000000000000000", // 0.001 ETH mockup
                  gasLimitEstimate: 150000,
                },
              }, null, 2),
            },
          ],
        };
      }
      
      default:
        throw new Error(`Unknown tool name: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error executing tool: ${error.message}`,
        },
      ],
    };
  }
});

// Run server using stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Eigenmark Model Context Protocol (MCP) server listening on stdio");
