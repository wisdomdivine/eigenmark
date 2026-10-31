"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAppState } from "@/context/StateContext";
import RegisterForm from "@/components/dashboard/RegisterForm";
import { useRouter } from "next/navigation";

export default function DerivePage() {
  const { currentUser, registerAsset, assets } = useAppState();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (newAsset: {
    title: string;
    description: string;
    aiModel: string;
    contentHash: string;
    royaltySplit: number;
    creatorAddress: string;
    parentId?: string;
    phash: string;
  }) => {
    try {
      setIsSubmitting(true);
      await registerAsset(newAsset);
      router.push("/portal/graph");
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full flex items-center justify-center min-h-[80vh]"
    >
      <RegisterForm
        currentUser={currentUser}
        onRegister={handleRegister}
        assets={assets}
        isDeriving={true}
        isSubmitting={isSubmitting}
      />
    </motion.div>
  );
}
