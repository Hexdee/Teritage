import SetUpInheritanceForm from '@/components/forms/setup-inheritance-form';
import { Separator } from '@/components/ui/separator';

export default function Setup() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h5 className="font-medium text-lg text-white">Set Up Inheritance</h5>
        <Separator />
      </div>

      <SetUpInheritanceForm />
    </div>
  );
}
