'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info, Plus, Trash } from 'lucide-react';
import { PreferredDaySelector } from './day-selector-form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import { BENEFICIARY_INFO_URL } from '@/config/path';
import { Separator } from '../ui/separator';

const daysOfWeek: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const formSchema = z
  .object({
    checkInPeriod: z.string().nonempty('Please select a check-in period'),
    socialLinks: z.array(
      z.object({
        url: z.string().url('Please enter a valid URL'),
      })
    ),
    dayOfWeek: z.string().optional(),
    preferredDay: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.checkInPeriod === 'weekly' && (!data.dayOfWeek || data.dayOfWeek.trim() === '')) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please select a day in a week',
        path: ['dayOfWeek'],
      });
    }
    if (data.checkInPeriod === 'monthly' && (!data.preferredDay || data.preferredDay.trim() === '')) {
      ctx.addIssue({
        code: 'custom',
        message: 'Please select a preferred in the month',
        path: ['preferredDay'],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

export default function SetUpInheritanceForm() {
  const [openTooltip, setOpenTooltip] = React.useState<boolean>(false);
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      checkInPeriod: '',
      socialLinks: [{ url: '' }],
      dayOfWeek: '',
      preferredDay: '',
    },
  });

  const watchCheckInPeriod = form.watch('checkInPeriod');

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'socialLinks',
  });

  function onSubmit(values: FormValues) {
    console.log(values);
    router.push(BENEFICIARY_INFO_URL);
  }

  console.log(form.getValues('preferredDay'));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="checkInPeriod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How often do you want to be checked-in?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select check-in period" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchCheckInPeriod === 'weekly' && (
          <FormField
            control={form.control}
            name="dayOfWeek"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Which day of the week?</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day of the week" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {daysOfWeek.map((day) => (
                      <SelectItem key={day} value={day}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {watchCheckInPeriod === 'monthly' && <PreferredDaySelector form={form} name="preferredDay" />}

        {/* Social Links */}
        <div>
          <div className="flex space-x-1 items-center">
            <FormLabel>Social Links</FormLabel>
            <Dialog open={openTooltip} onOpenChange={setOpenTooltip}>
              <DialogTrigger asChild>
                <button>
                  <Info size={12} className="text-muted-foreground" />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>How It Works</DialogTitle>
                  <Separator />
                  <DialogDescription>
                    Only public activity is detected as active. If you miss a check-in and show no social activity → inheritance process starts.
                  </DialogDescription>
                </DialogHeader>
                <Button onClick={() => setOpenTooltip(false)}>Got it!</Button>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-3 mt-2">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <FormField
                  control={form.control}
                  name={`socialLinks.${index}.url`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="https://" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {index > 0 && (
                  <Button type="button" variant="secondary" onClick={() => remove(index)}>
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button type="button" variant="secondary" onClick={() => append({ url: '' })} className="mt-3 w-fit flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Social Link
          </Button>
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
          Continue
        </Button>
      </form>
    </Form>
  );
}
