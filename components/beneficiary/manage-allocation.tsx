import Link from 'next/link';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { BENEFICIARY_INFO_URL } from '@/config/path';
import { Button } from '../ui/button';
import { PencilIcon } from '../icons';
import { Separator } from '../ui/separator';
// import { BeneficiaryRow } from '@/app/(dashboard)/beneficiary/columns';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);

interface ManageAllocationProps {
  beneficiary: {
    sharePercentage: number;
    name: string;
    email: string;
    notifyBeneficiary: boolean;
    full_wallet_address: string;
  };
  totalValue: number;
}

export default function ManageAllocation({ beneficiary, totalValue }: ManageAllocationProps) {
  const allocatedValue = Number(((totalValue * beneficiary.sharePercentage) / 100).toFixed(2));

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4 flex space-x-2 justify-between">
        <div className="space-y-4">
          <div>
            <p className="text-muted-foreground text-sm">Available Balance</p>
            <h2 className="text-4xl font-medium text-inverse">{formatCurrency(totalValue)}</h2>
          </div>
          <div className="bg-white/5 py-2 px-4 rounded-md w-fit">
            <p className="text-muted text-sm">
              Allocated to {beneficiary.name}: <span className="font-medium text-inverse">{formatCurrency(allocatedValue)}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-primary bg-primary/20 p-2">
          <span className="text-inverse text-sm font-medium">{beneficiary.sharePercentage}%</span>
        </div>
      </div>

      <h3 className="text-lg font-medium text-inverse">Beneficiary</h3>
      <div className="space-y-4 bg-card border rounded-lg p-4">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="bg-card shadow">
              <AvatarFallback>{beneficiary.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="font-medium text-inverse">{beneficiary.name}</span>
          </div>
          <Link href={BENEFICIARY_INFO_URL}>
            <Button variant="ghost" size="sm" className="bg-card text-xs text-inverse px-2 py-0.5 h-7" startIcon={<PencilIcon />}>
              Edit
            </Button>
          </Link>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <div className="grid grid-cols-2">
            <span className="mr-2">Email:</span>
            <span className="text-inverse flex justify-end">{beneficiary.email || 'N/A'}</span>
          </div>
          <div className="grid grid-cols-2">
            <span className="mr-2">Wallet:</span>
            <span className="text-inverse font-mono flex justify-end">{beneficiary.full_wallet_address}</span>
          </div>
        </div>

        <Separator />

        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            Notified: <span className="text-inverse font-medium">{beneficiary.notifyBeneficiary ? 'Yes' : 'No'}</span>
          </p>
          <p>
            Allocation: <span className="text-inverse font-medium">{beneficiary.sharePercentage}%</span>
          </p>
        </div>
      </div>

      <Button asChild>
        <Link href={BENEFICIARY_INFO_URL}>Adjust allocation</Link>
      </Button>
    </div>
  );
}
