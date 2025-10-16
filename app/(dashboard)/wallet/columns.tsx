/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ReactNode } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import CurrencyText from '@/components/ui/currency-text';
import { ArrowUp } from 'lucide-react';
import { useAccount } from 'wagmi';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);

const columns: {
  accessorKey: string;
  header: string;
  key: string;
  cell?: (arg: any) => ReactNode;
}[] = [
  {
    accessorKey: 'name',
    header: 'Coin',
    key: 'name',
    cell: ({ row }) => <CoinCell data={row.original} />,
  },
  {
    accessorKey: 'priceUsd',
    header: 'Amount',
    key: 'priceUsd',
    cell: ({ row }) => <p>{formatCurrency(row.original.priceUsd)}</p>,
  },
  {
    accessorKey: 'balance',
    header: 'Available',
    key: 'balance',
    cell: ({ row }) => <p>{row.original.balance + ' ' + row.original.symbol}</p>,
  },
  {
    accessorKey: 'change24hPercent',
    header: '24H Change',
    key: 'change24hPercent',
    cell: ({ row }) => {
      const change = Number(row.original.change24hPercent ?? 0);
      const isPositive = change >= 0;
      return <p className={cn(isPositive ? 'text-success' : 'text-destructive')}>{change.toFixed(2)}%</p>;
    },
  },
  // {
  //   accessorKey: 'action',
  //   header: '',
  //   key: 'action',
  //   cell: () => <ActionCell />,
  // },
];

export { columns };

export const ActionCell = () => {
  return (
    <div className="flex justify-end">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="sm" className="w-fit py-1 px-2.5 h-8 text-sm font-normal" variant="secondary">
            View
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Tokens</SheetTitle>
            <Separator />
          </SheetHeader>

          <div className="space-y-4 p-4 -mt-4">
            <div className="flex space-x-2 items-center">
              <Image src="/ethereum-logo.png" alt="ethereum" width={40} height={40} />
              <h1 className="font-medium text-xl text-inverse">Ethereum</h1>
            </div>

            <div className="flex items-center justify-between w-full">
              <CurrencyText amount={2345.58} />
              <div className="flex space-x-1 text-success items-center">
                <ArrowUp size={16} />
                <p>$2.58 • 1.48%</p>
              </div>
            </div>

            <Separator />
            <div className="space-y-2">
              <p className="text-muted-foreground">Your Balance</p>
              <div className="flex justify-between items-center">
                <div className="flex space-x-2 items-center">
                  <Image src="/ethereum-logo.png" alt="ethereum" width={40} height={40} />
                  <div>
                    <h1 className="font-medium text-xl text-inverse">Ethereum</h1>
                    <p className="text-muted-foreground">0.2ETH</p>
                  </div>
                </div>
                <div className="flex space-x-1 text-success items-center">
                  <p className="text-inverse">$142.00</p>
                  <p className="text-success">+7.56%</p>
                </div>
              </div>
            </div>
            <Separator />

            <div>
              <p className="text-whte">About</p>
              <p className="text-muted-foreground">
                Ethereum (ETH) – A decentralized blockchain platform that enables smart contracts, decentralized applications (dApps), and secure digital
                transactions. Homepage Formerly Twitter
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

interface IData {
  data: {
    name: string;
    symbol: string;
  };
}

export const CoinCell = ({ data }: IData) => {
  const { address } = useAccount();
  const seed = address ?? data.symbol ?? data.name;
  return (
    <div className="space-x-2 flex items-center">
      <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${seed}`} alt="logo" className="rounded-full h-4 w-4" />
      <div className="space-y-1">
        <p className="text-inverse">{data.name}</p>
        <p className="text-muted-foreground">{data.symbol}</p>
      </div>
    </div>
  );
};
