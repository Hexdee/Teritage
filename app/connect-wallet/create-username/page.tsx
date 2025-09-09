'use client';
import { CreateUsernameForm } from '@/components/forms/create-username-form';
import { CREATE_PIN_URL } from '@/config/path';
import { useRouter } from 'next/navigation';

export default function CreateUsername() {
  const router = useRouter();
  return <CreateUsernameForm handleNext={() => router.push(CREATE_PIN_URL)} />;
}
