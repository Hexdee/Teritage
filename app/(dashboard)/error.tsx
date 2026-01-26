'use client';

import { Button } from '@/components/ui/button';
import { WALLET_URL } from '@/config/path';
import { useRouter } from 'next/navigation';

export default function Error({ reset }: { reset: () => void }) {
  const router = useRouter();
  return (
    <div role="alert" className="flex flex-col gap-8 items-center pt-14 w-full bg-background">
      <div className="w-[90%] space-y-4 font-light text-sm text-[#999999]">
        <h1 className="dark:text-white text-dark text-[28px] text-white mtn-h1">This view can’t be reached</h1>
        {/* <p className="multiline-truncate-3">{error}</p> */}
        <p>Try the following help:</p>
        <p>1. Try again later.</p>
        <p>2. Check your internet connection to ensure you&apos;re online.</p>
        <p>3. Refresh the page or try accessing the service again in a few minutes.</p>
        <p onClick={() => router.push(WALLET_URL)}>
          4. Click{' '}
          <span className="text-mtn" role="button">
            here
          </span>{' '}
          to go home
        </p>
        <p>5. If you&apos;re connected but facing firewall restrictions, ensure Chrome/ Firefox has the necessary permissions to access the internet.</p>
        <p>6. If the issue persists, please contact our support team for further assistance.</p>
        <p>We apologize for the inconvenience and appreciate your patience</p>
        <Button onClick={() => reset()} className="text-left w-fit">
          Try again
        </Button>
      </div>
    </div>
  );
}
