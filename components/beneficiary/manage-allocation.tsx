import Link from 'next/link';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { BENEFICIARY_INFO_URL } from '@/config/path';
import { Button } from '../ui/button';
import { PencilIcon } from '../icons';
import { Separator } from '../ui/separator';
import { Slider } from '../ui/slider';
import { useState } from 'react';

export default function ManageAllocation() {
  const [percentage, setPercentage] = useState<number[]>([0]);
  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4 flex space-x-2 justify-between">
        <div className="space-y-4">
          <div>
            <p className="text-muted-foreground text-sm">Available Balance</p>
            <h2 className="text-4xl font-medium text-inverse">
              $2,345<span className="text-muted-foreground">.58</span>
            </h2>
          </div>
          <div className="bg-white/5 py-2 px-4 rounded-md w-fit">
            <p className="text-muted text-sm">
              Unassigned Balance: <span className="font-medium text-inverse">$2,345.58</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-primary bg-primary/20 p-2">
          <span className="text-inverse text-sm font-medium">100%</span>
        </div>
      </div>

      <h3 className="text-lg font-medium text-inverse">Beneficiary</h3>
      <div className="space-y-4 bg-card border rounded-lg p-4">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="bg-card shadow">
              <AvatarFallback>PC</AvatarFallback>
            </Avatar>
            <span className="font-medium text-inverse">Papi Chuks</span>
          </div>
          <Link href={BENEFICIARY_INFO_URL}>
            <Button variant="ghost" size="sm" className="bg-card text-xs text-inverse px-2 py-0.5 h-7" startIcon={<PencilIcon />}>
              Edit
            </Button>
          </Link>
        </div>

        <div className="text-sm text-muted-foreground grid grid-cols-2">
          <span className="mr-2 ">EVM Wallet Address:</span>
          <span className="text-inverse font-mono flex justify-end">0x3A9...F6D1</span>
        </div>

        <Separator />

        <div>
          <p className="text-sm text-muted-foreground mb-2">Allotted Percentage</p>
          <div className="flex items-center gap-3">
            <div className="bg-card p-4 w-[85%] rounded-lg">
              <Slider value={percentage} onValueChange={setPercentage} max={100} step={1} className="flex-1" />
            </div>
            <div className="bg-card p-4 h-10 flex items-center justify-between w-[15%] rounded-lg">
              <p className="text-sm text-muted-foreground">{percentage[0]}%</p>
            </div>
          </div>
        </div>
      </div>

      <Button>Save changes</Button>
    </div>
  );
}
