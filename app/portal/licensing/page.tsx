"use client";

import { useAppState } from "@/context/StateContext";
import { motion } from "framer-motion";
import LicensingConsole from "@/components/dashboard/LicensingConsole";

export default function LicensingPage() {
  const { currentUser, assets, agreements, buyLicense } = useAppState();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full flex items-center justify-center min-h-[80vh]"
    >
      <LicensingConsole
        currentUser={currentUser}
        assets={assets}
        agreements={agreements}
        onBuyLicense={buyLicense}
      />
    </motion.div>
  );
}
