"use client";

import { useAppState } from "@/context/StateContext";
import Sidebar from "@/components/dashboard/Sidebar";
import React from "react";
import { IconLock, IconMenu2, IconWallet } from "@tabler/icons-react";
import { useConnect } from "wagmi";

function PortalContent({ children }: { children: React.ReactNode }) {
  const { isConnected, connectWallet, enterGuestMode } = useAppState();
  const { connectors } = useConnect();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const getDisplayName = (connector: any) => {
    if (connector.name === "Injected") {
      return "Browser Wallet (Injected)";
    }
    return connector.name;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-6 text-center select-none font-sans">
        <div className="w-full max-w-sm bg-surface p-8 rounded-3xl flex flex-col items-center">
          {/* Lock Icon */}
          <div className="w-12 h-12 rounded-full bg-surface-active flex items-center justify-center text-brand mb-6">
            <IconLock size={20} strokeWidth={1.5} />
          </div>

          <h3 className="text-xl font-light text-text-primary tracking-tight mb-2">
            Access Restricted
          </h3>
          <p className="text-xs font-light text-text-muted mb-8 leading-relaxed max-w-xs">
            Please connect your Web3 wallet to authorize access to the creative registry and smart contract logs.
          </p>

          {/* Auto-detected Live Wallet Connections */}
          <div className="w-full">
            <div className="text-[10px] font-normal uppercase tracking-wider text-text-muted mb-3 text-left">
              Detected Wallets
            </div>
            <div className="flex flex-col gap-2.5 w-full">
              {connectors.length === 0 ? (
                <div className="p-4 bg-surface-active rounded-xl text-xs text-text-muted text-center">
                  No Web3 wallet extension detected. Please install MetaMask, Coinbase Wallet, or Rabby.
                </div>
              ) : (
                connectors.map((connector) => (
                  <button
                    key={connector.id}
                    onClick={() => connectWallet(connector)}
                    className="w-full py-4 px-4 bg-surface-active hover:bg-brand hover:text-background text-left text-xs font-light text-text-primary rounded-xl cursor-pointer transition-all duration-200 flex justify-between items-center group"
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
              onClick={enterGuestMode}
              className="w-full mt-4 py-3.5 px-4 bg-surface-active hover:bg-surface-active/80 text-center text-xs font-normal text-text-primary rounded-xl cursor-pointer transition-all duration-200"
            >
              Explore as Guest (Judge Review Mode)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between px-6 h-16 bg-surface fixed top-0 left-0 right-0 z-30 select-none">
        <span className="text-base font-light tracking-tight text-text-primary">
          Eigenmark
        </span>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="w-10 h-10 flex items-center justify-center bg-surface-active rounded-xl cursor-pointer text-text-primary"
        >
          <IconMenu2 size={20} strokeWidth={1.5} />
        </button>
      </header>

      {/* Backdrop overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-35 lg:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Portal Workspace Content area */}
      <main className="flex-1 ml-0 lg:ml-64 p-6 lg:p-8 pt-24 lg:pt-8 min-h-screen bg-background overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalContent>{children}</PortalContent>;
}
