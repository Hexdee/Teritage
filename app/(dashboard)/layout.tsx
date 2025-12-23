'use client';
import { NotificationIcon } from '@/components/icons';
import SearchInput from '@/components/ui/search-input';
import { sidebar } from '@/config/constants';
import { cn, handleLogout } from '@/lib/utils';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ReactNode, useState } from 'react';
import { DashboardProvider } from '@/context/dashboard-provider';
import { CustomConnectButton } from '@/components/ui/connect-button';
import { UserCheckIn } from '@/components/check-in';
import UserProfile, { UserProfileImage } from '@/components/profile-sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Layout({ children }: { children: ReactNode }) {
  const [openSheet, setOpenSheet] = useState<boolean>(false);
  const pathname = usePathname();
  const currentNavigation = sidebar.find((each) => pathname.startsWith(each.default));

  return (
    <DashboardProvider>
      <div className="h-screen">
        <div className="grid lg:grid-cols-10 lg:h-full space-y-4">
          {/* Sidebar - visible only on large screens */}
          <nav className="hidden lg:block col-span-2 border-r space-y-8 h-full relative">
            <div className="flex justify-between border-b h-20 px-8 items-center">
              <div className="flex space-x-2 items-center text-inverse">
                <Image src="/logo.png" width={32} height={34} alt="logo" />
                <p className="text-lg">Teritage</p>
              </div>
            </div>

            <div className="space-y-8 px-8">
              {sidebar.map((each) => (
                <Link href={each.url} key={each.title}>
                  <div
                    className={cn(
                      'flex space-x-4 text-muted py-3 hover:text-inverse px-4 rounded-lg my-6',
                      pathname.startsWith(each.default) && 'bg-card text-inverse'
                    )}
                  >
                    {each.icon}
                    <p>{each.title}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div
              className="lg:flex space-x-2 hidden pl-14 cursor-pointer items-center text-destructive absolute bottom-10"
              role="button"
              onClick={handleLogout}
            >
              <LogOut size={20} />
              <p>Logout</p>
            </div>
          </nav>

          {/* Mobile Header with Sidebar Sheet */}
          <div className="lg:hidden border-b flex justify-between items-center h-16 px-4 w-full">
            <div className="flex space-x-2 items-center text-inverse">
              <Image src="/logo.png" width={32} height={34} alt="logo" />
              <p className="text-lg">Teritage</p>
            </div>

            <div className="flex justify-between space-x-4 items-center">
              <div className="flex items-center space-x-4">
                <div className="w-px h-6 bg-border" />
                <div className="space-x-2 flex items-center">
                  <div className="w-2 h-2 bg-destructive rounded-full" />
                  <NotificationIcon />
                </div>
                <div className="w-px h-6 bg-border" />
              </div>

              <Popover>
                <PopoverTrigger>
                  <button className="flex items-center justify-center">
                    <UserProfileImage />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 space-y-2.5">
                  <UserProfile className="bg-primary-foreground text-muted-foreground h-12 px-4 py-2 rounded-md" />
                  <UserCheckIn buttonClassName="w-full flex justify-start" />
                  <CustomConnectButton />
                  <Button startIcon={<LogOut size={18} />} onClick={handleLogout} variant="secondary" className="w-full flex justify-start">
                    Logout
                  </Button>
                </PopoverContent>
              </Popover>
              <Sheet open={openSheet} onOpenChange={setOpenSheet}>
                <SheetTrigger asChild>
                  <button>
                    <Menu />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-6">
                  <div className="flex space-x-2 items-center text-inverse -mt-3">
                    <Image src="/logo.png" width={32} height={34} alt="logo" />
                    <p className="text-lg">Teritage</p>
                  </div>
                  <div className="space-y-6 mt-4">
                    {sidebar.map((each) => (
                      <Link href={each.url} key={each.title}>
                        <div
                          className={cn(
                            'flex space-x-4 text-muted py-3 hover:text-inverse px-4 rounded-lg mt-4',
                            pathname.startsWith(each.default) && 'bg-card text-inverse'
                          )}
                          onClick={() => setOpenSheet(false)}
                        >
                          {each.icon}
                          <p>{each.title}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-8 space-y-8 hidden sm:block">
            <div className="border-b w-full py-4 px-4 lg:px-8 h-20 grid grid-cols-10 items-center">
              <div className="text-inverse flex space-x-2 col-span-3">{currentNavigation?.icon}</div>
              <div className="col-span-7 flex space-x-4 lg:space-x-6 justify-end items-center">
                <div className="hidden md:block">
                  <SearchInput inputClassName="w-[200px] md:w-[300px]" />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-px h-6 bg-border" />
                  <div className="space-x-2 flex items-center">
                    <div className="w-2 h-2 bg-destructive rounded-full" />
                    <NotificationIcon />
                  </div>
                  <div className="w-px h-6 bg-border" />
                </div>


                <CustomConnectButton />

                <UserCheckIn />
                <UserProfile />
              </div>
            </div>

            <div className="space-y-8 px-4 lg:px-8">{children}</div>
          </div>
          <div className="space-y-8 px-4 lg:px-8 lg:hidden block w-full overflow-x-auto">{children}</div>
        </div>
      </div>
    </DashboardProvider>
  );
}
