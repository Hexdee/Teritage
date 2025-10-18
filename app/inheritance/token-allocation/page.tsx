'use client';

import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAccount } from 'wagmi';
import { getAddress, isAddress, zeroAddress } from 'viem';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { BeneficiaryEntry, useInheritancePlanStore } from '@/store/useInheritancePlanStore';
import { useTeritageContract } from '@/lib/blockchain/useTeritageContract';
import { SUCCESS_ALLOCATION_URL, BENEFICIARY_INFO_URL, INHERITANCE_SETUP_URL } from '@/config/path';
import type { TeritageTokenType } from '@/lib/blockchain/constants';
import { Plus, Trash2 } from 'lucide-react';
import { formatAddress } from '@/lib/utils';
import ShowError from '@/components/errors/display-error';

export const ZERO_ADDRESS = zeroAddress;

const tokenSchema = z
  .object({
    type: z.enum(['ERC20', 'HTS', 'HBAR']),
    address: z.string().optional(),
  })
  .superRefine((token, ctx) => {
    // Skip address validation for HBAR tokens
    if (token.type === 'HBAR') {
      return;
    }

    // For non-HBAR tokens, address is required
    if (!token.address) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter a token contract address',
        path: ['address'],
      });
      return;
    }

    // Validate address format
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

interface ITokenAllocation {
  handleNext?: () => void;
}

export default function TokenAllocation({ handleNext }: ITokenAllocation) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { createPlan, isPending } = useTeritageContract();
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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'tokens',
  });

  useEffect(() => {
    if (!checkInIntervalSeconds) {
      router.replace(INHERITANCE_SETUP_URL);
    } else if (!beneficiaries.length) {
      router.replace(BENEFICIARY_INFO_URL);
    }
  }, [beneficiaries.length, checkInIntervalSeconds, router]);

  const summaryTotal = beneficiaries.reduce((acc, beneficiary) => acc + beneficiary.sharePercentage, 0);

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

      const inheritorAddresses = beneficiaries.map((beneficiary) => getAddress(beneficiary.walletAddress));
      const shares = beneficiaries.map((beneficiary) => Math.round(beneficiary.sharePercentage * 100));

      const sanitizedSocialLinks = socialLinks.map((link) => link.url.trim()).filter((url) => url.length > 0);

      const shouldNotifyBeneficiaries = beneficiaries.some((beneficiary) => beneficiary.notifyBeneficiary);

      const backendPayload = {
        ownerAddress: getAddress(address),
        inheritors: beneficiaries.map((beneficiary) => ({
          address: getAddress(beneficiary.walletAddress),
          sharePercentage: Math.round(beneficiary.sharePercentage),
          name: formatName(beneficiary),
          email: beneficiary.email.trim(),
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
        tokens: normalizedTokens.map((token) => ({
          ...token,
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
                <p className="font-mono text-xs text-inverse">{formatAddress(beneficiary.walletAddress)}</p>
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

              return (
                <div key={field.id} className="space-y-4 rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-inverse">Token {index + 1}</h3>
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
              );
            })}
          </div>

          <Separator />

          <ShowError error={errorMessage} setError={setErrorMessage} />

          <div className="flex justify-end">
            <Button type="submit" isLoading={isPending} loadingText="Saving plan...">
              Save & Activate Plan
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
