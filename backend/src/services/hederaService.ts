import axios from "axios";

import { env } from "../config/env.js";
import { ApiError, NotFoundError } from "../utils/errors.js";

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

export async function fetchHederaTokenBalances(accountId: string): Promise<HederaTokenBalance[]> {
  const normalizedAccountId = normalizeAccountId(accountId);
  const accountInfo = await fetchAccount(normalizedAccountId);
  const accountIdToQuery = accountInfo.account as string;

  const tokens: HederaTokenBalance[] = [];

  try {
    const { data: tokenData } = await axios.get(`${env.hederaApiBaseUrl}/accounts/${accountIdToQuery}/tokens`, {
      params: { limit: 100 }
    });

    const tokenList = tokenData?.tokens ?? [];

    for (const token of tokenList) {
      try {
        const meta = await fetchTokenMetadata(token.token_id);
        const decimals = Number(meta.decimals ?? token.decimals ?? 0);
        const divisor = decimals > 0 ? Math.pow(10, decimals) : 1;
        const balance = Number(token.balance ?? 0) / divisor;

        tokens.push({
          tokenId: token.token_id,
          symbol: meta.symbol ?? "",
          name: meta.name ?? token.token_id,
          decimals,
          balance,
          priceUsd: 0,
          change24hPercent: 0,
          iconUrl: typeof meta?.symbol === "string" && meta.symbol.startsWith("https") ? meta.symbol : undefined
        });
      } catch {
        const decimals = Number(token.decimals ?? 0);
        const divisor = decimals > 0 ? Math.pow(10, decimals) : 1;
        tokens.push({
          tokenId: token.token_id,
          symbol: "",
          name: token.token_id,
          decimals,
          balance: Number(token.balance ?? 0) / divisor,
          priceUsd: 0,
          change24hPercent: 0
        });
      }
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new ApiError(502, `Failed to fetch Hedera token balances: ${error.message}`);
    }
    throw error;
  }

  // include native hbar balance from account info
  const hbarDivisor = Math.pow(10, 8);
  tokens.unshift({
    tokenId: "HBAR",
    symbol: "HBAR",
    name: "Hedera",
    decimals: 8,
    balance: Number(accountInfo.balance?.balance ?? 0) / hbarDivisor,
    priceUsd: 0,
    change24hPercent: 0
  });

  return tokens;
}

function normalizeAccountId(accountId: string): string {
  const trimmed = accountId.trim();
  if (trimmed.startsWith("0x")) {
    return trimmed.toLowerCase();
  }
  return trimmed;
}

async function fetchAccount(accountId: string) {
  try {
    const { data } = await axios.get(`${env.hederaApiBaseUrl}/accounts/${accountId}`);
    if (!data?.account) {
      throw new NotFoundError(`Hedera account ${accountId} was not found`);
    }
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new NotFoundError(`Hedera account ${accountId} was not found`);
      }
      throw new ApiError(502, `Failed to fetch Hedera account for ${accountId}: ${error.message}`);
    }
    throw error;
  }
}
