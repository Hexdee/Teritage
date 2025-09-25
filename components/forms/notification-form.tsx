'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

const notificationSchema = z.object({
  allowNotifications: z.boolean().catch(false),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

export default function NotificationForm() {
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      allowNotifications: false,
    },
  });

  const onSubmit = (data: NotificationFormValues) => {
    console.log('Submitted:', data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="h-[30vh]">
          <FormField
            control={form.control}
            name="allowNotifications"
            render={({ field }) => (
              <FormItem className="flex items-center justify-between">
                <div className="space-y-4 w-full">
                  <p className="text-sm text-muted-foreground">Get notified about check-in(s), app updates and more.</p>
                  <div className="flex justify-between w-full">
                    <FormLabel className="text-base">Allow Notifications</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </div>
                </div>
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" className="w-fit" size="sm">
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
