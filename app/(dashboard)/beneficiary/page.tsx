'use client';
import DataTable from '@/components/ui/data-table';
import { DashboardSkeleton } from '@/components/ui/loading';
import EmptyState from '@/components/ui/empty-state';
import { useApplications } from '@/context/dashboard-provider';
import { columns } from './columns';

const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

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

  const data = inheritors.map((beneficiary) => ({
    name: beneficiary.name || beneficiary.address,
    wallet_address: formatAddress(beneficiary.address),
    full_wallet_address: beneficiary.address,
    sharePercentage: beneficiary.sharePercentage,
    notifyBeneficiary: false,
    email: beneficiary.email ?? '',
    phone: beneficiary.phone ?? '',
  }));

  return (
    <div className="text-inverse">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
