'use client';
import SetUpInheritanceForm from '@/components/forms/setup-inheritance-form';
import { Separator } from '@/components/ui/separator';
import { BENEFICIARY_INFO_URL } from '@/config/path';
import { useRouter } from 'next/navigation';

export default function Setup() {
  const router = useRouter();
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h5 className="font-medium text-lg text-inverse">Set Up Inheritance</h5>
        <Separator />
      </div>

      <SetUpInheritanceForm handleNext={() => router.push(BENEFICIARY_INFO_URL)} />
    </div>
  );
}
