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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '../ui/separator';
import { useInheritancePlanStore } from '@/store/useInheritancePlanStore';
import { INextPage } from '@/type';

const formSchema = z.object({
  checkInIntervalSeconds: z.string().min(1, 'Please select a check-in period'),
  socialLinks: z
    .array(
      z.object({
        url: z.string().url('Please enter a valid URL'),
      })
    )
    .min(1, 'Add at least one social link'),
});

type FormValues = z.infer<typeof formSchema>;

export default function SetUpInheritanceForm({ handleNext }: INextPage) {
  const [openTooltip, setOpenTooltip] = React.useState<boolean>(false);
  const { checkInIntervalSeconds, socialLinks, setCheckInData } = useInheritancePlanStore();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      checkInIntervalSeconds: checkInIntervalSeconds ? String(checkInIntervalSeconds) : '',
      socialLinks: socialLinks.length ? socialLinks : [{ url: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'socialLinks',
  });

  function onSubmit(values: FormValues) {
    const intervalInSeconds = Number(values.checkInIntervalSeconds);
    const sanitizedLinks = values.socialLinks.map((link) => ({ url: link.url.trim() })).filter((link) => !!link.url);

    setCheckInData({
      checkInIntervalSeconds: intervalInSeconds,
      socialLinks: sanitizedLinks.length ? sanitizedLinks : [{ url: '' }],
    });

    handleNext();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="checkInIntervalSeconds"
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
                  <SelectItem value={String(60)}>Every minute (demo)</SelectItem>
                  <SelectItem value={String(24 * 60 * 60)}>Every day</SelectItem>
                  <SelectItem value={String(7 * 24 * 60 * 60)}>Every week</SelectItem>
                  <SelectItem value={String(30 * 24 * 60 * 60)}>Every month (approx.)</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  <Button type="button" variant="secondary" onClick={() => remove(index)} className="w-fit">
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
        <Button type="submit" className="w-full">
          Continue
        </Button>
      </form>
    </Form>
  );
}
