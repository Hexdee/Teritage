import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useApplications } from '@/context/dashboard-provider';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import AddWalletContent from './wallets';

export default function UserProfile() {
  const { openSheet, setOpenSheet } = useApplications();
  return (
    <Sheet open={openSheet} onOpenChange={setOpenSheet}>
      <SheetTrigger asChild>
        <div className="text-inverse flex space-x-2 items-center cursor-pointer" role="button">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <p className="font-medium">Mayor</p>
        </div>
      </SheetTrigger>
      <SheetContent>
        <AddWalletContent />
      </SheetContent>
    </Sheet>
  );
}
