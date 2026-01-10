'use client';
import Introduction from '@/components/beneficiary/introduction';
import { INHERITANCE_SETUP_URL, WALLET_URL } from '@/config/path';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';

export default function IntroductionPage() {
  const { isConnected } = useAccount();
  const router = useRouter();

  const handleNext = () => {
    if (!isConnected) {
      toast.error("Kindly connect wallet")
    } else {
      router.push(INHERITANCE_SETUP_URL)
    }
  }

  const handleSkip = () => {
    router.push(WALLET_URL)
  }
  
  return <Introduction handleNext={handleNext} handleSkip={handleSkip} />;
}
