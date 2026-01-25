'use client';
import DataTable from '@/components/ui/data-table';
import { DashboardSkeleton } from '@/components/ui/loading';
import EmptyState from '@/components/ui/empty-state';
import { useApplications } from '@/context/dashboard-provider';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { columns, StatusCell, TypeCell } from './columns';
import { getApiErrorMessage } from '@/lib/api-error';

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
    const message = getApiErrorMessage(teritageError, 'Unable to load activities');
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
      <div className="hidden md:block">
        <DataTable columns={columns} data={data} />
      </div>

      <div className="md:hidden grid grid-cols-1 gap-4">
        {data.map((item, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-2">
              <TypeCell data={item} />
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-right">{item.date}</span>
              </div>
              <div className="flex justify-between py-1 items-center">
                <span className="text-muted-foreground">Status</span>
                <StatusCell data={item} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
