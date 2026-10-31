"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppState } from "@/context/StateContext";
import { useState, useRef, useEffect } from "react";
import {
  IconPlus,
  IconGitFork,
  IconSearch,
  IconNetwork,
  IconReceipt,
  IconArrowLeft,
  IconX,
  IconCopy,
  IconCheck,
} from "@tabler/icons-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser, disconnectWallet } = useAppState();

  const [copied, setCopied] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyAddress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUser.address) {
      navigator.clipboard.writeText(currentUser.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const menuItems = [
    { href: "/portal/register", label: "Register Work", icon: IconPlus },
    { href: "/portal/derive", label: "Derive Work", icon: IconGitFork },
    { href: "/portal/verify", label: "Verify Provenance", icon: IconSearch },
    { href: "/portal/graph", label: "Lineage Graph", icon: IconNetwork },
    { href: "/portal/licensing", label: "Licensing Console", icon: IconReceipt },
  ];

  return (
    <aside className={`w-64 h-screen fixed top-0 left-0 bg-surface flex flex-col justify-between py-6 px-4 z-40 select-none transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      {/* Top Section */}
      <div>
        {/* Brand Link and Close Button */}
        <div className="px-3 mb-6 flex justify-between items-center">
          <Link
            href="/"
            onClick={onClose}
            className="text-lg font-light tracking-tight text-text-primary hover:text-brand transition-colors duration-200 cursor-pointer block"
          >
            Eigenmark
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 flex items-center justify-center bg-surface-active rounded-xl cursor-pointer text-text-primary"
          >
            <IconX size={16} strokeWidth={1.5} />
          </button>
        </div>
        <div className="px-3">
          <div className="w-full bg-surface-active/30 rounded-xl px-3 py-2 text-[10px] font-light text-text-muted cursor-pointer text-left">
            Arbitrum Sepolia Testnet
          </div>
        </div>

        {/* Menu Section */}
        <div className="mt-8">
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-normal block px-3 mb-3">
            Services
          </span>
          <nav className="flex flex-col gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-light tracking-wide transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-brand text-background"
                      : "text-text-muted hover:text-text-primary hover:bg-surface-active"
                  }`}
                >
                  <Icon size={16} strokeWidth={1.5} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col gap-4">
        {/* Return to Landing Page Button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center justify-center gap-2 w-full py-2 bg-surface-active hover:bg-surface-active/80 text-[10px] font-light text-text-primary rounded-xl cursor-pointer transition-colors duration-200"
        >
          <IconArrowLeft size={12} strokeWidth={1.5} />
          <span>Exit Portal</span>
        </button>

        {/* Active Connected User Profile Card */}
        <div className="bg-surface-active/30 p-3 rounded-2xl flex flex-col gap-3 relative" ref={userMenuRef}>
          <div 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 cursor-pointer hover:bg-surface-active/40 p-1.5 rounded-xl transition-colors duration-150"
          >
            {/* Avatar circle */}
            <div className="w-8 h-8 rounded-full bg-brand text-background flex items-center justify-center font-normal text-xs uppercase">
              {currentUser.address.substring(2, 4)}
            </div>
            <div className="text-left flex-1 min-w-0">
              <span className="text-xs font-normal text-text-primary block leading-none truncate">
                {currentUser.name}
              </span>
              <span className="text-[9px] font-mono text-text-muted block mt-0.5 truncate">
                {currentUser.address.substring(0, 6)}...{currentUser.address.slice(-4)}
              </span>
            </div>
          </div>

          {isUserMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-surface-active rounded-xl py-2 z-50">
              <div className="px-3 py-2 text-[10px] text-text-muted">
                <span className="block uppercase text-[8px] tracking-wider text-brand">Role</span>
                <span className="text-text-primary font-normal">{currentUser.role}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyAddress}
                className="w-full px-3 py-2 text-left text-[10px] font-light text-text-primary hover:bg-surface/70 transition-colors duration-150 cursor-pointer flex items-center justify-between"
              >
                <span>Copy Full Address</span>
                {copied ? <IconCheck size={12} className="text-success" /> : <IconCopy size={12} />}
              </button>
              <div className="h-px bg-surface/50 my-1.5"></div>
              <button
                type="button"
                onClick={() => {
                  disconnectWallet();
                  setIsUserMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-[10px] font-light text-brand hover:bg-surface/70 transition-colors duration-150 cursor-pointer"
              >
                Disconnect Wallet Session
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
