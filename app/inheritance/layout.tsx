'use client';
import { ChevronLeft } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

import { Card, CardContent } from '@/components/ui/card';

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  return (
    <div className="py-12 px-24 space-y-12 fixed w-full">
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()}>
          <ChevronLeft size={20} className="text-white" />
        </button>
        <div className="flex space-x-2 items-center text-white">
          <Image src="/logo.png" width={32} height={34} alt="logo" />
          <p className="text-lg">Teritage</p>
        </div>
      </div>

      <div className="flex justify-center h-full items-center w-full">
        <Card className="sm:max-w-md sm:min-w-md max-h-[75vh] overflow-y-auto">
          <CardContent className=" sm:max-w-md sm:min-w-md h-full">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
