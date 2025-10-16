'use client';

import DataTable from '@/components/ui/data-table';
import { DashboardSkeleton } from '@/components/ui/loading';
import EmptyState from '@/components/ui/empty-state';
import { useApplications } from '@/context/dashboard-provider';
import { columns } from './columns';

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));

export default function ActivityPage() {
  const { teritageData, isLoadingTeritage, isTeritageError, teritageError } = useApplications();

  if (isLoadingTeritage) {
    return <DashboardSkeleton />;
  }

  if (isTeritageError) {
    const message = (teritageError as any)?.response?.data?.message ?? (teritageError instanceof Error ? teritageError.message : 'Unable to load activities');
    return (
      <div className="h-[70vh] flex items-center px-20">
        <div className="w-full space-y-6">
          <EmptyState />
          <p className="text-center text-sm text-destructive">{message}</p>
        </div>
      </div>
    );
  }

  const activities = teritageData?.plan?.activities ?? [];

  if (!activities.length) {
    return (
      <div className="h-[70vh] flex items-center px-20">
        <EmptyState />
      </div>
    );
  }

  const data = activities.map((activity) => {
    switch (activity.type) {
      case 'CHECK_IN':
        return {
          icon: 'check-in',
          type: 'Health Check-In',
          date: formatDate(activity.timestamp),
          status: 'success',
        };
      case 'PLAN_UPDATED':
        return {
          icon: 'plan',
          type: 'Plan Updated',
          date: formatDate(activity.timestamp),
          status: 'success',
        };
      case 'CLAIM_TRIGGERED':
        return {
          icon: 'claim',
          type: 'Claim Triggered',
          date: formatDate(activity.timestamp),
          status: 'triggered',
        };
      case 'PLAN_CREATED':
      default:
        return {
          icon: 'plan',
          type: 'Plan Created',
          date: formatDate(activity.timestamp),
          status: 'success',
        };
    }
  });

  return (
    <div className="text-inverse">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
