import { Button } from '@/components/ui/button';
import { INHERITANCE_SETUP_URL } from '@/config/path';
import Link from 'next/link';

export default function Introduction() {
  return (
    <div className="space-y-6">
      <div className="bg-muted w-[60px] h-[60px] rounded-full" />
      <div className="space-y-2">
        <h1 className="text-white font-medium text-2xl">Inheritance</h1>
        <p className="text-muted-foreground">
          If you die or lose your recovery phrase, your crypto is gone forever. Inheritance keeps it safe for those you trust.
        </p>
      </div>
      <div className="space-y-2">
        <h1 className="text-white font-medium text-2xl">How it works:</h1>
        <div className="flex space-x-2 items-center">
          <div className="bg-muted w-2 h-2 rounded-full" />
          <p className="text-muted-foreground">Assign a trusted beneficiary.</p>
        </div>

        <div className="flex space-x-2 items-center">
          <div className="bg-muted w-2 h-2 rounded-full" />
          <p className="text-muted-foreground">Choose how often we should confirm check-in.</p>
        </div>

        <div className="flex space-x-2 items-center">
          <div className="bg-muted w-2 h-2 rounded-full" />
          <p className="text-muted-foreground">Assets are executed under your conditions.</p>
        </div>
      </div>

      <Link href={INHERITANCE_SETUP_URL}>
        <Button className="w-full">Set Up Inheritance</Button>
      </Link>
    </div>
  );
}
