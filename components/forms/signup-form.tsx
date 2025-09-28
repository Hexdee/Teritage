'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { VERIFY_URL } from '@/config/path';
import { useMutation } from '@tanstack/react-query';
import { userSignUp } from '@/config/apis';
import { toast } from 'sonner';
import ShowError from '../errors/display-error';
import { useState } from 'react';

const FormSchema = z.object({
  email: z.string().email({
    message: 'Valid email is required',
  }),
});

export function SignUpForm() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: userSignUp,
    onSuccess: (response) => {
      toast.success(response.message);
      router.push(`${VERIFY_URL}?email=${form.getValues('email')}`);
    },
    onError: (error: any) => setErrorMessage(error?.response?.data?.message || 'An error occured while processing'),
  });

  function onSubmit(values: z.infer<typeof FormSchema>) {
    setErrorMessage(null);
    mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ShowError error={errorMessage} setError={setErrorMessage} />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <div>
                <FormLabel className="text-lg">Email Address</FormLabel>
                <FormDescription>Enter your email to sign up or log in to continue.</FormDescription>
              </div>
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
  );
}
