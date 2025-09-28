/* eslint-disable @next/next/no-img-element */
'use client';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { INextPage } from '@/type';
import { useAccount } from 'wagmi';
import { formatAddress } from '@/lib/utils';

export default function WalletSuccess({ handleNext }: INextPage) {
  const { chain, address, addresses } = useAccount();

  return (
    <div className="space-y-4">
      <div className="text-muted text-center space-y-4 max-h-[400px]">
        <Image src="/success.png" alt="success" width={600} height={400} className="-mt-24" />
        <h1>Wallet Connected Successfully</h1>
      </div>

      <Label className="text-inverse">Information</Label>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <p className="text-inverse">Wallet</p>
        <div className="flex space-x-2 justify-end">
          <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${address}`} alt="logo" className="rounded-full h-4 w-4" />
          <p className="text-muted">{chain?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <p className="text-inverse">Address</p>
        <div className="flex space-x-2 justify-end">
          <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${address}`} alt="logo" className="rounded-full h-4 w-4" />
          <p className="text-muted">{formatAddress(address || '')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <p className="text-inverse">Tokens</p>
        <div className="flex space-x-2 justify-end">
          {addresses?.map((address) => (
            <img key={address} src={`https://api.dicebear.com/7.x/identicon/svg?seed=${address}`} alt="logo" className="rounded-full h-4 w-4" />
          ))}
        </div>
      </div>

      <Button className="w-full" onClick={handleNext}>
        Continue
      </Button>
    </div>
  );
}
