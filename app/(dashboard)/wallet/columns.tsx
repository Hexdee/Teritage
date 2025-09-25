/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { ReactNode } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import CurrencyText from '@/components/ui/currency-text';
import { ArrowUp } from 'lucide-react';

const columns: {
  accessorKey: string;
  header: string;
  key: string;
  cell?: (arg: any) => ReactNode;
}[] = [
  {
    accessorKey: 'coin',
    header: 'Coin',
    key: 'coin',
    cell: ({ row }) => <CoinCell data={row.original} />,
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    key: 'amount',
  },
  {
    accessorKey: 'available',
    header: 'Available',
    key: 'available',
  },
  {
    accessorKey: 'period',
    header: '24H Change',
    key: 'period',
    cell: ({ row }) => <p className={cn(row.original.increment ? 'text-success' : 'text-destructive')}>{row.original.period}</p>,
  },
  {
    accessorKey: 'action',
    header: '',
    key: 'action',
    cell: () => <ActionCell />,
  },
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
    coin: {
      logo: string;
      title: string;
      symbol: string;
    };
  };
}

export const CoinCell = ({ data }: IData) => {
  return (
    <div className="space-x-2 flex items-center">
      <Image src={data.coin.logo} width={32} height={32} alt={data.coin.title} />
      <div className="space-y-1">
        <p className="text-inverse">{data.coin.title}</p>
        <p className="text-muted-foreground">{data.coin.symbol}</p>
      </div>
    </div>
  );
};
