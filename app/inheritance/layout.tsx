'use client';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { CustomConnectButton } from '@/components/ui/connect-button';

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  return (
    <div className="py-8 px-6 lg:py-12 lg:px-24 space-y-4 lg:space-y-12 fixed w-full">
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()}>
          <ChevronLeft size={20} className="text-inverse" />
        </button>

        <CustomConnectButton buttonClassName="hidden lg:flex" />

        <div className="flex space-x-2 items-center text-inverse">
          <Image src="/logo.png" width={32} height={34} alt="logo" />
          <p className="text-lg">Teritage</p>
        </div>
      </div>

      <CustomConnectButton buttonClassName="lg:hidden flex gap-2" />

      <div className="flex justify-center h-full items-center w-full">
        <Card className="sm:max-w-md sm:min-w-md max-h-[75vh] overflow-y-auto">
          <CardContent className="sm:max-w-md sm:min-w-md h-full">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
