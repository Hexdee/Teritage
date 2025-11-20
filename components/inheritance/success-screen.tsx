'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { WALLETS_SUMMARY_KEY, WALLETS_TOKENS_KEY } from '@/config/key';
import { WALLET_URL } from '@/config/path';
import { useInheritancePlanStore } from '@/store/useInheritancePlanStore';

interface SuccessScreenProps {
  handleNext?: () => void;
}

export default function SuccessScreen({ handleNext }: SuccessScreenProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { reset } = useInheritancePlanStore();

  const handleCompleted = () => {
    reset();
    queryClient.invalidateQueries({ queryKey: [WALLETS_SUMMARY_KEY] });
    queryClient.invalidateQueries({ queryKey: [WALLETS_TOKENS_KEY] });

    if (handleNext) {
      handleNext();
      return;
    }

    router.push(WALLET_URL);
  };

  return (
    <div className="text-muted text-center space-y-6">
      <Image src="/success.png" alt="success" width={600} height={400} className="-mt-6" />
      <h1 className="px-32 text-inverse">Your Inheritance Setup is Active</h1>

      <Button className="w-full" onClick={handleCompleted}>
        Completed
      </Button>
    </div>
  );
}
