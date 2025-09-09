'use client';
import { NotificationIcon } from '@/components/icons';
import { ModeToggle } from '@/components/themes/mode-toggle';
import SearchInput from '@/components/ui/search-input';
import { sidebar } from '@/config/constants';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import AddWalletContent from '@/components/wallets';

export default function Layout({ children }: { children: ReactNode }) {
  const [currentStage, setCurrentStage] = useState<number>(0);
  const pathname = usePathname();
  const currentNavigation = sidebar.find((each) => each.url === pathname);

  return (
    <div className="h-screen">
      <div className="grid grid-cols-10 h-full">
        <nav className="col-span-2 border-r space-y-8 items-center">
          <div className="flex space-x-2 items-center text-white border-b h-20 px-8">
            <Image src="/logo.png" width={32} height={34} alt="logo" />
            <p className="text-lg">Teritage</p>
          </div>

          <div className="space-y-8 px-8">
            {sidebar.map((each) => (
              <Link href={each.url} key={each.title}>
                <div
                  className={cn('flex space-x-4 text-muted py-3 hover:text-white px-4 rounded-lg my-6', pathname.startsWith(each.url) && 'bg-card text-white')}
                >
                  {each.icon}
                  <p>{each.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </nav>
        <div className="col-span-8 space-y-8">
          <div className="border-b w-full py-4 px-8 h-20 grid grid-cols-10 items-center">
            <div className="text-white flex space-x-2 col-span-3">
              {currentNavigation?.icon}
              <p>{currentNavigation?.title}</p>
            </div>
            <div className="col-span-7 flex space-x-6 justify-end">
              <SearchInput inputClassName="w-[300px]" />
              <ModeToggle />

              <div className="flex items-center px-6 space-x-8">
                <div className="w-px h-6 bg-border" />
                <div className="space-x-2 flex items-center">
                  <div className="w-2 h-2 bg-destructive rounded-full" />
                  <NotificationIcon />
                </div>
                <div className="w-px h-6 bg-border" />
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <div className="text-white flex space-x-2 items-center cursor-pointer" role="button">
                    <Avatar>
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <p className="font-medium">Mayor</p>
                  </div>
                </SheetTrigger>
                <SheetContent>
                  <AddWalletContent setCurrentStage={setCurrentStage} currentStage={currentStage} />
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <div className="space-y-8 px-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
