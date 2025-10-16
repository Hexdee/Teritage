/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ReactNode, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import CurrencyText from '@/components/ui/currency-text';
import { ArrowUp, EllipsisVertical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AllocationBreakdown from '@/components/beneficiary/allocation-breakdown';
import ManageAllocation from '@/components/beneficiary/manage-allocation';
import { ArrowLeft } from '@/components/icons';

const columns: {
  accessorKey: string;
  header: string;
  key: string;
  cell?: (arg: any) => ReactNode;
}[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    key: 'name',
    cell: ({ row }) => <NameCell data={row.original} />,
  },
  {
    accessorKey: 'wallet_address',
    header: 'Wallet Address',
    key: 'wallet_address',
  },
  {
    accessorKey: 'assigned_allocation',
    header: 'Assigned Allocation',
    key: 'assigned_allocation',
  },
  {
    accessorKey: 'action',
    header: '',
    key: 'action',
    cell: ({ row }) => <ActionCell beneficiary={row.original} />,
  },
];

export { columns };

export const ActionCell = ({ beneficiary }: any) => {
  const [currentStage, setCurrentStage] = useState(1);

  const EachTitle: Record<number, string> = {
    1: 'Allocation Breakdown',
    2: 'Manage Allocation',
  };

  const EachStage: Record<number, ReactNode> = {
    1: <AllocationBreakdown handleNext={() => setCurrentStage(2)} />,
    2: <ManageAllocation beneficiary={beneficiary} totalValue={20} />,
  };

  return (
    <div className="flex justify-end">
      <Sheet>
        <SheetTrigger asChild>
          <EllipsisVertical size={20} className="text-muted" />
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <div className="flex space-x-2 items-center">
              {currentStage > 1 && (
                <ArrowLeft role="navigation" className="cursor-pointer" aria-label="navigate backward" onClick={() => setCurrentStage(currentStage - 1)} />
              )}
              <SheetTitle>{EachTitle[currentStage]}</SheetTitle>
            </div>
            <Separator />
          </SheetHeader>

          <div className="p-4">{EachStage[currentStage]}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

interface IData {
  data: {
    name: string;
  };
}

export const NameCell = ({ data }: IData) => {
  return (
    <div className="space-x-2 flex items-center">
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>

      <p className="text-inverse">{data.name}</p>
    </div>
  );
};
