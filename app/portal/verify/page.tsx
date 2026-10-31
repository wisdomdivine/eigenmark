"use client";

import { useAppState } from "@/context/StateContext";
import { motion } from "framer-motion";
import VerifyPanel from "@/components/dashboard/VerifyPanel";

export default function VerifyPage() {
  const { assets } = useAppState();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full flex items-center justify-center min-h-[80vh]"
    >
      <VerifyPanel assets={assets} />
    </motion.div>
  );
}
