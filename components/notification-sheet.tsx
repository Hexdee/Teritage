'use client';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Bell, CalendarDays } from 'lucide-react';
import { Separator } from './ui/separator';
import { useQuery } from '@tanstack/react-query';
import { getNotifications } from '@/config/apis';
import { NOTIFICATIONS_KEY } from '@/config/key';
import { TailSpinPreloader } from './icons/tail-spin-preloader';
import { format } from 'date-fns';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';

interface NotificationSheetProps {
  trigger?: React.ReactNode;
}

interface INotification {
  title: string;
  body: string;
  createdAt: string;
}

export default function NotificationSheet({ trigger }: NotificationSheetProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  const { data, isLoading, isError, error } = useQuery({
    queryFn: getNotifications,
    queryKey: [NOTIFICATIONS_KEY],
  });

  const notifications = (data as any)?.notifications || [];

  const content = (
    <div>
        {isLoading && <TailSpinPreloader />}
        {isError && <p className="text-destructive text-sm">{(error as Error)?.message || 'An error occured while fetching notifications'}</p>}
        {!isLoading && !isError && notifications.length === 0 && (
            <p className="text-muted-foreground text-center py-4">No notifications yet</p>
        )}
        {notifications.length > 0 && (
          <div className="space-y-4">
            {notifications.map((item: INotification, index: number) => (
              <div key={index} className="lg:flex items-center justify-between border-b border-zinc-800 pb-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-zinc-800 rounded-full">
                    <CalendarDays className="text-muted-foreground" size={18} />
                  </div>
                  <div className="space-y-2.5">
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="text-white">{item.body}</p>
                    <p className="text-sm text-muted-foreground">{format(new Date(item.createdAt), 'do MMMM, yyyy • h:mm a')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );

  const defaultTrigger = (
     <button className="flex items-center gap-2">
            <Bell size={20} className='text-muted-foreground' />
    </button>
  );

  return (
    <>
        <Sheet>
          <SheetTrigger asChild>
            {trigger || defaultTrigger}
          </SheetTrigger>
          <SheetContent className={cn('overflow-y-auto pb-5', !isDesktop && 'max-h-[90vh]')} side={isDesktop ? 'right' : 'bottom'}>
            <SheetHeader>
              <SheetTitle>Notifications</SheetTitle>
              <Separator />
            </SheetHeader>
            <div className="px-4 space-y-8 mt-4">{content}</div>
          </SheetContent>
        </Sheet>
    </>
  );
}
