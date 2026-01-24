'use client';

import { useCallback } from 'react';
import { useWriteContract, useReadContract } from 'wagmi';
import { waitForTransactionReceipt } from 'viem/actions';
import { createPublicClient, http, type Address } from 'viem';

import { TERITAGE_INHERITANCE_ABI } from '@/lib/abi/teritageInheritance';
import { TERITAGE_CHAIN_ID, TERITAGE_CONTRACT_ADDRESS, TERITAGE_TOKEN_TYPE_MAP } from '@/lib/blockchain/constants';
import type { CreateTeritagePlanRequest, UpdateTeritagePlanRequest, TeritageTokenConfig } from '@/type';
import { createTeritagePlanApi, updateTeritagePlanApi, recordCheckInApi } from '@/config/apis';
import { hederaTestnet } from 'wagmi/chains';

interface ContractTokenInput extends TeritageTokenConfig {
  address: Address;
}

interface CreatePlanArgs {
  inheritors: Address[];
  shares: number[];
  secretHashes: `0x${string}`[];
  tokens: ContractTokenInput[];
  checkInIntervalSeconds: number;
  backendPayload?: CreateTeritagePlanRequest;
}

interface UpdateInheritorsArgs {
  inheritors: Address[];
  shares: number[];
  secretHashes?: `0x${string}`[];
  backendPayload?: UpdateTeritagePlanRequest;
}

interface UpdateTokensArgs {
  tokens: ContractTokenInput[];
  backendPayload?: UpdateTeritagePlanRequest;
}

interface UpdateIntervalArgs {
  newIntervalSeconds: number;
  backendPayload?: UpdateTeritagePlanRequest;
}

interface ClaimArgs {
  ownerAddress: Address;
}

interface CheckInArgs {
  backendPayload?: { triggeredBy?: string; note?: string; timestamp?: string };
}

const ensureAddressConfigured = (): Address => {
  if (!TERITAGE_CONTRACT_ADDRESS) {
    throw new Error('Teritage contract address is not configured. Set NEXT_PUBLIC_TERITAGE_CONTRACT_ADDRESS.');
  }
  return TERITAGE_CONTRACT_ADDRESS;
};

const toTokenTypes = (tokens: ContractTokenInput[]): number[] => tokens.map((token) => TERITAGE_TOKEN_TYPE_MAP[token.type]);

const toShareValues = (shares: number[]): bigint[] => shares.map((share) => BigInt(share));

const toInterval = (seconds: number): bigint => BigInt(seconds);

export const wagmiPublicClient = createPublicClient({
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
      await waitForTransactionReceipt(wagmiPublicClient, { hash });
      return hash;
    },
    [writeContractAsync]
  );

  const createPlan = useCallback(
    async ({ inheritors, shares, secretHashes, tokens, checkInIntervalSeconds, backendPayload }: CreatePlanArgs) => {
      await execute({
        functionName: 'createPlan',
        args: [
          inheritors,
          toShareValues(shares),
          secretHashes,
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
    async ({ inheritors, shares, secretHashes, backendPayload }: UpdateInheritorsArgs) => {
      const functionName = secretHashes ? 'updateInheritorsWithSecrets' : 'updateInheritors';
      const args = secretHashes ? [inheritors, toShareValues(shares), secretHashes] : [inheritors, toShareValues(shares)];
      await execute({
        functionName,
        args,
      });

      if (backendPayload) {
        await updateTeritagePlanApi(backendPayload);
      }
    },
    [execute]
  );

  const updateTokens = useCallback(
    async ({ tokens, backendPayload }: UpdateTokensArgs) => {
      await execute({
        functionName: 'updateTokens',
        args: [tokens.map((token) => token.address), toTokenTypes(tokens)],
      });

      if (backendPayload) {
        await updateTeritagePlanApi(backendPayload);
      }
    },
    [execute]
  );

  const updateCheckInInterval = useCallback(
    async ({ newIntervalSeconds, backendPayload }: UpdateIntervalArgs) => {
      await execute({
        functionName: 'updateCheckInInterval',
        args: [toInterval(newIntervalSeconds)],
      });

      if (backendPayload) {
        await updateTeritagePlanApi(backendPayload);
      }
    },
    [execute]
  );

  const checkIn = useCallback(
    async ({ backendPayload }: CheckInArgs = {}) => {
      await execute({ functionName: 'checkIn' });

      if (backendPayload) {
        await recordCheckInApi(backendPayload);
      }
    },
    [execute]
  );

  const clearPlan = useCallback(async () => {
    await execute({ functionName: 'clearPlan' });
  }, [execute]);

  const claimInheritance = useCallback(
    async ({ ownerAddress }: ClaimArgs) => {
      await execute({ functionName: 'claimInheritance', args: [ownerAddress] });
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
