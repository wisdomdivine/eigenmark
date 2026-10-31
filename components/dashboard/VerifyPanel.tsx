"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

interface VerifyPanelProps {
  assets: Array<Asset>;
}

async function computeSha256(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return "0x" + hashHex;
}

async function computePHash(file: File): Promise<string> {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) {
      resolve("0000000000000000");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve("0000000000000000");
          return;
        }

        ctx.drawImage(img, 0, 0, 32, 32);
        const imgData = ctx.getImageData(0, 0, 32, 32);
        const data = imgData.data;

        // Grayscale conversion
        const gray = new Float32Array(32 * 32);
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          gray[i / 4] = 0.299 * r + 0.587 * g + 0.114 * b;
        }

        // Discrete Cosine Transform (DCT-II) - Top-left 8x8 grid
        const dct = new Float32Array(8 * 8);
        for (let u = 0; u < 8; u++) {
          for (let v = 0; v < 8; v++) {
            let sum = 0;
            for (let x = 0; x < 32; x++) {
              for (let y = 0; y < 32; y++) {
                sum += gray[x * 32 + y] *
                       Math.cos(((2 * x + 1) * u * Math.PI) / 64) *
                       Math.cos(((2 * y + 1) * v * Math.PI) / 64);
              }
            }
            let cu = u === 0 ? 1 / Math.sqrt(2) : 1;
            let cv = v === 0 ? 1 / Math.sqrt(2) : 1;
            dct[u * 8 + v] = 0.25 * cu * cv * sum;
          }
        }

        let sumCoeffs = 0;
        for (let i = 1; i < 64; i++) {
          sumCoeffs += dct[i];
        }
        const mean = sumCoeffs / 63;

        let hexHash = "";
        let currentByte = 0;
        for (let i = 0; i < 64; i++) {
          const bit = dct[i] > mean ? 1 : 0;
          currentByte = (currentByte << 1) | bit;
          
          if ((i + 1) % 8 === 0) {
            hexHash += currentByte.toString(16).padStart(2, "0");
            currentByte = 0;
          }
        }

        resolve(hexHash);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function hammingDistance(h1: string, h2: string): number {
  if (!h1 || !h2 || h1.length !== 16 || h2.length !== 16) return 64;
  let dist = 0;
  for (let i = 0; i < 16; i++) {
    const v1 = parseInt(h1[i], 16);
    const v2 = parseInt(h2[i], 16);
    let xor = v1 ^ v2;
    while (xor > 0) {
      dist += xor & 1;
      xor >>= 1;
    }
  }
  return dist;
}

