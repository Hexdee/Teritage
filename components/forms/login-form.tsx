'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { SIGN_UP_URL, WALLET_URL } from '@/config/path';
import { useMutation } from '@tanstack/react-query';
import { userLogin } from '@/config/apis';
import { toast } from 'sonner';
import ShowError from '../errors/display-error';
import { useState } from 'react';
import FormGroup from '../ui/form-group';
import InputAdornment from '../ui/input-adornment';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { setCookie } from 'cookies-next';

const FormSchema = z.object({
  email: z.string().email({
    message: 'Valid email is required',
  }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: userLogin,
    onSuccess: async (response: any) => {
      console.log(response);
      await setCookie('teritage_token', response.token);
      toast.success('Login successfully');
      router.push(WALLET_URL);
    },
    onError: (error: any) => setErrorMessage(error?.response?.data?.message || 'An error occured while processing'),
  });

  function onSubmit(values: z.infer<typeof FormSchema>) {
    setErrorMessage(null);
    mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h2 className="text-2xl font-medium">Log In</h2>
          <p className="text-sm">Enter your email and password to log in to continue.</p>
        </div>

        <ShowError error={errorMessage} setError={setErrorMessage} />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl className="">
                <Input type="email" placeholder="Email address" {...field} />
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
        <Button type="submit" className="w-full" loadingText="Please wait..." isLoading={isPending}>
          Continue
        </Button>
        <p className="text-sm text-muted text-center">
          Don&apos;t have account ?{' '}
          <Link href={SIGN_UP_URL}>
            <span className="text-primary" role="button">
              Create here
            </span>
          </Link>
        </p>
      </form>
    </Form>
  );
}
