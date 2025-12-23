'use client';

import { sidebarLinks } from '@/config/constants';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="lg:grid lg:grid-cols-12 gap-8 space-y-4">
      <div className="lg:col-span-3 lg:space-y-4 flex overflow-x-auto items-center lg:grid whitespace-nowrap overscroll-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-default">
        {sidebarLinks.map((each) => (
          <div key={each.title}>
            <Link href={each.href}>
              <div className={cn('flex space-x-2 items-center px-4 py-2.5 rounded-md flex-none', each.href === pathname && 'bg-card font-medium')}>
                {each.icon}
                <p className="truncate">{each.title}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
      <div className="lg:col-span-9 border rounded-md p-4  h-fit min-h-[30vh]">{children}</div>
    </div>
  );
}
