'use client';

import { sidebarLinks } from '@/config/constants';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-3 space-y-4">
        {sidebarLinks.map((each) => (
          <div key={each.title}>
            <Link href={each.href}>
              <div className={cn('flex space-x-2 items-center px-4 py-2.5 rounded-md', each.href === pathname && 'bg-card font-medium')}>
                {each.icon}
                <p>{each.title}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
      <div className="col-span-9 border rounded-md p-4  h-fit min-h-[30vh]">{children}</div>
    </div>
  );
}
