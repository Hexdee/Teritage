/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ReactNode, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { EllipsisVertical } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AllocationBreakdown from '@/components/beneficiary/allocation-breakdown';
import ManageAllocation from '@/components/beneficiary/manage-allocation';
import { ArrowLeft } from '@/components/icons';
import { useApplications } from '@/context/dashboard-provider';

export type BeneficiaryRow = {
  name: string;
  wallet_address: string;
  full_wallet_address: string;
  sharePercentage: number;
  notifyBeneficiary?: boolean;
  email?: string;
  phone?: string;
};

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
    accessorKey: 'sharePercentage',
    header: 'Assigned Allocation',
    key: 'sharePercentage',
    cell: ({ row }) => <p>{row.original.sharePercentage}%</p>,
  },
  {
    accessorKey: 'action',
    header: '',
    key: 'action',
    cell: ({ row }) => <ActionCell data={row.original} />,
  },
];

export { columns };

interface ActionCellProps {
  data: BeneficiaryRow;
}

export const ActionCell = ({ data }: ActionCellProps) => {
  const [currentStage, setCurrentStage] = useState(1);
  const { walletsData } = useApplications();

  const totalValue = walletsData?.summary?.totalPortfolioValueUsd ?? 0;
  const assignedPercentage = data.sharePercentage;
  const allocatedValue = Number(((totalValue * assignedPercentage) / 100).toFixed(2));
  const unallocatedPercentage = 100 - assignedPercentage;
  const unallocatedValue = Number(((totalValue * unallocatedPercentage) / 100).toFixed(2));

  const EachTitle: Record<number, string> = {
    1: 'Allocation Breakdown',
    2: 'Manage Allocation',
  };

  const EachStage: Record<number, ReactNode> = {
    1: (
      <AllocationBreakdown
        handleNext={() => setCurrentStage(2)}
        beneficiary={data}
        allocatedValue={allocatedValue}
        unallocatedValue={unallocatedValue}
        assignedPercentage={assignedPercentage}
        unallocatedPercentage={unallocatedPercentage}
      />
    ),
    2: <ManageAllocation beneficiary={data} totalValue={totalValue} />,
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

export const NameCell = ({ data }: { data: BeneficiaryRow }) => {
  return (
    <div className="space-x-2 flex items-center">
      <Avatar>
        <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${data.full_wallet_address}`} />
        <AvatarFallback>{data.name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>

      <p className="text-inverse">{data.name}</p>
    </div>
  );
};
