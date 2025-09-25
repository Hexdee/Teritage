'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { SUCCESS_URL } from '@/config/path';
import InputAdornment from '../ui/input-adornment';
import FormGroup from '../ui/form-group';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export const FormSchema = z
  .object({
    currentPassword: z.string().min(2, { message: 'Current password is required' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' })
      .regex(/[A-Z]/, { message: 'Password must include at least one uppercase letter' })
      .regex(/[a-z]/, { message: 'Password must include at least one lowercase letter' })
      .regex(/[0-9]/, { message: 'Password must include at least one number' })
      .regex(/[^A-Za-z0-9]/, { message: 'Password must include at least one special character' }),
    confirmPassword: z.string().min(1, { message: 'Confirm password is required' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'],
  });

export function ChangePasswordForm() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const router = useRouter();

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev);
  const toggleCurrentPasswordVisibility = () => setShowCurrentPassword((prev) => !prev);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      currentPassword: '',
      password: '',
      confirmPassword: '',
    },
  });

  function onSubmit(values: z.infer<typeof FormSchema>) {
    console.log(values);
    router.push(SUCCESS_URL);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-4">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <FormGroup>
                  <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect="off"
                    placeholder="Enter password"
                    {...field}
                  />
                  <InputAdornment
                    adornment={
                      showCurrentPassword ? (
                        <EyeOff size={20} strokeWidth={1} className="text-muted-foreground" />
                      ) : (
                        <Eye size={20} strokeWidth={1} className="text-muted-foreground" />
                      )
                    }
                    onClick={toggleCurrentPasswordVisibility}
                    position="end"
                  />
                </FormGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <FormGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect="off"
                    placeholder="Enter password"
                    {...field}
                  />
                  <InputAdornment
                    adornment={
                      showPassword ? (
                        <EyeOff size={20} strokeWidth={1} className="text-muted-foreground" />
                      ) : (
                        <Eye size={20} strokeWidth={1} className="text-muted-foreground" />
                      )
                    }
                    onClick={togglePasswordVisibility}
                    position="end"
                  />
                </FormGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <FormGroup>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect="off"
                    placeholder="Re-enter new password"
                    {...field}
                  />
                  <InputAdornment
                    adornment={
                      showConfirmPassword ? (
                        <EyeOff size={20} strokeWidth={1} className="text-muted-foreground" />
                      ) : (
                        <Eye size={20} strokeWidth={1} className="text-muted-foreground" />
                      )
                    }
                    onClick={toggleConfirmPasswordVisibility}
                    position="end"
                  />
                </FormGroup>
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
