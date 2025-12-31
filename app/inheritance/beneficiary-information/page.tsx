'use client';
import BeneficiaryInfoForm from '@/components/forms/beneficiary-info-form';
import { Separator } from '@/components/ui/separator';
import { TOKEN_ALLOCATION_URL } from '@/config/path';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAccount } from 'wagmi';

export default function BeneficiaryInformation() {
  const router = useRouter();
  const { isConnected } = useAccount();

    const handleNext = () => {
    if (!isConnected) {
      toast.error("Kindly connect wallet")
    } else {
      router.push(TOKEN_ALLOCATION_URL)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h5 className="font-medium text-lg text-inverse">Beneficiary Information</h5>
        <p className="text-sm text-muted-foreground">
          Add one or more beneficiaries and define how your Teritage plan should be distributed if the check-in interval is missed.
        </p>
        <Separator />
      </div>

      <BeneficiaryInfoForm handleNext={handleNext} />
    </div>
  );
}
