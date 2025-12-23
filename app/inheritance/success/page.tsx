'use client';
import { Button } from '@/components/ui/button';
import { WALLETS_SUMMARY_KEY, WALLETS_TOKENS_KEY } from '@/config/key';
import { WALLET_URL } from '@/config/path';
import { useInheritancePlanStore } from '@/store/useInheritancePlanStore';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function WalletSuccessPage() {
  const queryClient: any = useQueryClient();
  const router = useRouter();
  const { reset } = useInheritancePlanStore();

  const handleCompleted = () => {
    reset();
    queryClient.invalidateQueries(WALLETS_SUMMARY_KEY);
    queryClient.invalidateQueries(WALLETS_TOKENS_KEY);
    router.push(WALLET_URL);
  };

  return (
    <div className='text-muted text-center space-y-6'>
      <Image
        src='/success.png'
        alt='success'
        width={600}
        height={400}
        className='-mt-6'
      />
      <h1 className='lg:px-32 text-inverse'>
        Your Inheritance Setup is Active
      </h1>

      <Button className='w-full' onClick={handleCompleted}>
        Completed
      </Button>
    </div>
  );
}
