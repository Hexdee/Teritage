'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { isAddress, getAddress } from 'viem';
import { CheckCircle2, ChevronLeft, Search, ShieldCheck, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { claimLookup, claimSubmit, claimVerify } from '@/config/apis';
import { getApiErrorMessage } from '@/lib/api-error';

const searchSchema = z.object({
  ownerEmail: z.string().email({ message: 'Enter a valid owner email' }),
  beneficiaryEmail: z.string().email({ message: 'Enter a valid beneficiary email' }),
});

const verifySchema = z.object({
  secretAnswer: z.string().min(1, { message: 'Secret answer is required' }),
});

const walletSchema = z.object({
  beneficiaryWallet: z.string().refine((val) => Boolean(isAddress(val)), {
    message: 'Enter a valid EVM wallet address',
  }),
});

type Step = 'SEARCH' | 'VERIFY' | 'WALLET' | 'SUCCESS';

export default function ClaimForm() {
  const [step, setStep] = useState<Step>('SEARCH');
  const [isLoading, setIsLoading] = useState(false);
  const [secretQuestion, setSecretQuestion] = useState<string | null>(null);
  const [claimTarget, setClaimTarget] = useState<{ ownerAddress: string; inheritorIndex: number } | null>(null);
  const [verifiedAnswer, setVerifiedAnswer] = useState<string | null>(null);
  const [claimable, setClaimable] = useState<boolean | null>(null);

  // Search Step Form
  const searchForm = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: { ownerEmail: '', beneficiaryEmail: '' },
  });

  // Verify Step Form
  const verifyForm = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: { secretAnswer: '' },
  });

  // Wallet Step Form
  const walletForm = useForm<z.infer<typeof walletSchema>>({
    resolver: zodResolver(walletSchema),
    defaultValues: { beneficiaryWallet: '' },
  });

  const onSearchSubmit = async (values: z.infer<typeof searchSchema>) => {
    setIsLoading(true);
    try {
      setClaimTarget(null);
      setVerifiedAnswer(null);
      setClaimable(null);
      const response = await claimLookup(values);
      setSecretQuestion(response.secretQuestion);
      setClaimTarget({ ownerAddress: response.ownerAddress, inheritorIndex: response.inheritorIndex });
      setStep('VERIFY');
      toast.success("Plan found! Please verify your identity.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "No active plan found for these details."));
    } finally {
      setIsLoading(false);
    }
  };

  const onVerifySubmit = async (values: z.infer<typeof verifySchema>) => {
    setIsLoading(true);
    try {
      if (!claimTarget) {
        toast.error('Missing claim details. Please restart the lookup.');
        setStep('SEARCH');
        return;
      }
      await claimVerify({
        ownerAddress: claimTarget.ownerAddress,
        inheritorIndex: claimTarget.inheritorIndex,
        secretAnswer: values.secretAnswer,
      });
      setVerifiedAnswer(values.secretAnswer);
      setStep('WALLET');
      toast.success("Identity verified.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Incorrect answer. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const onWalletSubmit = async (values: z.infer<typeof walletSchema>) => {
    setIsLoading(true);
    try {
      if (!claimTarget || !verifiedAnswer) {
        toast.error('Missing verification details. Please restart the claim.');
        setStep('SEARCH');
        return;
      }
      const response = await claimSubmit({
        ownerAddress: claimTarget.ownerAddress,
        inheritorIndex: claimTarget.inheritorIndex,
        secretAnswer: verifiedAnswer,
        beneficiaryWallet: getAddress(values.beneficiaryWallet),
      });
      setClaimable(response.claimable);
      setStep('SUCCESS');
      toast.success(response.claimable ? "Claim submitted successfully!" : "Wallet saved. Claim will trigger once eligible.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to submit claim. Please try again."));
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIcon = (currentStep: Step, targetStep: Step, icon: React.ReactNode) => {
    const isActive = step === targetStep;
    const isCompleted = 
      (targetStep === 'SEARCH' && (step === 'VERIFY' || step === 'WALLET' || step === 'SUCCESS')) ||
      (targetStep === 'VERIFY' && (step === 'WALLET' || step === 'SUCCESS')) ||
      (targetStep === 'WALLET' && step === 'SUCCESS');

    return (
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300",
        isActive ? "border-primary bg-primary/10 text-primary scale-110" : 
        isCompleted ? "border-green-500 bg-green-500 text-white" : 
        "border-muted text-muted-foreground"
      )}>
        {isCompleted ? <CheckCircle2 size={20} /> : icon}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-xl space-y-8 py-10 px-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-medium tracking-tight text-inverse">Claim Inheritance</h1>
        <p className="text-muted-foreground">Follow the steps to verify and claim your assets.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center space-x-4">
        {renderStepIcon('SEARCH', 'SEARCH', <Search size={20} />)}
        <div className="h-0.5 w-12 bg-muted" />
        {renderStepIcon('VERIFY', 'VERIFY', <ShieldCheck size={20} />)}
        <div className="h-0.5 w-12 bg-muted" />
        {renderStepIcon('WALLET', 'WALLET', <Wallet size={20} />)}
      </div>

      <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-8">
          {step === 'SEARCH' && (
            <Form {...searchForm}>
              <form onSubmit={searchForm.handleSubmit(onSearchSubmit)} className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl font-medium text-inverse">Find Inheritance Plan</h2>
                  <p className="text-sm text-muted-foreground">Enter the plan owner’s email and your beneficiary email to locate the claim.</p>
                </div>
                <FormField
                  control={searchForm.control}
                  name="ownerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="name@example.com" {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={searchForm.control}
                  name="beneficiaryEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-12 text-lg" isLoading={isLoading} loadingText='Searching...'>
                  Search Plan
                </Button>
              </form>
            </Form>
          )}

          {step === 'VERIFY' && (
            <Form {...verifyForm}>
              <form onSubmit={verifyForm.handleSubmit(onVerifySubmit)} className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-inverse">Identity Verification</h2>
                  <p className="text-sm text-muted-foreground">Answer the secret question set by the owner to proceed.</p>
                </div>
                
                <div className="p-4 rounded-lg bg-muted/30 border border-muted/50">
                  <p className="text-xs font-medium uppercase text-muted-foreground mb-1">Secret Question</p>
                  <p className="text-lg text-inverse">{secretQuestion}</p>
                </div>

                <FormField
                  control={verifyForm.control}
                  name="secretAnswer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Answer</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your answer" {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-12 text-lg" isLoading={isLoading} loadingText='Verifying...'>
                  Verify Answer
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setStep('SEARCH')} startIcon={<ChevronLeft size={20} />}>
                  Back to Search
                </Button>
              </form>
            </Form>
          )}

          {step === 'WALLET' && (
            <Form {...walletForm}>
              <form onSubmit={walletForm.handleSubmit(onWalletSubmit)} className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold text-inverse">Recipient Wallet</h2>
                  <p className="text-sm text-muted-foreground">Provide the EVM wallet address where the assets should be sent.</p>
                </div>
                <FormField
                  control={walletForm.control}
                  name="beneficiaryWallet"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet Address (EVM)</FormLabel>
                      <FormControl>
                        <Input placeholder="0x..." {...field} className="h-12" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-12 text-lg" isLoading={isLoading} loadingText='Submitting...'>
                  Submit Claim
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setStep('VERIFY')} startIcon={<ChevronLeft size={20} />}>
                  Back
                </Button>
              </form>
            </Form>
          )}

          {step === 'SUCCESS' && (
            <div className="text-center space-y-6 py-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500 animate-in zoom-in duration-500">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-medium text-inverse">Claim Request Received</h2>
                <p className="text-muted-foreground px-4">
                  {claimable
                    ? 'Your claim has been submitted. The assets will be transferred to your wallet once the verification process is complete.'
                    : 'Your wallet has been recorded. The claim will be processed once the plan becomes eligible.'}
                </p>
              </div>
              <div className="pt-4">
                <Button className="w-full h-12" onClick={() => window.location.href = '/'}>
                  Return Home
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
