import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const res = await pool.query(
      `SELECT id, content_hash as "contentHash", title, description, 
              creator_address as "creatorAddress", ai_model as "aiModel", 
              license_terms_hash as "licenseTermsHash", parent_hash as "parentId", 
              phash, royalty_split as "royaltySplit", media_url as "mediaUrl", created_at as timestamp 
       FROM assets 
       ORDER BY id ASC`
    );
    
    const formattedRows = res.rows.map((row) => ({
      ...row,
      id: String(row.id),
      royaltySplit: parseFloat(row.royaltySplit),
      timestamp: new Date(row.timestamp).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }) + " " + new Date(row.timestamp).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      transactionHash: "0x892a3bc90de12c43abef9023ab90d34e902bc345d90e20c90f23a91bc90d1f43", // Mock txHash
    }));
    
    return NextResponse.json(formattedRows);
  } catch (error: any) {
    console.error("Database query assets failed:", error);
    return NextResponse.json(
      { error: "Database query assets failed" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const {
      title,
      description,
      aiModel,
      contentHash,
      creatorAddress,
      royaltySplit,
      parentId, // parent_hash
      phash,
      mediaUrl,
    } = await request.json();

    if (!title || !contentHash || !creatorAddress || !phash) {
      return NextResponse.json(
        { error: "Missing required asset parameters" },
        { status: 400 }
      );
    }

    const res = await pool.query(
      `INSERT INTO assets (content_hash, title, description, creator_address, ai_model, license_terms_hash, parent_hash, phash, royalty_split, media_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, content_hash as "contentHash", title, description, 
                 creator_address as "creatorAddress", ai_model as "aiModel", 
                 license_terms_hash as "licenseTermsHash", parent_hash as "parentId", 
                 phash, royalty_split as "royaltySplit", media_url as "mediaUrl", created_at as timestamp`,
      [
        contentHash,
        title,
        description,
        creatorAddress,
        aiModel,
        "0xlicensetermshashplaceholder",
        parentId || null,
        phash,
        royaltySplit || 10.00,
        mediaUrl || null,
      ]
    );

    const row = res.rows[0];
    const formattedAsset = {
      ...row,
      id: String(row.id),
      royaltySplit: parseFloat(row.royaltySplit),
      timestamp: new Date(row.timestamp).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }) + " " + new Date(row.timestamp).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      transactionHash: "0x892a3bc90de12c43abef9023ab90d34e902bc345d90e20c90f23a91bc90d1f43",
    };

    return NextResponse.json(formattedAsset);
  } catch (error: any) {
    console.error("Database insert asset failed:", error);
    return NextResponse.json(
      { error: "Database insert asset failed", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
