'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode } from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';
import { AUTH_SET_USERNAME, SUCCESS_URL } from '@/config/path';

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const hasBack = typeof window !== 'undefined' && window.history.length > 1;

  return (
    <div className="py-16 px-24">
      {hasBack && (
        <button onClick={() => router.back()}>
          <ChevronLeft size={20} className="text-inverse cursor-pointer" />
        </button>
      )}

      <div className="flex justify-center h-full items-center w-full">
        <Card className="sm:max-w-md">
          <CardHeader>
            <div className="flex justify-between items-center text-inverse">
              <div className="flex space-x-2 items-center">
                <Image src="/logo.png" width={32} height={34} alt="logo" />
                <p className="text-lg">Teritage</p>
              </div>

              {pathname === AUTH_SET_USERNAME && (
                <Link href={SUCCESS_URL}>
                  <button className="flex items-center space-x-1 cursor-pointer">
                    <p className="text-sm">Skip</p>
                    <ChevronRight size={20} />
                  </button>
                </Link>
              )}

              {/* <CloseIcon /> */}
            </div>
          </CardHeader>
          <CardContent className="sm:max-w-md min-w-md">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
