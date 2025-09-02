'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { VERIFY_URL } from '@/config/path';

const FormSchema = z.object({
  email: z.string().email({
    message: 'Valid email is required',
  }),
});

export function SignUpForm() {
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
    },
  });

  function onSubmit(values: z.infer<typeof FormSchema>) {
    console.log(values);
    router.push(VERIFY_URL);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <div>
                <FormLabel className="text-lg">Email Address</FormLabel>
                <FormDescription>Enter your email to sign up or log in to continue.</FormDescription>
              </div>
              <FormControl className="mt-2">
                <Input type="email" placeholder="Email address" {...field} />
              </FormControl>
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
  );
}
