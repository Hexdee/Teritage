'use client';
import WalletSuccess from '@/components/wallets/wallet-success';
import { INHERITANCE_INTRO_URL } from '@/config/path';
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
  const router = useRouter();
  return <WalletSuccess handleNext={() => router.push(INHERITANCE_INTRO_URL)} />;
}
