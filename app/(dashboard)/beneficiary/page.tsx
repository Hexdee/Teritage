'use client';
import DataTable from '@/components/ui/data-table';
import { columns } from './columns';
import { useApplications } from '@/context/dashboard-provider';

export default function Beneficiary() {
  const data = [{ name: 'Papi Chuks', wallet_address: '0x3A9...F6D1', assigned_allocation: '60%' }];

  const { teritageData, isLoadingTeritage, isTeritageError, teritageError } = useApplications();

  console.log({ teritageData });

  return (
    <div className="text-inverse">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
