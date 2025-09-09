/* eslint-disable @typescript-eslint/no-unused-expressions */
'use client';
import { Label } from '@/components/ui/label';
import SearchInput from '@/components/ui/search-input';
import { ChevronRight, Link2 } from 'lucide-react';
import Image from 'next/image';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const wallets = [
  {
    logo: '/wallet-2.png',
    name: 'Coinbase',
  },
  {
    logo: '/wallet-1.png',
    name: 'Binance',
  },
  {
    logo: '/wallet-3.png',
    name: 'Solflare',
  },
  {
    logo: '/wallet-4.png',
    name: 'Rainbow',
  },
];

export default function SelectNewWallet({ handleNext }: ISelectNewWallet) {
  return (
    <div className="space-y-4">
      <>
        <SearchInput />

        <div className="space-y-4">
          {wallets.map((wallet) => (
            <div
              className="text-white text-base flex justify-between items-center cursor-pointer space-y-2.5"
              key={wallet.name}
              role="list"
              onClick={() => handleNext(wallet)}
            >
              <div className="flex items-center space-x-2">
                <Image src={wallet.logo} alt={wallet.name} width={32} height={32} />
                <p>{wallet.name}</p>
              </div>
              <ChevronRight size={18} />
            </div>
          ))}
        </div>
      </>
    </div>
  );
}

interface IConfirmWalletSelection {
  selectedWallet: ISelectedWallet | null;
  handleBack: () => void;
  handleNext: () => void;
}

export const ConfirmWalletSelection = ({ selectedWallet, handleBack, handleNext }: IConfirmWalletSelection) => {
  return (
    <div className="text-white flex text-center flex-col justify-center space-y-4">
      <div className="flex space-x-2 mx-auto">
        <Image src={selectedWallet?.logo || ''} alt={selectedWallet?.name || ''} width={28} height={28} />
        <Link2 size={28} />
        <Image src="/logo.png" alt="Teritage logo" width={28} height={28} />
      </div>
      <h2 className="font-medium">Connecting your Wallet</h2>
      <Label className="text-muted-foreground">Wallets</Label>

      <div className="justify-between flex items-center">
        <div className="flex space-x-2">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
          </Avatar>
          <p className="text-muted">0x3A9...F6D1</p>
        </div>
        <Image src="/wallet-collection.png" alt="wallet collections" width={44} height={20} />
      </div>

      <div className="w-full flex space-x-2 items-center">
        <Button variant="secondary" className="w-1/2" onClick={() => handleBack()}>
          Cancel
        </Button>

        <Button className="w-1/2" onClick={handleNext}>
          Confirm
        </Button>
      </div>

      <div className="text-muted font-light text-sm bg-card-2 p-4 rounded-bl-4xl rounded-br-4xl">
        <p>🔒 We do not store your keys or access your funds.</p>
      </div>
    </div>
  );
};
