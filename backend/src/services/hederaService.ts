import axios from 'axios';

import { env } from '../config/env.js';
import { ApiError, NotFoundError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

interface PriceCache {
  value: number;
  timestamp: number;
}

const HBAR_PRICE_CACHE_TTL = 60 * 1000; // 1 minute
let hbarPriceCache: PriceCache | null = null;

export interface HederaTokenBalance {
  tokenId: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: number;
  priceUsd: number;
  change24hPercent: number;
  iconUrl?: string;
}

async function fetchTokenMetadata(tokenId: string) {
  const { data } = await axios.get(`${env.hederaApiBaseUrl}/tokens/${tokenId}`);
  return data;
}

export async function fetchHederaTokenBalances(
  accountId: string
): Promise<HederaTokenBalance[]> {
  const normalizedAccountId = normalizeAccountId(accountId);
  const accountInfo = await fetchAccount(normalizedAccountId);
  const accountIdToQuery = accountInfo.account as string;

  const tokens: HederaTokenBalance[] = [];
  const hbarPriceUsd = await getHbarUsdPrice();

  try {
    const { data: tokenData } = await axios.get(
      `${env.hederaApiBaseUrl}/accounts/${accountIdToQuery}/tokens`,
      {
        params: { limit: 100 },
      }
    );

    const tokenList = tokenData?.tokens ?? [];

    for (const token of tokenList) {
      try {
        const meta = await fetchTokenMetadata(token.token_id);
        const decimals = Number(meta.decimals ?? token.decimals ?? 0);
        const divisor = decimals > 0 ? Math.pow(10, decimals) : 1;
        const balance = Number(token.balance ?? 0) / divisor;

        tokens.push({
          tokenId: token.token_id,
          symbol: meta.symbol ?? '',
          name: meta.name ?? token.token_id,
          decimals,
          balance,
          priceUsd: 0,
          change24hPercent: 0,
          iconUrl:
            typeof meta?.symbol === 'string' && meta.symbol.startsWith('https')
              ? meta.symbol
              : undefined,
        });
      } catch {
        const decimals = Number(token.decimals ?? 0);
        const divisor = decimals > 0 ? Math.pow(10, decimals) : 1;
        tokens.push({
          tokenId: token.token_id,
          symbol: '',
          name: token.token_id,
          decimals,
          balance: Number(token.balance ?? 0) / divisor,
          priceUsd: 0,
          change24hPercent: 0,
        });
      }
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(
        502,
        `Failed to fetch Hedera token balances: ${error.message}`
      );
    }
    throw error;
  }

  // include native hbar balance from account info
  const hbarDivisor = Math.pow(10, 8);
  const balance = Number(accountInfo.balance?.balance ?? 0) / hbarDivisor;
  tokens.unshift({
    tokenId: 'HBAR',
    symbol: 'HBAR',
    name: 'Hedera',
    decimals: 8,
    balance,
    priceUsd: hbarPriceUsd * balance,
    change24hPercent: 0,
  });

  return tokens;
}

function normalizeAccountId(accountId: string): string {
  const trimmed = accountId.trim();
  if (trimmed.startsWith('0x')) {
    return trimmed.toLowerCase();
  }
  return trimmed;
}

async function fetchAccount(accountId: string) {
  try {
    const { data } = await axios.get(
      `${env.hederaApiBaseUrl}/accounts/${accountId}`
    );
    if (!data?.account) {
      throw new NotFoundError(`Hedera account ${accountId} was not found`);
    }
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new NotFoundError(`Hedera account ${accountId} was not found`);
      }
      throw new ApiError(
        502,
        `Failed to fetch Hedera account for ${accountId}: ${error.message}`
      );
    }
    throw error;
  }
}

async function getHbarUsdPrice(): Promise<number> {
  if (
    hbarPriceCache &&
    Date.now() - hbarPriceCache.timestamp < HBAR_PRICE_CACHE_TTL
  ) {
    return hbarPriceCache.value;
  }

  try {
    const { data } = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price',
      {
        params: { ids: 'hedera-hashgraph', vs_currencies: 'usd' },
      }
    );
    const price = Number(data?.['hedera-hashgraph']?.usd ?? 0);
    if (Number.isNaN(price)) {
      throw new Error('Invalid price response');
    }
    hbarPriceCache = { value: price, timestamp: Date.now() };
    return price;
  } catch (error) {
    logger.warn('Failed to fetch HBAR price', error);
    const fallback = hbarPriceCache?.value ?? 0;
    return fallback;
  }
}
