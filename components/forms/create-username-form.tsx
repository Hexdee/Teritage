'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ICreateUsernameForm } from '@/type';
import ShowError from '../errors/display-error';

const FormSchema = z.object({
  username: z.string().min(2, {
    message: 'Username is required',
  }),
});

export function CreateUsernameForm({
  handleNext,
  errorMessage = null,
  setErrorMessage,
  isLoading = false,
}: ICreateUsernameForm) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: '',
    },
  });

  function onSubmit(values: z.infer<typeof FormSchema>) {
    handleNext(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <ShowError error={errorMessage ?? null} setError={setErrorMessage} />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <div>
                <FormLabel className="text-lg">Create a unique username</FormLabel>
                <FormDescription>You can use your name or nickname.</FormDescription>
              </div>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" loadingText="Please wait..." isLoading={isLoading}>
          Continue
        </Button>
      </form>
    </Form>
  );
}
