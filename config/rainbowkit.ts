import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
  hederaTestnet,
  hedera,
} from 'wagmi/chains';
import { http } from 'wagmi';

export const wagmiConfig = getDefaultConfig({
  appName: 'Teritage',
  projectId: process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID || '',
  ssr: true,
  chains: [hederaTestnet, mainnet, polygon, optimism, arbitrum, base, hedera],
  transports: {
    [hederaTestnet.id]: http(),
    [hedera.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
});
