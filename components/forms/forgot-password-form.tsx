'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { LOGIN_URL, VERIFY_URL } from '@/config/path';
import { useMutation } from '@tanstack/react-query';
import { userForgotPassword } from '@/config/apis';
import { toast } from 'sonner';
import ShowError from '../errors/display-error';
import { useState } from 'react';
import Link from 'next/link';
import { getApiErrorMessage } from '@/lib/api-error';

const FormSchema = z.object({
  email: z.string().email({
    message: 'Valid email is required',
  }),
});

export function ForgotPasswordForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: userForgotPassword,
    onSuccess: async () => {
      toast.success('Reset code sent to your email successfully', { duration: 5000 });
      router.push(`${VERIFY_URL}?email=${form.getValues('email')}&type=reset`);
    },
    onError: (error: any) => setErrorMessage(getApiErrorMessage(error, 'An error occured while processing')),
  });

  function onSubmit(values: z.infer<typeof FormSchema>) {
    setErrorMessage(null);
    mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h2 className="text-2xl font-medium">Forgot Password</h2>
          <p className="text-sm">Enter your email to reset your password.</p>
        </div>

        <ShowError error={errorMessage} setError={setErrorMessage} />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl className="">
                <Input type="email" placeholder="Email address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" loadingText="Please wait..." isLoading={isPending}>
          Continue
        </Button>
        <p className="text-sm text-muted text-center">
          Remember password ?{' '}
          <Link href={LOGIN_URL}>
            <span className="text-primary" role="button">
              Login
            </span>
          </Link>
        </p>
      </form>
    </Form>
  );
}
