import type { Address } from 'viem';
import { hederaTestnet } from 'wagmi/chains';

export const TERITAGE_CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_TERITAGE_CONTRACT_ADDRESS || ''
).toLowerCase() as Address | '';
export const TERITAGE_CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_TERITAGE_CHAIN_ID || hederaTestnet.id
);

export const TERITAGE_TOKEN_TYPE_MAP = {
  ERC20: 0,
  HTS: 1,
  HBAR: 2,
} as const;

export type TeritageTokenType = keyof typeof TERITAGE_TOKEN_TYPE_MAP;
