import { Inbox } from 'lucide-react';
import { Skeleton } from './skeleton';
import { Button } from './button';
import { useApplications } from '@/context/dashboard-provider';

interface IEmptyState {
  hasButton?: boolean;
}

export default function EmptyState({ hasButton }: IEmptyState) {
  const { setOpenSheet } = useApplications();
  return (
    <div className="flex justify-between w-full items-center">
      <div className="flex items-center space-x-4 w-[15%]">
        <Skeleton className="h-12 w-16 rounded-full" />
        <div className="space-y-2 w-full">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      <div className="text-center mx-auto lg:w-[70%] w-full space-y-4">
        <div className="">
          <div className="flex justify-center">
            <Inbox size={120} className="mb-4" />
          </div>
          <p className="text-inverse">Secure your Legacy</p>
          <p className="text-muted-foreground">Add tokens to your wallet to allocate assets for inheritance.</p>
        </div>
        {hasButton && (
          <Button className="w-[60%]" onClick={() => setOpenSheet(true)}>
            Set up Inheritance
          </Button>
        )}
      </div>
      <div className="space-y-2 w-[15%]">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}
