'use client';

import * as React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '../ui/input';
import { Trash } from 'lucide-react';
import { getTeritagePlanApi } from '@/config/apis';
import { toast } from 'sonner';
import { useTeritageContract } from '@/lib/blockchain/useTeritageContract';

const formSchema = z.object({
  interval: z.string().min(1, { message: 'Interval is required' }),
  socialLinks: z
    .array(
      z.object({
        url: z.string().url('Enter a valid URL').min(1, 'Social link is required'),
      })
    )
    .min(1, 'At least one social link is required'),
});

type FormValues = z.infer<typeof formSchema>;

const DEFAULT_OPTIONS = [
  { value: String(24 * 60 * 60), label: 'Every day' },
  { value: String(7 * 24 * 60 * 60), label: 'Every week' },
  { value: String(30 * 24 * 60 * 60), label: 'Every month (approx.)' },
];

export default function CheckInProtocolForm() {
  const [intervalOptions, setIntervalOptions] = React.useState(DEFAULT_OPTIONS);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { updateCheckInInterval } = useTeritageContract();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      interval: '',
      socialLinks: [{ url: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'socialLinks',
  });

  React.useEffect(() => {
    let isMounted = true;

    getTeritagePlanApi()
      .then((response) => {
        if (!isMounted) return;
        const { plan } = response as any;
        if (!plan) return;

        const intervalValue = String(plan.checkInIntervalSeconds ?? 24 * 60 * 60);
        if (!DEFAULT_OPTIONS.some((option) => option.value === intervalValue)) {
          setIntervalOptions((options) => [
            ...options,
            { value: intervalValue, label: `Custom (${plan.checkInIntervalSeconds} seconds)` },
          ]);
        }

        const socialLinks = Array.isArray(plan.socialLinks) && plan.socialLinks.length
          ? plan.socialLinks.map((url: string) => ({ url }))
          : [{ url: '' }];

        form.reset({
          interval: intervalValue,
          socialLinks,
        });
      })
      .catch(() => {
        toast.error('Failed to load current check-in preferences');
      });

    return () => {
      isMounted = false;
    };
  }, [form]);

  async function onSubmit(values: FormValues) {
    try {
      setIsSubmitting(true);
      const sanitizedLinks = values.socialLinks.map((link) => link.url.trim()).filter((url) => url.length > 0);

      const intervalSeconds = Number(values.interval);

      await updateCheckInInterval({
        newIntervalSeconds: intervalSeconds,
        backendPayload: {
          checkInIntervalSeconds: intervalSeconds,
          socialLinks: sanitizedLinks,
        },
      });

      toast.success('Check-in protocol updated');
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message ??
        (error instanceof Error ? error.message : 'Failed to update check-in protocol');
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
          name="interval"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How often do you want to be checked-in?</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your check-in interval" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {intervalOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />

        {fields.map((field, index) => (
          <FormField
            key={field.id}
            control={form.control}
            name={`socialLinks.${index}.url`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Social Link {index + 1}</FormLabel>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <Input placeholder="https://linkedin.com/in/username" {...field} />
                  </FormControl>

                  {fields.length > 1 && (
                    <Button type="button" variant="destructive" size="sm" onClick={() => remove(index)}>
                      <Trash size="sm" />
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button type="button" variant="outline" className="w-fit text-muted-foreground font-normal" size="sm" onClick={() => append({ url: '' })}>
          + Add Social Link
        </Button>

        <div className="flex justify-end">
          <Button type="submit" className="w-fit" size="sm" disabled={isSubmitting}>
            Save changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
