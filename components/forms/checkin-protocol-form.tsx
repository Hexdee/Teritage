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

const formSchema = z.object({
  interval: z.string().min(2, { message: 'Interval is required' }),
  socialLinks: z
    .array(
      z.object({
        url: z.string().url('Enter a valid URL').min(1, 'Social link is required'),
      })
    )
    .min(1, 'At least one social link is required'),
});

type FormValues = z.infer<typeof formSchema>;

export default function CheckInProtocolForm() {
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

  function onSubmit(values: FormValues) {
    console.log(values);
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your check-in interval" />
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
          <Button type="submit" className="w-fit" size="sm">
            Save changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
