/* eslint-disable @next/next/no-img-element */
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useApplications } from '@/context/dashboard-provider';
import AddWalletContent from './wallets';
import { Loader } from 'lucide-react';

export default function UserProfile() {
  const { openSheet, setOpenSheet, isLoadingWalletsToken, userProfile } = useApplications();

  return (
    <>
      {isLoadingWalletsToken ? (
        <Loader className="mr-2 h-4 w-4 animate-spin mt-4" />
      ) : (
        <Sheet open={openSheet} onOpenChange={setOpenSheet}>
          <SheetTrigger asChild>
            <div className="text-inverse flex space-x-2 items-center cursor-pointer" role="button">
              {userProfile?.id && (
                <div className="bg-primary w-6 h-6 rounded-full">
                  <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${userProfile?.id}`} alt="logo" className="rounded-full h-6 w-6" />
                </div>
              )}
              <p className="font-medium capitalize">{userProfile?.username || userProfile?.name}</p>
            </div>
          </SheetTrigger>
          <SheetContent>
            <AddWalletContent />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
