'use client';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useState } from 'react';
import { verifyPinApi, changePinApi, createPinApi } from '@/config/apis';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/api-error';

const FormSchema = z.object({
  pin: z.string().regex(/^[0-9]{4}$/, {
    message: 'Your one-time password must be 4 characters.',
  }),
});

const FormSchema2 = z
  .object({
    newPin: z.string().regex(/^[0-9]{4}$/, { message: 'PIN must be a 4-digit code.' }),
    confirmPin: z.string().regex(/^[0-9]{4}$/, { message: 'PIN must be a 4-digit code.' }),
  })
  .refine((data) => data.newPin === data.confirmPin, {
    message: 'PIN entries must match',
    path: ['confirmPin'],
  });

interface IChangePinForm {
  setShowStage2: (arg: boolean) => void;
  setCount: (arg: number) => void;
  onVerified: (pin: string, hasExistingPin: boolean) => void;
}

export function ChangePinForm({ setShowStage2, setCount, onVerified }: IChangePinForm) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: '',
    },
  });

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    try {
      setIsSubmitting(true);
      const response = await verifyPinApi({ pin: values.pin });
      if (!response.valid) {
        form.setError('pin', { message: 'Invalid PIN' });
        toast.error('Invalid PIN');
        return;
      }
      toast.success('PIN verified');
      onVerified(values.pin, response.hasPin);
      setCount(1);
      setShowStage2(true);
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to verify PIN');
      form.setError('pin', { message });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
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
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          Continue
        </Button>
      </form>
    </Form>
  );
}

interface ChangePinForm2Props {
  currentPin: string | null;
  hasExistingPin: boolean;
  onCompleted: () => void;
}

export function ChangePinForm2({ currentPin, hasExistingPin, onCompleted }: ChangePinForm2Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<z.infer<typeof FormSchema2>>({
    resolver: zodResolver(FormSchema2),
    defaultValues: {
      newPin: '',
      confirmPin: '',
    },
  });

  async function onSubmit(values: z.infer<typeof FormSchema2>) {
    try {
      setIsSubmitting(true);
      if (hasExistingPin) {
        if (!currentPin) {
          throw new Error('Current PIN is required to update existing PIN');
        }
        await changePinApi({ currentPin, newPin: values.newPin });
        toast.success('PIN updated successfully');
      } else {
        await createPinApi({ pin: values.newPin });
        toast.success('PIN created successfully');
      }
      form.reset();
      onCompleted();
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to update PIN');
      form.setError('newPin', { message });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
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

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          Continue
        </Button>
      </form>
    </Form>
  );
}
