"use client";

import { useState } from "react";
import { IconX, IconWallet } from "@tabler/icons-react";
import { useConnect } from "wagmi";
import { useRouter } from "next/navigation";
import { useAppState } from "@/context/StateContext";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (connectorOrName: any) => void;
}

export default function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
  const router = useRouter();
  const { enterGuestMode } = useAppState();
  const { connectors } = useConnect();
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGuestEntry = () => {
    enterGuestMode();
    onClose();
    router.push("/portal/register");
  };

  const handleWalletSelect = (connector: any) => {
    setConnectingWallet(connector.name);
    try {
      onConnect(connector);
    } finally {
      setConnectingWallet(null);
      onClose();
    }
  };

  const getDisplayName = (connector: any) => {
    if (connector.name === "Injected") {
      return "Browser Wallet (Injected)";
    }
    return connector.name;
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-sm bg-surface p-6 rounded-3xl relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={connectingWallet !== null}
          className="absolute top-4 right-4 text-text-muted hover:text-text-primary transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          <IconX size={16} />
        </button>

        {connectingWallet ? (
          <div className="flex flex-col items-center justify-center py-8 text-center min-h-[200px]">
            <div className="w-8 h-8 border-2 border-brand border-t-transparent animate-spin rounded-full mb-6"></div>
            <h3 className="text-base font-normal text-text-primary mb-2">
              Connecting {connectingWallet}
            </h3>
            <p className="text-xs font-light text-text-muted">
              Authorizing connection in your wallet extension.
            </p>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-light text-text-primary tracking-tight mb-2">
              Connect Web3 Wallet
            </h3>
            <p className="text-xs font-light text-text-muted mb-6 leading-relaxed">
              Detected browser wallets via EIP-6963 multi-provider discovery.
            </p>

            {/* Auto-detected Live Connectors */}
            <div className="flex flex-col gap-2">
              {connectors.length === 0 ? (
                <div className="p-4 bg-surface-active rounded-xl text-xs text-text-muted text-center">
                  No Web3 wallet extensions detected. Please install MetaMask, Coinbase Wallet, or Rabby in your browser.
                </div>
              ) : (
                connectors.map((connector) => (
                  <button
                    key={connector.id}
                    onClick={() => handleWalletSelect(connector)}
                    className="w-full py-3.5 px-4 bg-surface-active hover:bg-brand hover:text-background text-left text-xs font-light text-text-primary rounded-xl cursor-pointer transition-all duration-200 flex justify-between items-center group"
                  >
                    <div className="flex items-center gap-3">
                      {connector.icon ? (
                        <img
                          src={connector.icon}
                          alt={connector.name}
                          className="w-5 h-5 rounded-md object-contain"
                        />
                      ) : (
                        <IconWallet size={18} className="text-brand group-hover:text-background" />
                      )}
                      <span>{getDisplayName(connector)}</span>
                    </div>
                    <span className="text-[9px] opacity-80 uppercase tracking-wider font-mono">
                      Connect
                    </span>
                  </button>
                ))
              )}
            </div>

            <button
              onClick={handleGuestEntry}
              className="w-full mt-3 py-3 px-4 bg-surface-active hover:bg-surface-active/80 text-center text-xs font-normal text-text-primary rounded-xl cursor-pointer transition-all duration-200"
            >
              Explore Console (Guest Review Mode)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
