import { INextPage } from '@/type';
import { InfoCircleIcon } from '../icons';
import { Button } from '../ui/button';
import { CircularProgress } from '../ui/circular-progress';
import { BeneficiaryRow } from '@/app/(dashboard)/beneficiary/columns';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);

interface AllocationBreakdownProps extends INextPage {
  beneficiary: BeneficiaryRow;
  allocatedValue: number;
  unallocatedValue: number;
  assignedPercentage: number;
  unallocatedPercentage: number;
}

export default function AllocationBreakdown({ handleNext, beneficiary, allocatedValue, unallocatedValue, assignedPercentage, unallocatedPercentage }: AllocationBreakdownProps) {
  return (
    <div className="space-y-12">
      <div className="relative">
        <p className="text-muted text-xs absolute right-[38%] top-12">Assigned Allocation</p>
        <CircularProgress value={assignedPercentage} textClassName="mt-4" />
      </div>

      <div className="space-y-6 border-b pb-6">
        <p className="text-inverse font-medium">Allocation Summary for {beneficiary.name}</p>
        <div className="flex justify-between">
          <div className="flex space-x-2 text-sm items-center">
            <div className="w-2 h-2 rounded-xs bg-primary" />
            <p className="text-muted">Allocated Balance</p>
          </div>
          <p>
            {formatCurrency(allocatedValue)} ({assignedPercentage}%){' '}
          </p>
        </div>

        <div className="flex justify-between">
          <div className="flex space-x-2 text-sm items-center">
            <div className="w-2 h-2 rounded-xs bg-muted" />
            <p className="text-muted">Unallocated Balance</p>
          </div>
          <p>
            {formatCurrency(unallocatedValue)} ({unallocatedPercentage}%){' '}
          </p>
        </div>
      </div>

      <div className="bg-card border rounded-md text-muted-foreground text-sm p-2 flex items-start space-x-2">
        <InfoCircleIcon />
        <p>
          In the event of inactivity or death, allocated tokens in your wallet will be transferred to {beneficiary.name}&apos;s wallet address{' '}
          <span className="font-mono text-inverse">{beneficiary.wallet_address}</span>.
        </p>
      </div>

      <Button onClick={handleNext}>Manage Allocation</Button>
    </div>
  );
}
