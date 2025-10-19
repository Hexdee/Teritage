/* eslint-disable @next/next/no-img-element */
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useApplications } from '@/context/dashboard-provider';
import AddWalletContent from './wallets';
import { Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';

export default function UserProfile({ className }: { className?: string }) {
  const { openSheet, setOpenSheet, isLoadingWalletsToken, userProfile } = useApplications();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return (
    <>
      {isLoadingWalletsToken ? (
        <Loader className="mr-2 h-4 w-4 animate-spin mt-3" />
      ) : (
        <Sheet open={openSheet} onOpenChange={setOpenSheet}>
          <SheetTrigger asChild>
            <div className={cn('text-inverse flex space-x-2 items-center cursor-pointer', className)} role="button">
              {userProfile?.id && (
                <div className="bg-primary w-6 h-6 rounded-full">
                  <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${userProfile?.id}`} alt="logo" className="rounded-full h-6 w-6" />
                </div>
              )}
              <p className="font-medium capitalize truncate">{userProfile?.username || userProfile?.name}</p>
            </div>
          </SheetTrigger>
          <SheetContent side={isDesktop ? 'right' : 'bottom'} className="pb-4">
            <AddWalletContent />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}

export function UserProfileImage() {
  const { isLoadingWalletsToken, userProfile } = useApplications();
  return (
    <>
      {isLoadingWalletsToken ? (
        <Loader className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <>
          {userProfile?.id && (
            <div className="bg-primary w-6 h-6 rounded-full">
              <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${userProfile?.id}`} alt="logo" className="rounded-full h-6 w-6" />
            </div>
          )}
        </>
      )}
    </>
  );
}
