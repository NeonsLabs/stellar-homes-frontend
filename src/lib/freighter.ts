"use client";

export interface WalletState {
  address: string | null;
  connected: boolean;
  network?: string;
}

export async function connectFreighter(): Promise<WalletState> {
  if (typeof window === "undefined") {
    return { address: null, connected: false };
  }
  // Simulated or window.freighter API connection
  const mockAddress = "GB7BNO7DCICMMQL7BSPCUZVEOOAMJAWAAHA2QHR74IZYXZLHSCLW46XJ";
  localStorage.setItem("sh_wallet", mockAddress);
  return { address: mockAddress, connected: true, network: "TESTNET" };
}

export function disconnectFreighter(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("sh_wallet");
  }
}