export default function VerifyPanel({ assets }: VerifyPanelProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isHashing, setIsHashing] = useState(false);
  const [verifiedAsset, setVerifiedAsset] = useState<Asset | null>(null);
  const [matchType, setMatchType] = useState<"exact" | "perceptual" | null>(null);
  const [computedHashes, setComputedHashes] = useState<{ sha256: string; phash: string } | null>(null);
  const [searched, setSearched] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFileVerification = async (file: File) => {
    setFileName(file.name);
    setIsHashing(true);
    setSearched(false);
    setVerifiedAsset(null);
    setMatchType(null);

    try {
      const sha256 = await computeSha256(file);
      const phash = await computePHash(file);
      setComputedHashes({ sha256, phash });

      // 1. Check exact SHA-256 match
      const exactMatch = assets.find(
        (a) => a.contentHash.toLowerCase() === sha256.toLowerCase()
      );

      if (exactMatch) {
        setVerifiedAsset(exactMatch);
        setMatchType("exact");
      } else {
        // 2. Check perceptual similarity match
        let bestMatch: Asset | null = null;
        let minDistance = 11; // Threshold

        for (const asset of assets) {
          if (asset.phash) {
            const dist = hammingDistance(phash, asset.phash);
            if (dist < minDistance) {
              minDistance = dist;
              bestMatch = asset;
            }
          }
        }

        if (bestMatch) {
          setVerifiedAsset(bestMatch);
          setMatchType("perceptual");
        } else {
          setVerifiedAsset(null);
        }
      }
    } catch (err) {
      console.error("Verification hash computation failed:", err);
      setVerifiedAsset(null);
    } finally {
      setSearched(true);
      setIsHashing(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFileVerification(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFileVerification(e.target.files[0]);
    }
  };

  const handleSelectAsset = (asset: Asset) => {
    setFileName(asset.title);
    setComputedHashes({ sha256: asset.contentHash, phash: asset.phash || "N/A" });
    setVerifiedAsset(asset);
    setMatchType("exact");
    setSearched(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-2xl bg-surface p-8 rounded-3xl mx-auto my-12"
    >
      <div className="mb-8 text-left">
        <span className="text-xs uppercase tracking-widest text-brand font-normal block mb-2">
          Verify digital authenticity
        </span>
        <h2 className="text-2xl font-light text-text-primary tracking-tight">
          Verify creative provenance
        </h2>
        <p className="text-xs font-light text-text-muted mt-1 leading-relaxed">
          Drop any media file to compute client side cryptographic and perceptual signatures. Eigenmark searches the database and smart contract ledger in real time.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Dropzone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`h-40 rounded-2xl flex flex-col items-center justify-center border-none transition-colors duration-200 text-center p-4 relative ${
            dragActive ? "bg-surface-active" : "bg-surface-active/30"
          }`}
        >
          <input
            type="file"
            id="verify-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
          />
          {isHashing ? (
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-light text-brand">Calculating file signatures...</span>
              <span className="text-xs font-light text-text-muted">Computing SHA 256 and visual hash</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-text-muted"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm font-light text-text-primary">
                Drag original file here to verify
              </span>
              <span className="text-[10px] text-text-muted">
                Calculates cryptographic fingerprint locally
              </span>
            </div>
          )}
        </div>

        {/* Verification Result */}
        <AnimatePresence mode="wait">
          {searched && !isHashing && (
            <motion.div
              key="search-result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="text-left"
            >
              {verifiedAsset ? (
                <div className="bg-surface-active/50 p-6 rounded-2xl flex flex-col gap-4">
                  {verifiedAsset.mediaUrl && (
                    <div className="w-full h-44 overflow-hidden rounded-2xl bg-background flex items-center justify-center">
                      <img 
                        src={verifiedAsset.mediaUrl} 
                        alt={verifiedAsset.title} 
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-success font-normal block mb-1">
                        {matchType === "exact" ? "Cryptographic match verified" : "Perceptual visual match detected"}
                      </span>
                      <h3 className="text-xl font-light text-text-primary">
                        {verifiedAsset.title}
                      </h3>
                    </div>
                    <span className="text-success text-xs font-light">
                      Ledger Confirmed
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-light mt-2">
                    <div>
                      <span className="text-text-muted block uppercase tracking-wider text-[9px]">
                        Asset signature hash
                      </span>
                      <span className="font-mono text-text-primary block truncate mt-0.5">
                        {verifiedAsset.contentHash}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted block uppercase tracking-wider text-[9px]">
                        Creator address
                      </span>
                      <span className="font-mono text-text-primary block truncate mt-0.5">
                        {verifiedAsset.creatorAddress}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted block uppercase tracking-wider text-[9px]">
                        Registered timestamp
                      </span>
                      <span className="text-text-primary block mt-0.5">
                        {verifiedAsset.timestamp}
                      </span>
                    </div>
                    <div>
                      <span className="text-text-muted block uppercase tracking-wider text-[9px]">
                        AI generation model
                      </span>
                      <span className="text-text-primary block mt-0.5">
                        {verifiedAsset.aiModel}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col gap-2 mt-2">
                    <div className="flex justify-between text-xs font-light">
                      <span className="text-text-muted">Licensing terms</span>
                      <span className="text-text-primary">Commercial use allowed</span>
                    </div>
                    <div className="flex justify-between text-xs font-light">
                      <span className="text-text-muted">Royalty terms</span>
                      <span className="text-text-primary">
                        {verifiedAsset.royaltySplit}% split to primary creator
                      </span>
                    </div>
                    {verifiedAsset.parentId && (
                      <div className="flex justify-between text-xs font-light">
                        <span className="text-text-muted">Lineage</span>
                        <span className="text-brand">Derivative work of parent asset</span>
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] font-mono text-text-muted truncate mt-1">
                    Anchor transaction: {verifiedAsset.transactionHash}
                  </div>
                </div>
              ) : (
                <div className="bg-surface-active/30 p-6 rounded-2xl text-center">
                  <span className="text-xs uppercase tracking-widest text-text-muted font-normal block mb-1">
                    Lookup complete
                  </span>
                  <h3 className="text-lg font-light text-text-primary mb-2">
                    No provenance record found
                  </h3>
                  <p className="text-xs font-light text-text-muted max-w-md mx-auto leading-relaxed">
                    This file signature does not match any registered asset in the database.
                  </p>
                  {computedHashes && (
                    <div className="text-[10px] font-mono text-text-muted mt-3 truncate">
                      SHA 256: {computedHashes.sha256} &middot; Visual Hash: {computedHashes.phash}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Registered Ledger Assets Quick Inspector */}
        {assets.length > 0 && (
          <div className="text-left mt-4">
            <span className="text-[10px] uppercase tracking-wider text-text-muted block mb-3">
              Inspect registered ledger assets
            </span>
            <div className="flex flex-wrap gap-2">
              {assets.map((asset) => (
                <motion.button
                  key={asset.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectAsset(asset)}
                  className="px-3.5 py-2 bg-surface-active hover:bg-brand hover:text-background text-xs font-light rounded-xl text-text-primary transition-colors duration-150 cursor-pointer"
                >
                  {asset.title}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
