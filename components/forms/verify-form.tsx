'use client';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import VerifyError from '../errors/verify-error';
import { useRouter, useSearchParams } from 'next/navigation';
import { SET_PASSWORD_URL } from '@/config/path';
import { useMutation } from '@tanstack/react-query';
import { userForgotPassword, userForgotPasswordVerify, userSignUp, userSignUpVerify } from '@/config/apis';
import { toast } from 'sonner';
import { useState } from 'react';
import ShowError from '../errors/display-error';
import { Loader } from 'lucide-react';

import { setCookie } from 'cookies-next';
import { getApiErrorMessage } from '@/lib/api-error';

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: 'Your one-time password must be 6 characters.',
  }),
});

export function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const type = searchParams.get('type') || 'signup';
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isError = false;
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: '',
    },
  });

  const { mutate: mutateResend, isPending: isResending } = useMutation({
    mutationFn: type === 'reset' ? userForgotPassword : userSignUp,
    onSuccess: (response) => toast.success(response.message),
    onError: (error: any) => setErrorMessage(getApiErrorMessage(error, 'An error occured while processing')),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: type === 'reset' ? userForgotPasswordVerify : userSignUpVerify,
    onSuccess: async (response: any) => {
      toast.success('User verified successfully');
      await setCookie('teritage_verification_token', response.verificationToken);
      router.push(`${SET_PASSWORD_URL}?email=${email}&type=${type}`);
    },
    onError: (error: any) => setErrorMessage(getApiErrorMessage(error, 'An error occured while processing')),
  });

  const handleResend = () => {
    setErrorMessage(null);
    mutateResend({ email });
  };

  function onSubmit(values: z.infer<typeof FormSchema>) {
    setErrorMessage(null);
    mutate({ code: values.pin, email });
  }

  return (
    <div>
      {isError ? (
        <VerifyError />
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ShowError error={errorMessage} setError={setErrorMessage} />
            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <div>
                    <FormLabel className="text-lg">Verification Code</FormLabel>
                    <FormDescription>Enter the 6-digit code sent to your email address.</FormDescription>
                  </div>
                  <FormControl className="mt-4">
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup className="gap-2">
                        <InputOTPSlot className="w-[60px]" index={0} />
                        <InputOTPSlot className="w-[60px]" index={1} />
                        <InputOTPSlot className="w-[60px]" index={2} />
                        <InputOTPSlot className="w-[60px]" index={3} />
                        <InputOTPSlot className="w-[60px]" index={4} />
                        <InputOTPSlot className="w-[60px]" index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <div className="flex space-x-2 items-center">
                    <p className="text-sm text-muted">
                      Didn’t receive code?{' '}
                      <span className="text-primary cursor-pointer" role="button" onClick={handleResend}>
                        Resend
                      </span>
                    </p>
                    {isResending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" loadingText="Please wait..." isLoading={isPending}>
              Continue
            </Button>
            <p className="text-sm text-muted text-center">
              By using Teritage, you agree to the{' '}
              <span className="text-primary" role="button">
                Terms
              </span>{' '}
              and{' '}
              <span className="text-primary" role="button">
                Privacy Policy
              </span>
              .
            </p>
          </form>
        </Form>
      )}
    </div>
  );
}
