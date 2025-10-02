'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter, useSearchParams } from 'next/navigation';
import { AUTH_SET_USERNAME } from '@/config/path';
import InputAdornment from '../ui/input-adornment';
import FormGroup from '../ui/form-group';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { userSetPassword } from '@/config/apis';
import { setCookie, getCookie } from 'cookies-next';
import ShowError from '../errors/display-error';

export const FormSchema = z
  .object({
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

export function SetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const router = useRouter();

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword((prev) => !prev);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: userSetPassword,
    onSuccess: async (response: any) => {
      await setCookie('teritage_token', response.token);
      router.push(AUTH_SET_USERNAME);
    },
    onError: (error: any) => setErrorMessage(error?.response?.data?.message || 'An error occured while processing'),
  });

  async function onSubmit(values: z.infer<typeof FormSchema>) {
    setErrorMessage(null);
    const verificationToken = (await getCookie('teritage_token')) || '';
    const data = { email, password: values.password, verificationToken };
    mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <ShowError error={errorMessage} setError={setErrorMessage} />
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
        <Button type="submit" className="w-full" isLoading={isPending} loadingText="Please wait...">
          Continue
        </Button>
        <p className="text-sm text-muted text-center">
          By using Teritage, you agree to the{' '}
          <span className="text-primary" role="button">
            Terms
          </span>{' '}
          and{' '}
          <span className="text-primary" role="button">
            Privacy Policy
          </span>
          .
        </p>
      </form>
    </Form>
  );
}
