import { Skeleton } from './skeleton';

export default function EmptyState() {
  return (
    <div className="flex justify-between w-full">
      <div className="flex items-center space-x-4 w-[15%]">
        <Skeleton className="h-12 w-16 rounded-full" />
        <div className="space-y-2 w-full">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      <div className="text-center mx-auto w-[70%]">
        <p className="text-inverse">Secure your Legacy</p>
        <p className="text-muted-foreground">Add tokens to your wallet to allocate assets for inheritance.</p>
      </div>
      <div className="space-y-2 w-[15%]">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}
