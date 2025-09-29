'use client';

import { useCallback } from 'react';
import { useWriteContract, useReadContract } from 'wagmi';
import { waitForTransactionReceipt } from 'viem/actions';
import { createPublicClient, http, type Address } from 'viem';

import { wagmiConfig } from '@/config/rainbowkit';
import { TERITAGE_INHERITANCE_ABI } from '@/lib/abi/teritageInheritance';
import {
  TERITAGE_CHAIN_ID,
  TERITAGE_CONTRACT_ADDRESS,
  TERITAGE_TOKEN_TYPE_MAP,
  TeritageTokenType,
} from '@/lib/blockchain/constants';
import type {
  CreateTeritagePlanRequest,
  UpdateTeritagePlanRequest,
  TeritageTokenConfig,
} from '@/type';
import {
  createTeritagePlanApi,
  updateTeritagePlanApi,
  recordCheckInApi,
  recordClaimApi,
} from '@/config/apis';
import { hederaTestnet } from 'wagmi/chains';

interface ContractTokenInput extends TeritageTokenConfig {
  address: Address;
}

interface CreatePlanArgs {
  inheritors: Address[];
  shares: number[];
  tokens: ContractTokenInput[];
  checkInIntervalSeconds: number;
  backendPayload?: CreateTeritagePlanRequest;
}

interface UpdateInheritorsArgs {
  inheritors: Address[];
  shares: number[];
  ownerAddress?: string;
  backendPayload?: UpdateTeritagePlanRequest;
}

interface UpdateTokensArgs {
  tokens: ContractTokenInput[];
  ownerAddress?: string;
  backendPayload?: UpdateTeritagePlanRequest;
}

interface UpdateIntervalArgs {
  newIntervalSeconds: number;
  ownerAddress?: string;
  backendPayload?: UpdateTeritagePlanRequest;
}

interface ClaimArgs {
  ownerAddress: Address;
  backendPayload?: { initiatedBy: string; note?: string };
}

interface CheckInArgs {
  ownerAddress?: string;
  backendPayload?: { triggeredBy?: string; note?: string; timestamp?: string };
}

const ensureAddressConfigured = (): Address => {
  if (!TERITAGE_CONTRACT_ADDRESS) {
    throw new Error(
      'Teritage contract address is not configured. Set NEXT_PUBLIC_TERITAGE_CONTRACT_ADDRESS.'
    );
  }
  return TERITAGE_CONTRACT_ADDRESS;
};

const toTokenTypes = (tokens: ContractTokenInput[]): number[] =>
  tokens.map((token) => TERITAGE_TOKEN_TYPE_MAP[token.type]);

const toShareValues = (shares: number[]): bigint[] =>
  shares.map((share) => BigInt(share));

const toInterval = (seconds: number): bigint => BigInt(seconds);

const wagmiClient = createPublicClient({
  chain: hederaTestnet,
  transport: http(),
});

export function useTeritageContract() {
  const { writeContractAsync, isPending } = useWriteContract();

  const execute = useCallback(
    async (args: { functionName: string; args?: unknown[] }) => {
      const address = ensureAddressConfigured();
      const hash = await writeContractAsync({
        address,
        abi: TERITAGE_INHERITANCE_ABI,
        chainId: TERITAGE_CHAIN_ID,
        ...args,
      });
      await waitForTransactionReceipt(wagmiClient, { hash });
      return hash;
    },
    [writeContractAsync]
  );

  const createPlan = useCallback(
    async ({
      inheritors,
      shares,
      tokens,
      checkInIntervalSeconds,
      backendPayload,
    }: CreatePlanArgs) => {
      await execute({
        functionName: 'createPlan',
        args: [
          inheritors,
          toShareValues(shares),
          tokens.map((token) => token.address),
          toTokenTypes(tokens),
          toInterval(checkInIntervalSeconds),
        ],
      });

      if (backendPayload) {
        await createTeritagePlanApi(backendPayload);
      }
    },
    [execute]
  );

  const updateInheritors = useCallback(
    async ({
      inheritors,
      shares,
      ownerAddress,
      backendPayload,
    }: UpdateInheritorsArgs) => {
      await execute({
        functionName: 'updateInheritors',
        args: [inheritors, toShareValues(shares)],
      });

      if (backendPayload && ownerAddress) {
        await updateTeritagePlanApi(ownerAddress, backendPayload);
      }
    },
    [execute]
  );

  const updateTokens = useCallback(
    async ({ tokens, ownerAddress, backendPayload }: UpdateTokensArgs) => {
      await execute({
        functionName: 'updateTokens',
        args: [tokens.map((token) => token.address), toTokenTypes(tokens)],
      });

      if (backendPayload && ownerAddress) {
        await updateTeritagePlanApi(ownerAddress, backendPayload);
      }
    },
    [execute]
  );

  const updateCheckInInterval = useCallback(
    async ({
      newIntervalSeconds,
      ownerAddress,
      backendPayload,
    }: UpdateIntervalArgs) => {
      await execute({
        functionName: 'updateCheckInInterval',
        args: [toInterval(newIntervalSeconds)],
      });

      if (backendPayload && ownerAddress) {
        await updateTeritagePlanApi(ownerAddress, backendPayload);
      }
    },
    [execute]
  );

  const checkIn = useCallback(
    async ({ ownerAddress, backendPayload }: CheckInArgs = {}) => {
      await execute({ functionName: 'checkIn' });

      if (backendPayload && ownerAddress) {
        await recordCheckInApi(ownerAddress, backendPayload);
      }
    },
    [execute]
  );

  const clearPlan = useCallback(async () => {
    await execute({ functionName: 'clearPlan' });
  }, [execute]);

  const claimInheritance = useCallback(
    async ({ ownerAddress, backendPayload }: ClaimArgs) => {
      await execute({ functionName: 'claimInheritance', args: [ownerAddress] });

      if (backendPayload) {
        await recordClaimApi(ownerAddress, backendPayload);
      }
    },
    [execute]
  );

  return {
    isPending,
    createPlan,
    updateInheritors,
    updateTokens,
    updateCheckInInterval,
    checkIn,
    clearPlan,
    claimInheritance,
  };
}

export function useTeritagePlan(owner?: Address) {
  const address = TERITAGE_CONTRACT_ADDRESS || undefined;
  return useReadContract({
    abi: TERITAGE_INHERITANCE_ABI,
    address,
    functionName: 'getPlan',
    args: owner && address ? [owner] : undefined,
    query: {
      enabled: Boolean(owner && address),
    },
  });
}

export function useTeritageClaimStatus(owner?: Address) {
  const address = TERITAGE_CONTRACT_ADDRESS || undefined;
  return useReadContract({
    abi: TERITAGE_INHERITANCE_ABI,
    address,
    functionName: 'getClaimStatus',
    args: owner && address ? [owner] : undefined,
    query: {
      enabled: Boolean(owner && address),
    },
  });
}
