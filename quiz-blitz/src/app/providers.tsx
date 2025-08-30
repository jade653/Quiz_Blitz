"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { injected, metaMask } from "wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const config = createConfig({
  chains: [sepolia, mainnet], // 필요한 체인만
  transports: {
    [sepolia.id]: http(), // 필요하면 RPC URL 지정
    [mainnet.id]: http(),
  },
  connectors: [
    metaMask({ dappMetadata: { name: "My Next App" } }),
    injected({ shimDisconnect: true }), // 브라우저 지갑 전반(메타마스크 포함)
  ],
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
