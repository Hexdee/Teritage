import { Button } from '@/components/ui/button';
import { CONNECT_WALLET_URL } from '@/config/path';
import Image from 'next/image';
import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="text-muted text-center space-y-6">
      <Image src="/success.png" alt="success" width={600} height={400} className="-mt-6" />
      <h1 className="px-32 text-white">Your Inheritance Setup is Active</h1>
      <Link href={CONNECT_WALLET_URL}>
        <Button className="w-full">Completed</Button>
      </Link>
    </div>
  );
}
