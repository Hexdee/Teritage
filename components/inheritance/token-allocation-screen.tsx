'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAccount, useWriteContract } from 'wagmi';
import { getAddress, isAddress, parseAbi, zeroAddress, type Address } from 'viem';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { BeneficiaryEntry, useInheritancePlanStore } from '@/store/useInheritancePlanStore';
import { useTeritageContract, wagmiPublicClient } from '@/lib/blockchain/useTeritageContract';
import { SUCCESS_ALLOCATION_URL, BENEFICIARY_INFO_URL, INHERITANCE_SETUP_URL } from '@/config/path';
import type { TeritageTokenType } from '@/lib/blockchain/constants';
import { TERITAGE_CONTRACT_ADDRESS } from '@/lib/blockchain/constants';
import { Plus, Trash2 } from 'lucide-react';
import { formatAddress } from '@/lib/utils';
import ShowError from '@/components/errors/display-error';
import { waitForTransactionReceipt } from 'viem/actions';
import { hashSecretAnswer } from '@/lib/secret';
import { decodeContractError } from '@/lib/blockchain/contract-errors';

export const ZERO_ADDRESS = zeroAddress;

const ERC20_ABI = parseAbi([
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
]);

const HAS_CONTRACT_ADDRESS = '0x000000000000000000000000000000000000016a' as Address;

const HAS_ABI = parseAbi([
  'function hbarApprove(address owner,address spender,int256 amount) returns (int64)',
  'function hbarAllowance(address owner,address spender) view returns (int64,int256)',
]);

const MAX_UINT256 = (BigInt(2) ** BigInt(256)) - BigInt(1);
const MAX_HBAR_ALLOWANCE = (BigInt(2) ** BigInt(63)) - BigInt(1); // Hedera tinybar allowance cap (int64 max)
const ZERO_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000' as const;

type ApprovalStatus = 'idle' | 'pending' | 'success' | 'error';

interface TokenApprovalState {
  status: ApprovalStatus;
  message?: string;
}

interface NormalizedToken {
  key: string;
  type: TeritageTokenType;
  address: Address;
  isHbar: boolean;
}

const tokenSchema = z
  .object({
    type: z.enum(['ERC20', 'HTS', 'HBAR']),
    address: z.string().optional(),
  })
  .superRefine((token, ctx) => {
    if (token.type === 'HBAR') {
      return;
    }

    if (!token.address) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter a token contract address',
        path: ['address'],
      });
      return;
    }

    if (!isAddress(token.address)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid contract address',
        path: ['address'],
      });
    }
  });

const formSchema = z
  .object({
    tokens: z.array(tokenSchema).min(1, { message: 'Add at least one token to manage' }),
  })
  .superRefine((values, ctx) => {
    const seen = new Set<string>();
    values.tokens.forEach((token, index) => {
      const normalized = token.type === 'HBAR' ? ZERO_ADDRESS : token.address ? getAddress(token.address) : '';
      if (normalized && seen.has(normalized)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Duplicate token',
          path: ['tokens', index, 'address'],
        });
      }
      if (normalized) {
        seen.add(normalized);
      }
    });
  });

type FormValues = z.infer<typeof formSchema>;

export const formatName = (beneficiary: BeneficiaryEntry) => `${beneficiary.firstName} ${beneficiary.lastName}`.trim();

interface TokenAllocationProps {
  handleNext?: () => void;
}

