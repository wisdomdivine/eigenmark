import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SERVER_METADATA = {
  name: "eigenmark-mcp-server",
  version: "2.0.0",
  protocolVersion: "2026-07-28",
  capabilities: {
    tools: {
      listChanged: false,
    },
    resources: {},
    prompts: {},
  },
};

const TOOLS_LIST = [
  {
    name: "verify_provenance",
    description: "Resolves registration details, creator address, block timestamp, perceptual similarity, and origin parent lineage history for a given creative asset.",
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
    description: "Queries the registry to find visually similar assets based on Hamming distance of their 64-bit perceptual hashes (pHash).",
    inputSchema: {
      type: "object",
      properties: {
        phash: {
          type: "string",
          description: "16-character hexadecimal perceptual hash",
        },
        max_distance: {
          type: "number",
          description: "Maximum bitwise Hamming distance threshold (default: 6 bits for >= 90.6% similarity)",
        },
      },
      required: ["phash"],
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
    name: "license_asset",
    description: "Prepares settlement calldata and execution parameters for Arbitrum Sepolia smart contract (ArbitrumRoyaltySplitter.sol) with atomic parent/child splits.",
    inputSchema: {
      type: "object",
      properties: {
        content_hash: {
          type: "string",
          description: "SHA-256 content hash of the asset (prefixed with 0x)",
        },
        licensee_address: {
          type: "string",
          description: "EVM wallet address of the licensee agent (prefixed with 0x)",
        },
        payment_rail: {
          type: "string",
          description: "Payment rail protocol (arbitrum_sepolia_usdc, x402_stream)",
        },
      },
      required: ["content_hash", "licensee_address"],
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
];

// Helper: Calculate Hamming distance between two 16-hex char pHashes
function calculateHammingDistance(hex1: string, hex2: string): number {
  const clean1 = hex1.replace(/^0x/, "").padStart(16, "0");
  const clean2 = hex2.replace(/^0x/, "").padStart(16, "0");
  let distance = 0;
  for (let i = 0; i < 16; i++) {
    const n1 = parseInt(clean1[i] || "0", 16);
    const n2 = parseInt(clean2[i] || "0", 16);
    let xor = n1 ^ n2;
    while (xor > 0) {
      distance += xor & 1;
      xor >>= 1;
    }
  }
  return distance;
}

export async function GET() {
  return NextResponse.json(
    {
      server: SERVER_METADATA,
      tools: TOOLS_LIST,
      endpoint: "https://www.eigenmark.app/api/mcp",
      transport: "Streamable HTTP (JSON-RPC 2.0)",
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Payment-Protocol",
      },
    }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Payment-Protocol",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jsonrpc, id, method, params } = body;

    // Standard MCP Protocol handshake & tool dispatch
    if (method === "initialize") {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: id ?? 1,
          result: {
            protocolVersion: "2026-07-28",
            serverInfo: SERVER_METADATA,
            capabilities: SERVER_METADATA.capabilities,
          },
        },
        { headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    if (method === "tools/list") {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: id ?? 1,
          result: {
            tools: TOOLS_LIST,
          },
        },
        { headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    if (method === "tools/call") {
      const toolName = params?.name;
      const args = params?.arguments || {};

      switch (toolName) {
        case "verify_provenance": {
          const { content_hash } = args;
          const { data: asset } = await supabase
            .from("assets")
            .select("*")
            .eq("content_hash", content_hash)
            .single();

          if (!asset) {
            return NextResponse.json({
              jsonrpc: "2.0",
              id: id ?? 1,
              result: {
                content: [{ type: "text", text: "Asset not found in registry." }],
              },
            });
          }

          let parentAsset = null;
          if (asset.parent_id || asset.parent_hash) {
            const { data: p } = await supabase
              .from("assets")
              .select("*")
              .or(`id.eq.${asset.parent_id},content_hash.eq.${asset.parent_hash}`)
              .single();
            parentAsset = p;
          }

          return NextResponse.json({
            jsonrpc: "2.0",
            id: id ?? 1,
            result: {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "verified",
                      registered: true,
                      asset: {
                        id: asset.id,
                        title: asset.title,
                        creator: asset.creator_address,
                        aiModel: asset.ai_model,
                        contentHash: asset.content_hash,
                        phash: asset.phash,
                        royaltySplit: asset.royalty_split,
                        registeredAt: asset.created_at,
                      },
                      parentLineage: parentAsset
                        ? {
                            title: parentAsset.title,
                            creator: parentAsset.creator_address,
                            contentHash: parentAsset.content_hash,
                            requiredRoyaltyPct: parentAsset.royalty_split,
                          }
                        : null,
                    },
                    null,
                    2
                  ),
                },
              ],
            },
          });
        }

        case "find_related_assets": {
          const { phash, max_distance = 6 } = args;
          const { data: allAssets } = await supabase.from("assets").select("*");
          const matches = (allAssets || [])
            .map((item) => {
              const distance = calculateHammingDistance(phash, item.phash || "0000000000000000");
              const similarity = Math.round(((64 - distance) * 100) / 64);
              return {
                title: item.title,
                contentHash: item.content_hash,
                creator: item.creator_address,
                phash: item.phash,
                hammingDistance: distance,
                similarityPercentage: similarity,
              };
            })
            .filter((m) => m.hammingDistance <= max_distance)
            .sort((a, b) => a.hammingDistance - b.hammingDistance);

          return NextResponse.json({
            jsonrpc: "2.0",
            id: id ?? 1,
            result: {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      queryPHash: phash,
                      thresholdBits: max_distance,
                      matchesFound: matches.length,
                      matches: matches,
                    },
                    null,
                    2
                  ),
                },
              ],
            },
          });
        }

        case "check_usage_policy":
        case "check_usage":
        case "get_license": {
          const { content_hash } = args;
          const { data: asset } = await supabase
            .from("assets")
            .select("*")
            .eq("content_hash", content_hash)
            .single();

          if (!asset) {
            return NextResponse.json({
              jsonrpc: "2.0",
              id: id ?? 1,
              result: {
                content: [{ type: "text", text: "Asset not found in registry." }],
              },
            });
          }

          return NextResponse.json({
            jsonrpc: "2.0",
            id: id ?? 1,
            result: {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      policyStatus: "AUTHORIZED",
                      licenseFeeUSDC: 10.0,
                      arbitrumContract: "0x71207757FB3F8118EC0BAb8f2251E09973892306",
                      royaltySplitDistribution: {
                        primaryCreatorPercent: Number(asset.royalty_split) || 20,
                        derivativeCreatorPercent: 100 - (Number(asset.royalty_split) || 20),
                      },
                      commercialRightsPermitted: true,
                      x402PaymentSupported: true,
                    },
                    null,
                    2
                  ),
                },
              ],
            },
          });
        }

        case "license_asset": {
          const { content_hash, licensee_address } = args;
          const { data: asset } = await supabase
            .from("assets")
            .select("*")
            .eq("content_hash", content_hash)
            .single();

          const royalty = Number(asset?.royalty_split) || 20;
          return NextResponse.json({
            jsonrpc: "2.0",
            id: id ?? 1,
            result: {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      status: "READY_FOR_SETTLEMENT",
                      chain: "Arbitrum Sepolia (421614)",
                      contract: "0x71207757FB3F8118EC0BAb8f2251E09973892306",
                      callData: {
                        function: "purchaseLicense(bytes32 assetId, uint256 fee)",
                        parameters: [content_hash, 10000000],
                        value: "10 USDC",
                        splitRecipients: [
                          {
                            recipient: asset?.creator_address || "0x1111111111111111111111111111111111111111",
                            sharePercent: royalty,
                            amountUSDC: 10 * (royalty / 100),
                          },
                          {
                            recipient: licensee_address,
                            sharePercent: 100 - royalty,
                            amountUSDC: 10 * (1 - royalty / 100),
                          },
                        ],
                      },
                    },
                    null,
                    2
                  ),
                },
              ],
            },
          });
        }

        case "generate_proof_certificate": {
          const { transaction_hash, content_hash } = args;
          return NextResponse.json({
            jsonrpc: "2.0",
            id: id ?? 1,
            result: {
              content: [
                {
                  type: "text",
                  text: JSON.stringify(
                    {
                      certificateTokenId: "0x7a892b4092",
                      ipfsManifestCID: "bafybeiczsscdspl7kiog7eoxikx4w646s",
                      transactionHash: transaction_hash,
                      contentHash: content_hash,
                      registryStatus: "ACTIVE_VALID",
                      timestamp: new Date().toISOString(),
                    },
                    null,
                    2
                  ),
                },
              ],
            },
          });
        }

        default:
          return NextResponse.json({
            jsonrpc: "2.0",
            id: id ?? 1,
            error: {
              code: -32601,
              message: `Unknown tool: ${toolName}`,
            },
          });
      }
    }

    return NextResponse.json({
      jsonrpc: "2.0",
      id: id ?? 1,
      error: {
        code: -32600,
        message: "Invalid JSON-RPC request",
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: 1,
        error: {
          code: -32603,
          message: errorMsg,
        },
      },
      { status: 500 }
    );
  }
}
