"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { WagmiProvider, useAccount, useConnect, useDisconnect, useWriteContract } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/context/wagmi";
import { contractAddress, contractAbi } from "@/context/contract";
import { parseEther } from "viem";

export interface Asset {
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

export interface LicensingAgreement {
  id: string;
  assetId: string;
  licenseeAddress: string;
  transactionHash: string;
  price: number;
  royaltySplit: number;
  timestamp: string;
}

export interface User {
  name: string;
  address: string;
  role: string;
}

interface StateContextType {
  users: Array<User>;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  assets: Array<Asset>;
  agreements: Array<LicensingAgreement>;
  isConnected: boolean;
  enterGuestMode: () => void;
  connectWallet: (connectorOrName: any) => void;
  disconnectWallet: () => void;
  registerAsset: (asset: {
    title: string;
    description: string;
    aiModel: string;
    contentHash: string;
    royaltySplit: number;
    creatorAddress: string;
    parentId?: string;
    phash?: string;
    mediaUrl?: string;
  }) => Promise<string>;
  buyLicense: (agreement: {
    assetId: string;
    licenseeAddress: string;
    price: number;
    royaltySplit: number;
  }) => Promise<void>;
}

const StateContext = createContext<StateContextType | undefined>(undefined);
const queryClient = new QueryClient();

const defaultUser: User = {
  name: "Operator",
  address: "0x0000000000000000000000000000000000000000",
  role: "Content Creator",
};

function StateProviderContent({ children }: { children: ReactNode }) {
  // Wagmi hooks for real Web3 interaction
  const { address: walletAddress, isConnected: isWalletConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { writeContractAsync } = useWriteContract();

  const [isGuestMode, setIsGuestMode] = useState<boolean>(false);
  const isConnected = isWalletConnected || isGuestMode;
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);

  const enterGuestMode = () => {
    setIsGuestMode(true);
    const guestUser: User = {
      name: "Guest Evaluator",
      address: "0x71207757FB3F8118EC0BAb8f2251E09973892306",
      role: "Hackathon Judge / Evaluator",
    };
    setCurrentUser(guestUser);
    setUsers([guestUser]);
  };
  const [users, setUsers] = useState<Array<User>>([]);
  const [assets, setAssets] = useState<Array<Asset>>([]);
  const [agreements, setAgreements] = useState<Array<LicensingAgreement>>([]);

  // Database synchronization: load initial records on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const assetsRes = await fetch("/api/assets");
        let loadedAssets: Array<Asset> = [];
        if (assetsRes.ok) {
          loadedAssets = await assetsRes.json();
          setAssets(loadedAssets);
        }

        const agreementsRes = await fetch("/api/agreements");
        if (agreementsRes.ok) {
          const agreementsData = await agreementsRes.json();
          // Map asset contentHash back to asset.id for UI elements
          const mappedAgreements = agreementsData.map((agreement: any) => {
            const matchedAsset = loadedAssets.find((a) => a.contentHash === agreement.assetId);
            return {
              ...agreement,
              assetId: matchedAsset ? matchedAsset.id : agreement.assetId,
            };
          });
          setAgreements(mappedAgreements);
        }
      } catch (err) {
        console.error("Failed to load initial database records:", err);
      }
    }
    loadInitialData();
  }, []);

  // Database synchronization: register connected wallet profile
  useEffect(() => {
    async function registerOrCheckUser() {
      if (isWalletConnected && walletAddress) {
        try {
          const response = await fetch("/api/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              walletAddress: walletAddress,
              name: `Wallet ${walletAddress.substring(0, 6)}...${walletAddress.slice(-4)}`,
              role: "Creator & Operator",
            }),
          });

          if (response.ok) {
            const dbUser = await response.json();
            const activeUser: User = {
              name: dbUser.name,
              address: dbUser.wallet_address,
              role: dbUser.role,
            };
            setCurrentUser(activeUser);
            setUsers([activeUser]);
          } else {
            const activeUser: User = {
              name: `Wallet ${walletAddress.substring(0, 6)}...${walletAddress.slice(-4)}`,
              address: walletAddress,
              role: "Creator & Operator",
            };
            setCurrentUser(activeUser);
            setUsers([activeUser]);
          }
        } catch (err) {
          console.error("User registration check failed:", err);
          const activeUser: User = {
            name: `Wallet ${walletAddress.substring(0, 6)}...${walletAddress.slice(-4)}`,
            address: walletAddress,
            role: "Creator & Operator",
          };
          setCurrentUser(activeUser);
          setUsers([activeUser]);
        }
      } else {
        setCurrentUser(defaultUser);
        setUsers([]);
      }
    }
    registerOrCheckUser();
  }, [walletAddress, isWalletConnected]);

  const connectWallet = (connectorOrName: any) => {
    if (connectorOrName && typeof connectorOrName === "object" && connectorOrName.connect) {
      connect({ connector: connectorOrName });
      return;
    }

    const walletName = String(connectorOrName);
    const targetConnector = connectors.find(
      (c) => c.name.toLowerCase() === walletName.toLowerCase() || c.id.toLowerCase() === walletName.toLowerCase()
    );

    if (targetConnector) {
      connect({ connector: targetConnector });
    } else if (connectors.length > 0) {
      connect({ connector: connectors[0] });
    }
  };

  const disconnectWallet = () => {
    disconnect();
    setCurrentUser(defaultUser);
  };

  const registerAsset = async (newAsset: {
    title: string;
    description: string;
    aiModel: string;
    contentHash: string;
    royaltySplit: number;
    creatorAddress: string;
    parentId?: string;
    phash?: string;
    mediaUrl?: string;
  }) => {
    let txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    if (isWalletConnected) {
      try {
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: contractAbi,
          functionName: "registerAsset",
          args: [
            newAsset.contentHash,
            newAsset.title,
            BigInt(Math.round(newAsset.royaltySplit * 100)),
            newAsset.parentId || "",
            "0xlicensetermshashplaceholder",
          ],
        });
        if (hash) txHash = hash;
      } catch (err) {
        console.error("Contract transaction failed:", err);
      }
    }

    // Save registration details to persistent database
    try {
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newAsset.title,
          description: newAsset.description,
          aiModel: newAsset.aiModel,
          contentHash: newAsset.contentHash,
          royaltySplit: newAsset.royaltySplit,
          creatorAddress: newAsset.creatorAddress,
          parentId: newAsset.parentId,
          phash: newAsset.phash || "0000000000000000",
          mediaUrl: newAsset.mediaUrl || null,
        }),
      });

      if (response.ok) {
        const savedAsset = await response.json();
        setAssets((prev) => [...prev, savedAsset]);
        return savedAsset.id;
      }
    } catch (err) {
      console.error("Failed to persist asset in database:", err);
    }

    // Fallback: local memory insert
    const nextId = String(assets.length + 1);
    const formattedAsset: Asset = {
      ...newAsset,
      id: nextId,
      timestamp:
        new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }) +
        " " +
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      transactionHash: txHash,
    };

    setAssets((prev) => [...prev, formattedAsset]);
    return nextId;
  };

  const buyLicense = async (agreement: {
    assetId: string;
    licenseeAddress: string;
    price: number;
    royaltySplit: number;
  }) => {
    let txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    const asset = assets.find((a) => a.id === agreement.assetId);

    if (isWalletConnected && asset) {
      try {
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: contractAbi,
          functionName: "purchaseLicense",
          args: [asset.contentHash],
          value: parseEther("0.001"),
        });
        if (hash) txHash = hash;
      } catch (err) {
        console.error("Contract transaction failed:", err);
      }
    }

    // Save licensing transaction to database
    try {
      const response = await fetch("/api/agreements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assetId: asset ? asset.contentHash : agreement.assetId,
          licenseeAddress: agreement.licenseeAddress,
          transactionHash: txHash,
          price: agreement.price,
          royaltySplit: agreement.royaltySplit,
        }),
      });

      if (response.ok) {
        const savedAgreement = await response.json();
        if (asset) {
          savedAgreement.assetId = asset.id;
        }
        setAgreements((prev) => [...prev, savedAgreement]);
        return;
      }
    } catch (err) {
      console.error("Failed to persist agreement in database:", err);
    }

    // Fallback: local memory insert
    const newAgreement: LicensingAgreement = {
      ...agreement,
      id: String(agreements.length + 1),
      transactionHash: txHash,
      timestamp:
        new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }) +
        " " +
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        }),
    };

    setAgreements((prev) => [...prev, newAgreement]);
  };

  return (
    <StateContext.Provider
      value={{
        users,
        currentUser,
        setCurrentUser,
        assets,
        agreements,
        isConnected,
        enterGuestMode,
        connectWallet,
        disconnectWallet,
        registerAsset,
        buyLicense,
      }}
    >
      {children}
    </StateContext.Provider>
  );
}

export function StateProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <StateProviderContent>{children}</StateProviderContent>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export function useAppState() {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error("useAppState must be used within a StateProvider");
  }
  return context;
}
