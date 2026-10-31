"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Dropdown from "@/components/ui/Dropdown";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface RegisterFormProps {
  currentUser: { name: string; address: string; role: string };
  onRegister: (asset: {
    title: string;
    description: string;
    aiModel: string;
    contentHash: string;
    royaltySplit: number;
    creatorAddress: string;
    parentId?: string;
    phash: string;
    mediaUrl?: string;
  }) => void;
  assets: Array<{ id: string; title: string; contentHash: string; phash?: string; mediaUrl?: string }>;
  isDeriving?: boolean;
  isSubmitting?: boolean;
}

// Helpers for client-side cryptographic and perceptual hashing
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

        // Average of the 63 AC coefficients (excluding 0,0)
        let sumCoeffs = 0;
        for (let i = 1; i < 64; i++) {
          sumCoeffs += dct[i];
        }
        const mean = sumCoeffs / 63;

        // Construct 64-bit hash in hex
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
      img.onerror = () => resolve("0000000000000000");
      img.src = event.target?.result as string;
    };
    reader.onerror = () => resolve("0000000000000000");
    reader.readAsDataURL(file);
  });
}

export default function RegisterForm({
  currentUser,
  onRegister,
  assets,
  isDeriving = false,
  isSubmitting = false,
}: RegisterFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [aiModel, setAiModel] = useState("Stable Diffusion 3");
  const [royaltySplit, setRoyaltySplit] = useState(10);
  const [parentId, setParentId] = useState("");
  
  // Drag and drop state
  const [dragActive, setDragActive] = useState(false);
  const [fileHash, setFileHash] = useState("");
  const [phash, setPhash] = useState("");
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isHashing, setIsHashing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [detectedParent, setDetectedParent] = useState<{ id: string; title: string; similarity: number } | null>(null);

  const calculateHammingDistance = (hex1: string, hex2: string): number => {
    if (!hex1 || !hex2 || hex1.length !== 16 || hex2.length !== 16) return 64;
    let distance = 0;
    for (let i = 0; i < 16; i++) {
      const val1 = parseInt(hex1[i], 16);
      const val2 = parseInt(hex2[i], 16);
      const xor = val1 ^ val2;
      let bits = xor;
      while (bits > 0) {
        if (bits & 1) distance++;
        bits >>= 1;
      }
    }
    return distance;
  };

  const processFile = async (file: File) => {
    setIsHashing(true);
    setDetectedParent(null);
    try {
      const sha256 = await computeSha256(file);
      const computedPhash = await computePHash(file);
      setFileHash(sha256);
      setPhash(computedPhash);

      // Provenance Intelligence visual similarity check
      if (file.type.startsWith("image/") && computedPhash !== "0000000000000000") {
        let bestMatch: any = null;
        let lowestDistance = 64;

        assets.forEach((asset) => {
          if (asset.phash && asset.phash !== "0000000000000000") {
            const distance = calculateHammingDistance(computedPhash, asset.phash);
            if (distance < lowestDistance) {
              lowestDistance = distance;
              bestMatch = asset;
            }
          }
        });

        const similarity = Math.round(((64 - lowestDistance) * 100) / 64);
        if (similarity >= 85 && bestMatch) {
          setDetectedParent({
            id: bestMatch.id,
            title: bestMatch.title,
            similarity: similarity,
          });
        }
      }
    } catch (err) {
      console.error("Hashing failed:", err);
    } finally {
      setIsHashing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      setSelectedFile(file);
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setSelectedFile(file);
      processFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileHash || !title || !selectedFile) return;

    setIsUploading(true);
    let mediaUrl = "";
    try {
      if (isSupabaseConfigured) {
        const fileExt = selectedFile.name.split(".").pop();
        const filePath = `${fileHash}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("assets")
          .upload(filePath, selectedFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (!uploadError) {
          const { data } = supabase.storage.from("assets").getPublicUrl(filePath);
          mediaUrl = data.publicUrl;
        } else {
          console.warn("Storage upload skipped or failed:", uploadError.message);
        }
      } else {
        mediaUrl = URL.createObjectURL(selectedFile);
      }
    } catch (err) {
      console.warn("Upload fallback applied:", err);
      mediaUrl = URL.createObjectURL(selectedFile);
    } finally {
      setIsUploading(false);
    }

    onRegister({
      title,
      description,
      aiModel,
      contentHash: fileHash,
      royaltySplit,
      creatorAddress: currentUser.address,
      parentId: isDeriving && parentId ? parentId : undefined,
      phash: phash,
      mediaUrl: mediaUrl || undefined,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setFileHash("");
    setPhash("");
    setFileName("");
    setParentId("");
    setSelectedFile(null);
    setDetectedParent(null);
  };

  const aiOptions = [
    { value: "Stable Diffusion 3", label: "Stable Diffusion 3" },
    { value: "Midjourney v6", label: "Midjourney v6" },
    { value: "Runway Gen 3", label: "Runway Gen 3" },
    { value: "Sora Video Model", label: "Sora Video Model" },
    { value: "Human Created", label: "Human Created (No AI)" },
  ];

  const parentOptions = assets.map((asset) => ({
    value: asset.id,
    label: asset.title,
    sublabel: `${asset.contentHash.substring(0, 16)}...`,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="w-full max-w-2xl bg-surface p-8 rounded-3xl mx-auto my-12"
    >
      <div className="mb-8 text-left">
        <span className="text-xs uppercase tracking-widest text-brand font-normal block mb-2">
          {isDeriving ? "Attribution registry" : "Provenance registration"}
        </span>
        <h2 className="text-2xl font-light text-text-primary tracking-tight">
          {isDeriving ? "Register derivative work" : "Anchor original work"}
        </h2>
        <p className="text-xs font-light text-text-muted mt-1 leading-relaxed">
          Upload your creative file to compute its fingerprint and write the license to the ledger.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* File Dropzone */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`h-40 rounded-2xl flex flex-col items-center justify-center border-none transition-colors duration-200 text-center p-4 relative ${
            dragActive
              ? "bg-surface-active"
              : fileHash
              ? "bg-surface-active/60"
              : "bg-surface-active/30"
          }`}
        >
          <input
            type="file"
            id="file-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
          />
          {isHashing ? (
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-light text-brand">Computing cryptographic signature...</span>
              <span className="text-xs font-light text-text-muted">Computing hash</span>
            </div>
          ) : fileHash ? (
            <div className="flex flex-col items-center gap-1 max-w-full">
              <span className="text-xs font-normal text-success">Fingerprint computed</span>
              <span className="text-sm font-light text-text-primary truncate max-w-xs">
                {fileName}
              </span>
              <span className="text-[10px] font-mono text-text-muted truncate max-w-md mt-1">
                {fileHash}
              </span>
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
                <path d="M12 5v14M5 12h14" />
              </svg>
              <span className="text-sm font-light text-text-primary">
                Drag creative file here or click to browse
              </span>
              <span className="text-[10px] text-text-muted">
                Images, video, or audio files are accepted
              </span>
            </div>
          )}
        </div>

        {/* Provenance Intelligence Warning Card */}
        <AnimatePresence>
          {detectedParent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="bg-surface-active/80 p-5 rounded-2xl text-left flex flex-col gap-4 overflow-hidden"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-brand font-medium block">
                  Potential derivative detected
                </span>
                <span className="text-xs font-light text-text-muted mt-1 leading-relaxed">
                  We analyzed this asset's visual fingerprint against the registry. It is visually similar to an existing asset.
                </span>
                <div className="flex justify-between items-center bg-surface p-3.5 rounded-xl mt-2 text-xs font-light">
                  <span>Possible parent: <strong className="font-normal text-text-primary">{detectedParent.title}</strong></span>
                  <span className="font-mono text-brand">{detectedParent.similarity}% match</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setParentId(detectedParent.id);
                    setDetectedParent(null);
                  }}
                  className="flex-1 py-3 bg-brand text-background text-xs font-normal rounded-xl cursor-pointer hover:bg-brand/90 transition-colors"
                >
                  Declare as derivative
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDetectedParent(null);
                  }}
                  className="flex-1 py-3 bg-surface-active text-text-primary text-xs font-normal rounded-xl cursor-pointer hover:bg-surface-active/80 transition-colors"
                >
                  Register as independent work
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text Fields */}
        <div className="flex flex-col gap-1 text-left">
          <label className="text-xs uppercase tracking-wider text-text-muted">
            Asset Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title of your work"
            className="w-full bg-surface-active text-text-primary text-sm font-light h-12 px-4 rounded-xl outline-none border-none placeholder-text-muted/50 mt-1"
          />
        </div>

        <div className="flex flex-col gap-1 text-left">
          <label className="text-xs uppercase tracking-wider text-text-muted">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the creative work and attributes"
            rows={3}
            className="w-full bg-surface-active text-text-primary text-sm font-light p-4 rounded-xl outline-none border-none resize-none placeholder-text-muted/50 mt-1"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1 text-left">
            <Dropdown
              options={aiOptions}
              value={aiModel}
              onChange={setAiModel}
              label="AI Generation Engine"
            />
          </div>

          <div className="flex flex-col gap-1 text-left">
            <label className="text-xs uppercase tracking-wider text-text-muted">
              Royalty Split Percentage
            </label>
            <div className="relative mt-1">
              <input
                type="number"
                min="0"
                max="100"
                value={royaltySplit}
                onChange={(e) => setRoyaltySplit(Number(e.target.value))}
                className="w-full bg-surface-active text-text-primary text-sm font-light h-12 px-4 rounded-xl outline-none border-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-text-muted font-mono pointer-events-none">
                % to original
              </span>
            </div>
          </div>
        </div>

        {/* Parent Selector if Deriving */}
        {isDeriving && (
          <div className="flex flex-col gap-1 text-left">
            <Dropdown
              options={parentOptions}
              value={parentId}
              onChange={setParentId}
              label="Link to Original Parent Asset"
              placeholder="Select the original creative work you remixed"
            />
          </div>
        )}

        {/* Submit */}
        <motion.button
          type="submit"
          whileTap={{ scale: !fileHash || !title || isSubmitting || isUploading ? 1 : 0.98 }}
          disabled={!fileHash || !title || isSubmitting || isUploading}
          className={`w-full py-4 text-sm font-normal text-background rounded-xl transition-colors duration-200 cursor-pointer mt-4 ${
            fileHash && title && !isSubmitting && !isUploading
              ? "bg-brand hover:bg-text-primary"
              : "bg-surface-active/50 text-text-muted cursor-not-allowed"
          }`}
        >
          {isUploading ? "Uploading Media..." : (isSubmitting ? "Confirm in Wallet..." : "Anchor Record on Chain")}
        </motion.button>
      </form>
    </motion.div>
  );
}
