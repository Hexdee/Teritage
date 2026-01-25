'use client';
import { CreateUsernameForm } from '@/components/forms/create-username-form';
import { userSetUsername } from '@/config/apis';
import { SUCCESS_URL } from '@/config/path';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { getApiErrorMessage } from '@/lib/api-error';

export default function CreateUsername() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: userSetUsername,
    onSuccess: () => {
      toast.success('Username created successfully');
      router.push(SUCCESS_URL);
    },
    onError: (error: any) => setErrorMessage(getApiErrorMessage(error, 'An error occured while processing')),
  });

  const handleSubmit = (data: { username: string }) => {
    mutate(data);
  };

  return <CreateUsernameForm handleNext={(data) => handleSubmit(data)} errorMessage={errorMessage} setErrorMessage={setErrorMessage} isLoading={isPending} />;
}
