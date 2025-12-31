'use client';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import VerifyError from '../errors/verify-error';
import { useRouter } from 'next/navigation';
import { SUCCESS_CREATE_PIN_URL } from '@/config/path';

const FormSchema = z.object({
  pin: z.string().min(4, {
    message: 'Your one-time password must be 4 characters.',
  }),
});

export function CreatePinForm() {
  const router = useRouter();
  const isError = false;
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: '',
    },
  });

  function onSubmit() {
    router.push(SUCCESS_CREATE_PIN_URL);
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
                <FormItem className="space-y-2">
                  <div>
                    <FormLabel className="text-lg">Create Teritage PIN</FormLabel>
                    <FormDescription>Enter a 4-digit PIN to secure your wallet.</FormDescription>
                  </div>
                  <FormControl className="mt-4">
                    <InputOTP maxLength={4} {...field}>
                      <InputOTPGroup className="gap-2">
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
}
