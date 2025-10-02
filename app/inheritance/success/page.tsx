'use client';
import { Button } from '@/components/ui/button';
import { WALLET_URL } from '@/config/path';
import { useInheritancePlanStore } from '@/store/useInheritancePlanStore';
import Image from 'next/image';
import Link from 'next/link';

export default function WalletSuccessPage() {
  const { reset } = useInheritancePlanStore();
  return (
    <div className="text-muted text-center space-y-6">
      <Image src="/success.png" alt="success" width={600} height={400} className="-mt-6" />
      <h1 className="px-32 text-inverse">Your Inheritance Setup is Active</h1>
      <Link href={WALLET_URL}>
        <Button className="w-full" onClick={() => reset()}>
          Completed
        </Button>
      </Link>
    </div>
  );
}
