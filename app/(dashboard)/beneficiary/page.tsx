'use client';
import DataTable from '@/components/ui/data-table';
import { DashboardSkeleton } from '@/components/ui/loading';
import EmptyState from '@/components/ui/empty-state';
import { useApplications } from '@/context/dashboard-provider';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { columns, ActionCell, NameCell } from './columns';

const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export default function Beneficiary() {
  const { teritageData, isLoadingTeritage, isTeritageError, teritageError } = useApplications();

  if (isLoadingTeritage) {
    return <DashboardSkeleton />;
  }

  if (isTeritageError) {
    const message =
      (teritageError as any)?.response?.data?.message ?? (teritageError instanceof Error ? teritageError?.message : 'Unable to load beneficiaries');
    return (
      <div className="h-[70vh] flex items-center px-20">
        <div className="w-full space-y-6">
          <EmptyState />
          <p className="text-center text-sm text-destructive">{message}</p>
        </div>
      </div>
    );
  }

  const inheritors = teritageData?.plan?.inheritors ?? [];

  if (!inheritors.length) {
    return (
      <div className="h-[70vh] flex items-center px-20">
        <EmptyState hasButton />
      </div>
    );
  }

  const data = inheritors.map((beneficiary) => {
    const isPending = beneficiary.address?.toLowerCase() === ZERO_ADDRESS;
    return {
      name: beneficiary.name || beneficiary.address,
      wallet_address: isPending ? 'Pending' : formatAddress(beneficiary.address),
      full_wallet_address: beneficiary.address,
      sharePercentage: beneficiary.sharePercentage,
      notifyBeneficiary: false,
      email: beneficiary.email ?? '',
      phone: beneficiary.phone ?? '',
    };
  });

  return (
    <div className="text-inverse">
      <div className="hidden md:block">
        <DataTable columns={columns} data={data} />
      </div>

      <div className="md:hidden grid grid-cols-1 gap-4">
        {data.map((item, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <NameCell data={item} />
                <ActionCell data={item} />
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Wallet Address</span>
                <span className="font-medium font-mono">{item.wallet_address}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Assigned Allocation</span>
                <span className="font-medium">{item.sharePercentage}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
