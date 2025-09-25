'use client';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const FormSchema = z.object({
  pin: z.string().min(4, {
    message: 'Your one-time password must be 4 characters.',
  }),
});

const FormSchema2 = z.object({
  newPin: z.string().min(4, {
    message: 'Your one-time password must be 4 characters.',
  }),
  confirmPin: z.string().min(4, {
    message: 'Your one-time password must be 4 characters.',
  }),
});

interface IChangePinForm {
  setShowStage2: (arg: boolean) => void;
  setCount: (arg: number) => void;
}

export function ChangePinForm({ setShowStage2, setCount }: IChangePinForm) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: '',
    },
  });

  function onSubmit(values: z.infer<typeof FormSchema>) {
    console.log(values);
    setCount(1);
    setShowStage2(true);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <div>
                <FormLabel className="text-lg">Teritage PIN</FormLabel>
                <FormDescription>Enter your 4-digit PIN to complete process.</FormDescription>
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
  );
}

export function ChangePinForm2() {
  const form = useForm<z.infer<typeof FormSchema2>>({
    resolver: zodResolver(FormSchema2),
    defaultValues: {
      newPin: '',
      confirmPin: '',
    },
  });

  function onSubmit(values: z.infer<typeof FormSchema2>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="newPin"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-lg">New PIN</FormLabel>

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

        <FormField
          control={form.control}
          name="confirmPin"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel className="text-lg">Confirm PIN</FormLabel>

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
  );
}
