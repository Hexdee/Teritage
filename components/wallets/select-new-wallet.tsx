'use client';

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { formatAddress } from '@/lib/utils';
import type { ISelectedWallet } from '@/type';

interface SelectNewWalletProps {
  handleNext: (wallet: ISelectedWallet) => void;
}

const DEFAULT_WALLET_META: ISelectedWallet = {
  name: 'Connected Wallet',
  logo: '/wallet-collection.png',
};

export default function SelectNewWallet({ handleNext }: SelectNewWalletProps) {
  const { isConnected, address, isConnecting } = useAccount();
  const { openConnectModal } = useConnectModal();

  useEffect(() => {
    if (isConnected && !isConnecting) {
      handleNext(DEFAULT_WALLET_META);
    }
  }, [handleNext, isConnected, isConnecting]);

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-6 text-center">
      <h2 className="text-xl font-semibold text-inverse">Choose a wallet provider</h2>
      <p className="text-muted max-w-md">
        RainbowKit supports popular wallets like MetaMask, Coinbase Wallet, Rainbow, and more. Connect one to continue setting up your Teritage plan.
      </p>

      <Button type="button" onClick={openConnectModal} className="w-full max-w-sm">
        {isConnected && address ? `Connected: ${formatAddress(address)}` : 'Select a wallet'}
      </Button>

      <p className="text-sm text-muted-foreground max-w-sm">
        Having trouble? Make sure your wallet is unlocked and that the browser extension or mobile app is open.
      </p>
    </div>
  );
}

interface ConfirmWalletSelectionProps {
  selectedWallet: ISelectedWallet | null;
  handleBack: () => void;
  handleNext: () => void;
}

export const ConfirmWalletSelection = ({ selectedWallet, handleBack, handleNext }: ConfirmWalletSelectionProps) => {
  const { address, chain } = useAccount();
  const effectiveWallet = selectedWallet ?? DEFAULT_WALLET_META;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold text-inverse">Confirm wallet</h2>
        <p className="text-muted">We will use this wallet address for Teritage smart contract interactions.</p>
      </div>

      <div className="border rounded-lg p-4 flex items-center justify-between">
        <div className="flex flex-col items-start">
          <Label className="text-muted text-xs">Wallet</Label>
          <span className="text-inverse font-medium">{effectiveWallet.name}</span>
          {chain?.name && <span className="text-muted text-xs mt-1">Network: {chain.name}</span>}
        </div>
        <span className="text-sm font-mono text-muted">{formatAddress(address || '')}</span>
      </div>

      <div className="flex space-x-3">
        <Button variant="secondary" className="w-1/2" onClick={handleBack}>
          Back
        </Button>
        <Button className="w-1/2" onClick={handleNext}>
          Continue
        </Button>
      </div>
    </div>
  );
};
