/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { isAddress, getAddress } from 'viem';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Info, Plus, Trash } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { useInheritancePlanStore } from '@/store/useInheritancePlanStore';
import { INextPage } from '@/type';

const beneficiarySchema = z.object({
  firstName: z.string().min(2, { message: 'First name is required' }),
  lastName: z.string().min(2, { message: 'Last name is required' }),
  email: z.string().email({ message: 'A valid email is required' }),
  walletAddress: z
    .string()
    .min(1, { message: 'Wallet address is required' })
    .refine((value) => isAddress(value), {
      message: 'Enter a valid EVM address',
    }),
  sharePercentage: z.coerce.number().min(1, { message: 'Share must be at least 1%' }).max(100, { message: 'Share cannot exceed 100%' }),
  notifyBeneficiary: z.boolean().optional(),
});

const formSchema = z
  .object({
    beneficiaries: z.array(beneficiarySchema).min(1, { message: 'Add at least one beneficiary' }),
  })
  .superRefine((values, ctx) => {
    const total = values.beneficiaries.reduce((acc, item) => acc + item.sharePercentage, 0);
    if (total > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Total allocation cannot exceed 100%',
        path: ['beneficiaries'],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

const DEFAULT_BENEFICIARY = {
  firstName: '',
  lastName: '',
  email: '',
  walletAddress: '',
  sharePercentage: 100,
  notifyBeneficiary: false,
};

export default function BeneficiaryInfoForm({ handleNext, hasFormat, isLoading, newBeneficiary = true }: INextPage) {
  const { beneficiaries, setBeneficiaries } = useInheritancePlanStore();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      beneficiaries: beneficiaries.length
        ? beneficiaries.map((b) => ({
            ...b,
            sharePercentage: Number(b.sharePercentage),
          }))
        : [DEFAULT_BENEFICIARY],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'beneficiaries' as const,
  });

  useEffect(() => {
    if (beneficiaries.length) {
      replace(
        beneficiaries.map((b) => ({
          ...b,
          sharePercentage: Number(b.sharePercentage),
        }))
      );
    }
  }, [beneficiaries, replace]);

  const totalShare = form.watch('beneficiaries').reduce((acc, item) => acc + (Number(item.sharePercentage) || 0), 0);

  function onSubmit(values: FormValues) {
    const formatted = values.beneficiaries.map((beneficiary) => ({
      firstName: beneficiary.firstName.trim(),
      lastName: beneficiary.lastName.trim(),
      email: beneficiary.email.trim(),
      walletAddress: getAddress(beneficiary.walletAddress),
      sharePercentage: Number(beneficiary.sharePercentage),
      notifyBeneficiary: beneficiary.notifyBeneficiary ?? false,
    }));

    setBeneficiaries(formatted);

    handleNext(hasFormat ? formatted : undefined);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {fields.map((field, index) => (
          <div key={field.id} className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-inverse">Beneficiary {index + 1}</h3>
              {fields.length > 1 && (
                <Button variant="destructive" type="button" onClick={() => remove(index)} size="sm">
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>

            <FormField
              control={form.control}
              name={`beneficiaries.${index}.firstName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`beneficiaries.${index}.lastName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`beneficiaries.${index}.email`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`beneficiaries.${index}.walletAddress`}
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Wallet Address</FormLabel>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button type="button">
                          <Info size={12} className="text-muted-foreground" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                          <DialogTitle>EVM Wallet Address</DialogTitle>
                          <Separator />
                          <DialogDescription>
                            EVM addresses start with 0x and identify wallets on Ethereum-compatible networks such as Hedera smart contracts, Base, or Polygon.
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <FormControl>
                    <Input placeholder="0x..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`beneficiaries.${index}.sharePercentage`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allocation (%)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} max={100} step={1} placeholder="Enter allocation" {...field} value={String(field.value || '')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`beneficiaries.${index}.notifyBeneficiary`}
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FormLabel>Notify beneficiary now?</FormLabel>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button type="button">
                          <Info size={12} className="text-muted-foreground" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                          <DialogTitle>Notify Beneficiary</DialogTitle>
                          <Separator />
                          <DialogDescription>
                            If enabled, Teritage will send an email letting the beneficiary know they have been added once your plan is confirmed.
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        ))}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Total allocation:</span>
            <span className="font-medium text-inverse">{totalShare}%</span>
          </div>
          {totalShare < 100 && <p className="text-xs text-muted-foreground">Unallocated percentage: {Math.max(0, 100 - totalShare)}%</p>}
          {form.formState.errors.beneficiaries?.root?.message && <p className="text-sm text-destructive">{form.formState.errors.beneficiaries.root.message}</p>}
        </div>

        <div className="flex gap-2">
          {newBeneficiary && (
            <Button
              type="button"
              variant="secondary"
              className="flex items-center gap-2"
              onClick={() =>
                append({
                  firstName: '',
                  lastName: '',
                  email: '',
                  walletAddress: '',
                  sharePercentage: 0,
                  notifyBeneficiary: false,
                })
              }
            >
              <Plus className="h-4 w-4" /> Add Another Beneficiary
            </Button>
          )}

          <Button type="submit" className="w-full" isLoading={isLoading} loadingText="Please wait...">
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}