export default function TokenAllocation({ handleNext }: TokenAllocationProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [approvalState, setApprovalState] = useState<Record<string, TokenApprovalState>>({});
  const [isApproving, setIsApproving] = useState(false);
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { createPlan, isPending } = useTeritageContract();
  const { writeContractAsync } = useWriteContract();
  const { checkInIntervalSeconds, beneficiaries, tokens, socialLinks, setTokens } = useInheritancePlanStore();

  const defaultTokens = tokens.length
    ? tokens.map((token) => ({
        type: token.type as TeritageTokenType,
        address: token.address,
      }))
    : [
        {
          type: 'HBAR' as TeritageTokenType,
          address: ZERO_ADDRESS,
        },
      ];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tokens: defaultTokens,
    },
  });

  const watchedTokens = form.watch('tokens');

  const normalizedTokens = useMemo<NormalizedToken[]>(() => {
    if (!watchedTokens?.length) {
      return [];
    }

    const normalized: NormalizedToken[] = [];

    for (const token of watchedTokens) {
      if (!token) continue;
      if (token.type === 'HBAR') {
        const normalizedAddress = getAddress(ZERO_ADDRESS);
        normalized.push({
          key: `HBAR:${normalizedAddress.toLowerCase()}`,
          type: 'HBAR',
          address: normalizedAddress,
          isHbar: true,
        });
        continue;
      }

      if (!token.address) {
        continue;
      }

      try {
        const normalizedAddress = getAddress(token.address);
        normalized.push({
          key: `${token.type}:${normalizedAddress.toLowerCase()}`,
          type: token.type,
          address: normalizedAddress,
          isHbar: false,
        });
      } catch {
        // ignore invalid addresses until user corrects them
      }
    }

    return normalized;
  }, [watchedTokens]);

  const ownerAddress = useMemo(() => {
    try {
      return address ? getAddress(address) : undefined;
    } catch {
      return undefined;
    }
  }, [address]);

  const spenderAddress = useMemo(() => {
    try {
      return TERITAGE_CONTRACT_ADDRESS ? getAddress(TERITAGE_CONTRACT_ADDRESS) : undefined;
    } catch {
      return undefined;
    }
  }, []);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tokens',
  });

  const checkAllowances = useCallback(async () => {
    if (!ownerAddress || !spenderAddress || normalizedTokens.length === 0) {
      setApprovalState({});
      return;
    }

    const statusUpdates: Record<string, TokenApprovalState> = {};

    for (const token of normalizedTokens) {
      try {
        if (token.isHbar) {
          const allowanceResponse = (await wagmiPublicClient.readContract({
            address: HAS_CONTRACT_ADDRESS,
            abi: HAS_ABI,
            functionName: 'hbarAllowance',
            args: [ownerAddress, spenderAddress],
          })) as readonly [bigint, bigint];
          const allowedAmount = allowanceResponse[1];
          statusUpdates[token.key] = {
            status: allowedAmount > BigInt(0) ? 'success' : 'idle',
          };
        } else {
          const allowance = (await wagmiPublicClient.readContract({
            address: token.address,
            abi: ERC20_ABI,
            functionName: 'allowance',
            args: [ownerAddress, spenderAddress],
          })) as bigint;
          statusUpdates[token.key] = {
            status: allowance > BigInt(0) ? 'success' : 'idle',
          };
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to check allowance';
        statusUpdates[token.key] = { status: 'error', message };
      }
    }

    setApprovalState(statusUpdates);
  }, [normalizedTokens, ownerAddress, spenderAddress]);

  useEffect(() => {
    void checkAllowances();
  }, [checkAllowances]);

  useEffect(() => {
    if (!checkInIntervalSeconds) {
      router.replace(INHERITANCE_SETUP_URL);
    } else if (!beneficiaries.length) {
      router.replace(BENEFICIARY_INFO_URL);
    }
  }, [beneficiaries.length, checkInIntervalSeconds, router]);

  const summaryTotal = beneficiaries.reduce((acc, beneficiary) => acc + beneficiary.sharePercentage, 0);

  const handleApproveTokens = useCallback(async () => {
    if (!ownerAddress || !spenderAddress) {
      toast.error('Connect your wallet to approve tokens');
      return;
    }

    if (normalizedTokens.length === 0) {
      toast.error('Add at least one token');
      return;
    }

    setIsApproving(true);

    try {
      for (const token of normalizedTokens) {
        if (approvalState[token.key]?.status === 'success') {
          continue;
        }

        setApprovalState((prev) => ({
          ...prev,
          [token.key]: { status: 'pending' },
        }));

        try {
          if (token.isHbar) {
            const hash = await writeContractAsync({
              address: HAS_CONTRACT_ADDRESS,
              abi: HAS_ABI,
              functionName: 'hbarApprove',
              args: [ownerAddress, spenderAddress, MAX_HBAR_ALLOWANCE],
            });
            const receipt = await waitForTransactionReceipt(wagmiPublicClient, { hash });
            if (receipt.status !== 'success') {
              throw new Error('HBAR approval transaction reverted');
            }
          } else {
            let approvalSucceeded = false;
            try {
              const hash = await writeContractAsync({
                address: token.address,
                abi: ERC20_ABI,
                functionName: 'approve',
                args: [spenderAddress, MAX_UINT256],
              });
              const receipt = await waitForTransactionReceipt(wagmiPublicClient, { hash });
              if (receipt.status !== 'success') {
                throw new Error('Token approval transaction reverted');
              }
              approvalSucceeded = true;
            } catch (initialError) {
              try {
                const resetHash = await writeContractAsync({
                  address: token.address,
                  abi: ERC20_ABI,
                  functionName: 'approve',
                  args: [spenderAddress, BigInt(0)],
                });
                const resetReceipt = await waitForTransactionReceipt(wagmiPublicClient, { hash: resetHash });
                if (resetReceipt.status !== 'success') {
                  throw new Error('Token allowance reset reverted');
                }

                const retryHash = await writeContractAsync({
                  address: token.address,
                  abi: ERC20_ABI,
                  functionName: 'approve',
                  args: [spenderAddress, MAX_UINT256],
                });
                const retryReceipt = await waitForTransactionReceipt(wagmiPublicClient, { hash: retryHash });
                if (retryReceipt.status !== 'success') {
                  throw new Error('Token approval retry reverted');
                }
                approvalSucceeded = true;
              } catch (resetError) {
                throw resetError ?? initialError;
              }
            }

            if (!approvalSucceeded) {
              throw new Error('Token approval failed');
            }
          }

          setApprovalState((prev) => ({
            ...prev,
            [token.key]: { status: 'success' },
          }));
        } catch (error) {
          const decoded = decodeContractError(error, token.isHbar ? HAS_ABI : ERC20_ABI);
          const message = decoded.message || 'Approval failed';
          setApprovalState((prev) => ({
            ...prev,
            [token.key]: { status: 'error', message },
          }));
          throw new Error(message);
        }
      }

      await checkAllowances();
      toast.success('Tokens approved successfully');
    } catch (error) {
      const decoded = decodeContractError(error, HAS_ABI);
      const message = decoded.message || (error instanceof Error ? error.message : 'Failed to approve tokens');
      toast.error(message);
    } finally {
      setIsApproving(false);
    }
  }, [approvalState, checkAllowances, normalizedTokens, ownerAddress, spenderAddress, writeContractAsync]);

  async function onSubmit(values: FormValues) {
    setErrorMessage(null);
    if (!isConnected || !address) {
      toast.error('Connect your wallet to continue');
      return;
    }

    if (!checkInIntervalSeconds) {
      toast.error('Check-in interval is missing. Please restart the setup process.');
      router.replace(INHERITANCE_SETUP_URL);
      return;
    }

    if (!beneficiaries.length) {
      toast.error('Add at least one beneficiary before allocating tokens.');
      router.replace(BENEFICIARY_INFO_URL);
      return;
    }

    try {
      const normalizedTokens = values.tokens.map((token) => ({
        type: token.type,
        address: token.type === 'HBAR' ? ZERO_ADDRESS : getAddress(token.address as string),
      }));

      const chainInheritors = beneficiaries.map((beneficiary) => {
        const resolvedAddress = beneficiary.walletAddress ? getAddress(beneficiary.walletAddress) : ZERO_ADDRESS;
        return {
          address: resolvedAddress,
          sharePercentage: Math.round(beneficiary.sharePercentage),
          name: formatName(beneficiary),
          email: beneficiary.email.trim(),
          secretQuestion: beneficiary.secretQuestion?.trim(),
          secretAnswerHash: beneficiary.secretAnswer ? hashSecretAnswer(beneficiary.secretAnswer) : undefined,
          shareSecretQuestion: beneficiary.shareSecretQuestion ?? false,
        };
      });

      const inheritorAddresses = chainInheritors.map((beneficiary) => getAddress(beneficiary.address));
      const shares = chainInheritors.map((beneficiary) => Math.round(beneficiary.sharePercentage * 100));
      const secretHashes = chainInheritors.map(
        (beneficiary) => (beneficiary.secretAnswerHash ?? ZERO_HASH) as `0x${string}`
      );

      const sanitizedSocialLinks = socialLinks.map((link) => link.url.trim()).filter((url) => url.length > 0);

      const shouldNotifyBeneficiaries = beneficiaries.some((beneficiary) => beneficiary.notifyBeneficiary);

      const backendPayload = {
        ownerAddress: getAddress(address),
        inheritors: chainInheritors.map((beneficiary) => ({
          address: beneficiary.secretAnswerHash ? undefined : beneficiary.address,
          sharePercentage: beneficiary.sharePercentage,
          name: beneficiary.name,
          email: beneficiary.email,
          secretQuestion: beneficiary.secretQuestion,
          secretAnswerHash: beneficiary.secretAnswerHash,
          shareSecretQuestion: beneficiary.shareSecretQuestion,
        })),
        tokens: normalizedTokens.map((token) => ({
          type: token.type,
          address: token.address,
        })),
        checkInIntervalSeconds,
        ...(sanitizedSocialLinks.length ? { socialLinks: sanitizedSocialLinks } : {}),
        ...(shouldNotifyBeneficiaries ? { notifyBeneficiary: true } : {}),
      };

      await createPlan({
        inheritors: inheritorAddresses,
        shares,
        secretHashes,
        tokens: normalizedTokens.map((token) => ({
          type: token.type,
          address: getAddress(token.address),
        })),
        checkInIntervalSeconds,
        backendPayload,
      });

      setTokens(
        normalizedTokens.map((token) => ({
          type: token.type,
          address: token.address,
        }))
      );

      if (handleNext) {
        handleNext();
      } else {
        router.push(SUCCESS_ALLOCATION_URL);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save inheritance plan';
      setErrorMessage(message);
      toast.error('An error occured');
    }
  }

  const allApproved = normalizedTokens.length > 0 && normalizedTokens.every((token) => approvalState[token.key]?.status === 'success');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-medium text-inverse">Beneficiaries</h2>
        <div className="space-y-4 rounded-lg border p-4">
          {beneficiaries.map((beneficiary, index) => (
            <div key={`${beneficiary.walletAddress}-${index}`} className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="text-inverse font-medium">{formatName(beneficiary)}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Allocation</p>
                <p className="text-inverse font-medium">{beneficiary.sharePercentage}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Contact</p>
                <p className="text-inverse truncate">{beneficiary.email}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">Wallet</p>
                <p className="font-mono text-xs text-inverse">{beneficiary.walletAddress ? formatAddress(beneficiary.walletAddress) : '-'}</p>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
            <span>Total allocation</span>
            <span className="text-inverse font-semibold">{summaryTotal}%</span>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-inverse">Tracked tokens</h2>
              <Button
                type="button"
                variant="secondary"
                className="flex items-center gap-2 w-fit"
                onClick={() =>
                  append({
                    type: 'ERC20',
                    address: '',
                  })
                }
              >
                <Plus className="h-4 w-4" /> Add token
              </Button>
            </div>

            {fields.map((field, index) => {
              const typeValue = form.watch(`tokens.${index}.type`);
              const isHbar = typeValue === 'HBAR';
              const normalizedToken = normalizedTokens[index];
              const approvalKey = normalizedToken?.key;
              const state = approvalKey ? approvalState[approvalKey] : undefined;
              const indicatorClass =
                state?.status === 'success'
                  ? 'bg-emerald-500'
                  : state?.status === 'error'
                  ? 'bg-destructive'
                  : state?.status === 'pending'
                  ? 'bg-amber-400 animate-pulse'
                  : 'bg-muted-foreground/40';

              return (
                <div key={field.id} className="space-y-2">
                  <div className="space-y-4 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-inverse">Token {index + 1}</h3>
                        <span className={`h-2.5 w-2.5 rounded-full ${indicatorClass}`} />
                      </div>
                      {fields.length > 1 && (
                        <Button variant="ghost" type="button" size="sm" onClick={() => remove(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name={`tokens.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token type</FormLabel>
                          <Select
                            onValueChange={(value: TeritageTokenType) => {
                              field.onChange(value);
                              form.setValue(`tokens.${index}.address`, value === 'HBAR' ? ZERO_ADDRESS : '', { shouldValidate: true });
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select token type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="HBAR">HBAR (native)</SelectItem>
                              <SelectItem value="ERC20">ERC-20</SelectItem>
                              <SelectItem value="HTS">HTS token</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`tokens.${index}.address`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Token contract address</FormLabel>
                          <FormControl>
                            <Input placeholder={isHbar ? 'HBAR uses the native balance' : '0x...'} disabled={isHbar} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className={`h-2.5 w-2.5 rounded-full ${indicatorClass}`} />
                    <span>
                      {state?.status === 'success'
                        ? 'Approved'
                        : state?.status === 'pending'
                        ? 'Approving…'
                        : state?.status === 'error'
                        ? state.message ?? 'Approval failed'
                        : 'Not approved'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator />

          <ShowError error={errorMessage} setError={setErrorMessage} />

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleApproveTokens}
              isLoading={isApproving}
              disabled={isApproving || normalizedTokens.length === 0 || allApproved}
            >
              {allApproved ? 'Tokens approved' : isApproving ? 'Approving tokens...' : 'Approve Tokens'}
            </Button>
            <Button type="submit" isLoading={isPending} loadingText="Saving plan..." disabled={!allApproved || isPending || isApproving}>
              Save & Activate Plan
            </Button>
          </div>

        </form>
      </Form>
    </div>
  );
}
