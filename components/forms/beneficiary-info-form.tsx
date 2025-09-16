'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Info } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';

const formSchema = z.object({
  first_name: z.string().min(2, { message: 'First name is required' }),
  last_name: z.string().min(2, { message: 'Last name is required' }),
  email: z.string().email({ message: 'A valid email is required' }),
  wallet_address: z.string().min(10, { message: 'A valid wallet address is required' }),
  notify_beneficiary: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function BeneficiaryInfoForm({ handleNext }: INextPage) {
  const [openEVMTooltip, setOpenEVMTooltip] = React.useState<boolean>(false);
  const [openNotify, setOpenNotify] = React.useState<boolean>(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      wallet_address: '',
      notify_beneficiary: false,
    },
  });

  function onSubmit(values: FormValues) {
    console.log(values);
    handleNext();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter first name" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="last_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter last name" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter email address" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="wallet_address"
          render={({ field }) => (
            <FormItem>
              <div className="flex space-x-1 items-center">
                <FormLabel>EVM Wallet Address</FormLabel>
                <Dialog open={openEVMTooltip} onOpenChange={setOpenEVMTooltip}>
                  <DialogTrigger asChild>
                    <button>
                      <Info size={12} className="text-muted-foreground" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                      <DialogTitle>EVM Wallet Address</DialogTitle>
                      <Separator />
                      <DialogDescription>
                        EVM stands for Ethereum Virtual Machine. Your EVM Wallet Address is a unique identifier (starting with ‘0x’) used to receive and send
                        tokens on Ethereum-compatible blockchains.
                      </DialogDescription>
                    </DialogHeader>
                    <Button onClick={() => setOpenEVMTooltip(false)}>Got it!</Button>
                  </DialogContent>
                </Dialog>
              </div>
              <FormControl>
                <Input placeholder="Enter wallet address" {...field} />
              </FormControl>

              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notify_beneficiary"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between">
              <div className="flex space-x-1 items-center">
                <FormLabel>Notify your beneficiary now?</FormLabel>
                <Dialog open={openNotify} onOpenChange={setOpenNotify}>
                  <DialogTrigger asChild>
                    <button>
                      <Info size={12} className="text-muted-foreground" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Notify Beneficiary</DialogTitle>
                      <Separator />
                      <DialogDescription>
                        This sends a notification your your beneficiary email and message informing them they have been added as a beneficiary.
                      </DialogDescription>
                    </DialogHeader>
                    <Button onClick={() => setOpenNotify(false)}>Got it!</Button>
                  </DialogContent>
                </Dialog>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
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
