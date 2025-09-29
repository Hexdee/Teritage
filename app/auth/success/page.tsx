'use client';
import Image from 'next/image';
import { CustomConnectButton } from '@/components/ui/connect-button';
import { useAccount } from 'wagmi';
import React, { useEffect, useMemo, useState } from 'react';
import { ActionLoading } from '@/components/ui/loading';
import WalletSuccess from '@/components/wallets/wallet-success';
import { INHERITANCE_INTRO_URL } from '@/config/path';
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
  const [isClient, setIsClient] = useState<boolean>(false);
  const router = useRouter();
  const { isConnected, isConnecting } = useAccount();

  useEffect(() => {
    setIsClient(true);
  }, [isConnected]);

  const handleContinue = useMemo(
    () => () => router.push(INHERITANCE_INTRO_URL),
    [router]
  );

  useEffect(() => {
    if (isConnected && !isConnecting) {
      // Automatically move the user forward once the wallet is connected.
      const redirectTimeout = setTimeout(() => {
        handleContinue();
      }, 1500);
      return () => clearTimeout(redirectTimeout);
    }
  }, [handleContinue, isConnected, isConnecting]);

  return (
    <React.Fragment>
      {isClient ? (
        <>
          {isConnected ? (
            <WalletSuccess handleNext={handleContinue} />
          ) : (
            <div className='text-muted text-center space-y-4'>
              <Image
                src='/success.png'
                alt='success'
                width={600}
                height={400}
                className='-mt-24'
              />
              <h1>Account Set Up Successfully</h1>

              <CustomConnectButton />
            </div>
          )}
        </>
      ) : (
        <ActionLoading />
      )}
    </React.Fragment>
  );
}
