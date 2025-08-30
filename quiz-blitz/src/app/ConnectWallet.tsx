"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { metaMask, injected } from "wagmi/connectors";

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-mono">{address}</span>
        <button
          onClick={() => disconnect()}
          className="px-3 py-1 border rounded"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* 브라우저 주입 지갑 (MetaMask 포함) */}
      <button
        onClick={() => connect({ connector: injected() })}
        className="px-3 py-2 border rounded"
      >
        Connect Wallet
      </button>
      {error && <p className="text-red-600">{error.message}</p>}
    </div>
  );
}
