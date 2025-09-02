'use client';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import VerifyError from '../errors/verify-error';
import { useRouter } from 'next/navigation';
import { SET_PASSWORD_URL } from '@/config/path';

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: 'Your one-time password must be 6 characters.',
  }),
});

export function VerifyForm() {
  const router = useRouter();
  const isError = false;
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: '',
    },
  });

  function onSubmit(values: z.infer<typeof FormSchema>) {
    console.log(values);
    router.push(SET_PASSWORD_URL);
  }

  return (
    <div>
      {isError ? (
        <VerifyError />
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <p className="text-sm text-muted">
                    Didn’t receive code?{' '}
                    <span className="text-primary" role="button">
                      Resend
                    </span>
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
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
