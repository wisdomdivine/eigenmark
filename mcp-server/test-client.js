import { spawn } from "child_process";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: "../.env.local" });
dotenv.config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

// Setup mock assets in the database for the test
async function setupMockData() {
  console.log("Setting up mock database entries...");
  await pool.query("DELETE FROM licensing_agreements;");
  await pool.query("DELETE FROM assets;");
  
  // Insert Alice's original asset
  await pool.query(`
    INSERT INTO assets (content_hash, title, description, creator_address, ai_model, license_terms_hash, phash)
    VALUES (
      '0xab12c345de6789f01234567890abcdef1234567890abcdef1234567890ab1234',
      'Alice Original Eagle Artwork',
      'A beautiful vector illustration of a bald eagle soaring over mountains',
      '0x1111111111111111111111111111111111111111',
      'Human Created',
      '0xlicensetermshashplaceholder',
      '0f0f0f0f0f0f0f0f'
    );
  `);

  // Insert Bob's derivative asset (visual similarity match)
  await pool.query(`
    INSERT INTO assets (content_hash, title, description, creator_address, ai_model, license_terms_hash, parent_hash, phash)
    VALUES (
      '0xcd34e567f01234567890abcdef1234567890abcdef1234567890abcdef1234cd',
      'Bob Remix Eagle Anim',
      'A fluid remix of mathematical eagle fractals combining animation frames',
      '0x2222222222222222222222222222222222222222',
      'Stable Diffusion 3',
      '0xlicensetermshashplaceholder',
      '0xab12c345de6789f01234567890abcdef1234567890abcdef1234567890ab1234',
      '0f0f0f0f0f0f0f00' -- pHash difference = 4 bits (93.75% similarity)
    );
  `);
  
  console.log("Mock database entries populated.");
}

async function runTests() {
  await setupMockData();
  
  console.log("Spawning MCP Server process...");
  const server = spawn("node", ["index.js"], {
    stdio: ["pipe", "pipe", "inherit"]
  });

  server.stdout.on("data", (data) => {
    const raw = data.toString().trim();
    console.log("\n[Server stdout raw]:\n", raw);
    
    try {
      const json = JSON.parse(raw);
      console.log("\n[Parsed Response]:\n", JSON.stringify(json, null, 2));
    } catch {
      // Might receive multiple JSONs or plain text
    }
  });

  // Helper to send JSON-RPC requests
  const sendRequest = (req) => {
    console.log(`\n---> Sending JSON-RPC request: ${req.method}`);
    server.stdin.write(JSON.stringify(req) + "\n");
  };

  // 1. List tools
  setTimeout(() => {
    sendRequest({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list",
      params: {}
    });
  }, 1000);

  // 2. Call verify_provenance for Bob's asset (returns lineage)
  setTimeout(() => {
    sendRequest({
      jsonrpc: "2.0",
      id: 2,
      method: "tools/call",
      params: {
        name: "verify_provenance",
        arguments: {
          content_hash: "0xcd34e567f01234567890abcdef1234567890abcdef1234567890abcdef1234cd"
        }
      }
    });
  }, 2000);

  // 3. Call find_related_assets (perceptual hashing checks)
  setTimeout(() => {
    sendRequest({
      jsonrpc: "2.0",
      id: 3,
      method: "tools/call",
      params: {
        name: "find_related_assets",
        arguments: {
          phash: "0f0f0f0f0f0f0f01" // 1 bit distance from Alice, 3 bit distance from Bob (similar parent search)
        }
      }
    });
  }, 3000);

  // 4. Clean up and close
  setTimeout(() => {
    console.log("\nClosing MCP Server child process...");
    server.kill();
    pool.end();
    console.log("All tests complete.");
    process.exit(0);
  }, 4500);
}

runTests().catch(console.error);
