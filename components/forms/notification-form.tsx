'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getUserProfileApi, updateUserProfileApi } from '@/config/apis';

const notificationSchema = z.object({
  allowNotifications: z.boolean().catch(false),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

export default function NotificationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      allowNotifications: false,
    },
  });

  useEffect(() => {
    let isMounted = true;

    getUserProfileApi()
      .then((response) => {
        if (!isMounted) return;
        form.reset({ allowNotifications: response.user.allowNotifications });
      })
      .catch(() => {
        toast.error('Failed to load notification preferences');
      });

    return () => {
      isMounted = false;
    };
  }, [form]);

  const onSubmit = async (data: NotificationFormValues) => {
    try {
      setIsSubmitting(true);
      await updateUserProfileApi({ allowNotifications: data.allowNotifications });
      toast.success('Notification preferences updated');
    } catch (error) {
      const message =
        (error as any)?.response?.data?.message ??
        (error instanceof Error ? error.message : 'Failed to update notification preferences');
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
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
          <Button type="submit" className="w-fit" size="sm" disabled={isSubmitting}>
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
