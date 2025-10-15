'use client';
import DataTable from '@/components/ui/data-table';
import { columns } from './columns';
import { CalenderIcon, MagicPenIcon } from '@/components/icons';
import { useApplications } from '@/context/dashboard-provider';
import { DashboardSkeleton } from '@/components/ui/loading';

export default function ActivityPage() {
  const { activitiesData, isLoadingActivities, isActivitiesError, activitiesError } = useApplications();
  const data = [
    { icon: <CalenderIcon />, type: 'Health Check-In', date: '10th August, 2025 • 9:04 AM', status: 'success' },
    { icon: <CalenderIcon />, type: 'Health Check-In', date: '10th August, 2025 • 9:04 AM', status: 'triggered' },
    { icon: <MagicPenIcon />, type: 'Wallet Added', date: '10th August, 2025 • 9:04 AM', status: 'success' },
  ];

  if (isLoadingActivities) {
    return <DashboardSkeleton />;
  }

  if (isActivitiesError) {
    throw new Error(activitiesError?.response?.data?.message || 'Error occured while trying to access the server');
  }

  console.log({ activitiesData });
  return (
    <div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
