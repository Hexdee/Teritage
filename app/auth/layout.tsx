'use client';
import { CloseIcon } from '@/components/icons';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  return (
    <div className="py-16 px-24">
      <button onClick={() => router.back()}>
        <ChevronLeft size={20} className="text-inverse" />
      </button>

      <div className="flex justify-center h-full items-center w-full">
        <Card className="sm:max-w-md">
          <CardHeader>
            <div className="flex justify-between items-center text-inverse">
              <div className="flex space-x-2 items-center">
                <Image src="/logo.png" width={32} height={34} alt="logo" />
                <p className="text-lg">Teritage</p>
              </div>
              <CloseIcon />
            </div>
          </CardHeader>
          <CardContent className="sm:max-w-md">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
