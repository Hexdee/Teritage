'use client';
import Introduction from '@/components/beneficiary/introduction';
import { INHERITANCE_SETUP_URL } from '@/config/path';
import { useRouter } from 'next/navigation';

export default function IntroductionPage() {
  const router = useRouter();
  return <Introduction handleNext={() => router.push(INHERITANCE_SETUP_URL)} />;
}
