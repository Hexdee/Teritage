import { Button } from '@/components/ui/button';
import { WALLET_URL } from '@/config/path';
import Image from 'next/image';
import Link from 'next/link';

export default function WalletSuccessPage() {
  return (
    <div className="text-muted text-center space-y-6">
      <Image src="/success.png" alt="success" width={600} height={400} className="-mt-6" />
      <h1 className="px-32 text-white">Your Inheritance Setup is Active</h1>
      <Link href={WALLET_URL}>
        <Button className="w-full">Completed</Button>
      </Link>
    </div>
  );
}

// import WalletSuccess from '@/components/wallets/wallet-success';
// import { WALLET_URL } from '@/config/path';
// import { useRouter } from 'next/navigation';

// export default function WalletSuccessPage() {
//   const router = useRouter();
//   return <WalletSuccess handleNext={() => router.push(WALLET_URL)} />;
// }
