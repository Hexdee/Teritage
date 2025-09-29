'use client';

import { CustomConnectButton } from '@/components/ui/connect-button';
import { SUCCESS_CREATE_PIN_URL } from '@/config/path';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';

export default function SelectWallet() {
  const router = useRouter();
  const { isConnected, isConnecting } = useAccount();

  useEffect(() => {
    if (isConnected && !isConnecting) {
      router.replace(SUCCESS_CREATE_PIN_URL);
    }
  }, [isConnected, isConnecting, router]);

  return (
    <div className='flex flex-col items-center justify-center space-y-6 text-center'>
      <h1 className='text-2xl font-semibold text-inverse'>
        Connect Your Wallet
      </h1>
      <p className='text-muted max-w-md'>
        Link the wallet that will manage your Teritage inheritance plan. You can
        add additional wallets later from your dashboard.
      </p>

      <CustomConnectButton />
    </div>
  );
}
