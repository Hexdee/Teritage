import { INextPage } from '@/type';
import { InfoCircleIcon } from '../icons';
import { Button } from '../ui/button';
import { CircularProgress } from '../ui/circular-progress';

export default function AllocationBreakdown({ handleNext }: INextPage) {
  return (
    <div className='space-y-12'>
      <div className='relative'>
        <p className='text-muted text-xs absolute right-[41%] top-12'>
          Assigned Allocation
        </p>
        <CircularProgress value={60} textClassName='mt-4' />
      </div>

      <div className='space-y-6 border-b pb-6'>
        <p className='text-inverse font-medium'>Allocation Category</p>
        <div className='flex justify-between'>
          <div className='flex space-x-2 text-sm items-center'>
            <div className='w-2 h-2 rounded-xs bg-primary' />
            <p className='text-muted'>Allocated Balance</p>
          </div>
          <p>$1,407.34 (60%)</p>
        </div>

        <div className='flex justify-between'>
          <div className='flex space-x-2 text-sm items-center'>
            <div className='w-2 h-2 rounded-xs bg-muted' />
            <p className='text-muted'>Unallocated Balance</p>
          </div>
          <p>$1,407.34 (60%)</p>
        </div>
      </div>

      <div className='bg-card border rounded-md text-muted-foreground text-sm p-2 flex items-start space-x-2'>
        <InfoCircleIcon />
        <p>
          In the event of inactivity or death, allocated tokens in your wallet
          will be transferred to your beneficiary’s wallet address.
        </p>
      </div>

      <Button onClick={handleNext}>Manage Allocation</Button>
    </div>
  );
}
