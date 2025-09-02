import { Button } from '@/components/ui/button';
import { CONNECT_WALLET_URL } from '@/config/path';
import Image from 'next/image';
import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="text-muted text-center space-y-4">
      <Image src="/success.png" alt="success" width={600} height={400} className="-mt-24" />
      <h1>Account Set Up Successfully</h1>
      <Link href={CONNECT_WALLET_URL}>
        <Button className="w-full">Connect wallet</Button>
      </Link>
    </div>
  );
}
