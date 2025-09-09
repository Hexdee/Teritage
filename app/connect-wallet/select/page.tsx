'use client';
import SelectNewWallet, { ConfirmWalletSelection } from '@/components/wallets/select-new-wallet';
import { CREATE_USERNAME_URL } from '@/config/path';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SelectWallet() {
  const router = useRouter();
  const [selectedWallet, setSelectedWallet] = useState<ISelectedWallet | null>(null);

  return (
    <div>
      <ConfirmWalletSelection selectedWallet={selectedWallet} handleBack={() => setSelectedWallet(null)} handleNext={() => router.push(CREATE_USERNAME_URL)} />
      <SelectNewWallet type="new" handleNext={(wallet) => setSelectedWallet(wallet)} />;
    </div>
  );
}
