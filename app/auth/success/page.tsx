'use client';
import Image from 'next/image';
import { CustomConnectButton } from '@/components/ui/connect-button';
import { useAccount } from 'wagmi';
import React, { useEffect, useState } from 'react';
import { ActionLoading } from '@/components/ui/loading';
import WalletSuccess from '@/components/wallets/wallet-success';
import { INHERITANCE_INTRO_URL } from '@/config/path';

export default function SuccessPage() {
  const [isClient, setIsClient] = useState<boolean>(false);
  const { isConnected } = useAccount();

  useEffect(() => {
    setIsClient(true);
  }, [isConnected]);

  if (!isClient) {
    return <ActionLoading />;
  }

  return (
    <React.Fragment>
      {isClient && (
        <>
          {isConnected ? (
            <WalletSuccess handleNext={() => console.log(INHERITANCE_INTRO_URL)} />
          ) : (
            <div className="text-muted text-center space-y-4">
              <Image src="/success.png" alt="success" width={600} height={400} className="-mt-24" />
              <h1>Account Set Up Successfully</h1>

              <CustomConnectButton />
            </div>
          )}
        </>
      )}
    </React.Fragment>
  );
}
