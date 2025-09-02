import BeneficiaryInfoForm from '@/components/forms/beneficiary-info-form';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';

export default function BeneficiaryInformation() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h5 className="font-medium text-lg text-white">Beneficiary Information</h5>
          <Button variant="secondary" className="w-fit" size="sm">
            <div className="flex space-x-1 items-center">
              <Plus size={14} />
              <p>Add Beneficiary</p>
            </div>
          </Button>
        </div>
        <Separator />
      </div>

      <BeneficiaryInfoForm />
    </div>
  );
}
