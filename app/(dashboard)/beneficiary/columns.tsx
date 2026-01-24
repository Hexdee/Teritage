'use client';

import { ReactNode, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Separator } from '@/components/ui/separator';
import { Eye } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import AllocationBreakdown from '@/components/beneficiary/allocation-breakdown';
import ManageAllocation from '@/components/beneficiary/manage-allocation';
import { ArrowLeft } from '@/components/icons';
import { useApplications } from '@/context/dashboard-provider';
import BeneficiaryInfoForm from '@/components/forms/beneficiary-info-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTeritagePlanApi } from '@/config/apis';
import { TERITAGES_KEY } from '@/config/key';
import { toast } from 'sonner';
import { UpdateTeritagePlanRequest } from '@/type';
import { BeneficiaryEntry } from '@/store/useInheritancePlanStore';
import { getAddress, zeroAddress } from 'viem';
import { Button } from '@/components/ui/button';
import { hashSecretAnswer } from '@/lib/secret';

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
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [currentStage, setCurrentStage] = useState(1);
  const { walletsData, teritageData } = useApplications();
  const queryClient: any = useQueryClient();
  const totalValue = walletsData?.summary?.totalPortfolioValueUsd ?? 0;
  const assignedPercentage = data.sharePercentage;
  const allocatedValue = Number(((totalValue * assignedPercentage) / 100).toFixed(2));
  const unallocatedPercentage = 100 - assignedPercentage;
  const unallocatedValue = Number(((totalValue * unallocatedPercentage) / 100).toFixed(2));

  const { mutate, isPending } = useMutation({
    mutationFn: updateTeritagePlanApi,
    onSuccess: () => {
      queryClient.invalidateQueries(TERITAGES_KEY);
      toast.success('Plan updated successfully');
      setCurrentStage(1);
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'An error occured while processing'),
  });

  const handleMutatePlan = (values: BeneficiaryEntry[]) => {
    const inheritors = teritageData?.plan.inheritors
      .map((item) => {
        const match = values.find((update) => update.email === item.email);
        return match ? { ...item, ...match } : item;
      })
      .map((each: any) => ({ ...each, walletAddress: each.address, name: each.firstName ? `${each.firstName} ${each.lastName}` : each.name }));

    const payload: UpdateTeritagePlanRequest = {
      inheritors: inheritors?.map((beneficiary) => ({
        address: beneficiary.walletAddress ? getAddress(beneficiary.walletAddress) : zeroAddress,
        sharePercentage: Math.round(beneficiary.sharePercentage),
        name: beneficiary.name,
        email: beneficiary.email.trim(),
        secretQuestion: beneficiary.secretQuestion?.trim(),
        secretAnswerHash: beneficiary.secretAnswer ? hashSecretAnswer(beneficiary.secretAnswer) : undefined,
        shareSecretQuestion: beneficiary.shareSecretQuestion ?? false,
      })),
      tokens: teritageData?.plan.tokens as any,
      checkInIntervalSeconds: teritageData?.plan.checkInIntervalSeconds,
      socialLinks: teritageData?.plan.socialLinks,
      notifyBeneficiary: teritageData?.plan.notifyBeneficiary,
    };

    mutate(payload);
  };

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
    2: <ManageAllocation beneficiary={data} totalValue={totalValue} setCurrentStage={setCurrentStage} />,
    3: <BeneficiaryInfoForm handleNext={handleMutatePlan} hasFormat isLoading={isPending} newBeneficiary={false} />,
  };

  return (
    <div className="flex justify-end">
      <Sheet>
        <SheetTrigger asChild>
          <Button startIcon={<Eye size={16} />} size="sm" variant="secondary">
            View
          </Button>
        </SheetTrigger>
        <SheetContent className={cn('overflow-y-auto', !isDesktop && 'max-h-[90vh]')} side={isDesktop ? 'right' : 'bottom'}>
          <SheetHeader>
            <div className="flex space-x-2 items-center">
              {currentStage > 1 && (
                <ArrowLeft
                  role="navigation"
                  className="cursor-pointer"
                  aria-label="navigate backward"
                  onClick={() => setCurrentStage(currentStage - 1)}
                />
              )}
              <SheetTitle className="text-left">{EachTitle[currentStage]}</SheetTitle>
            </div>
            <Separator />
          </SheetHeader>

          <div className="p-4 overflow-y-auto">{EachStage[currentStage]}</div>
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
