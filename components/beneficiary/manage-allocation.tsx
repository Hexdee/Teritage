import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { PencilIcon } from '../icons';
import { Separator } from '../ui/separator';
import { Slider } from '@/components/ui/slider';
import { useState } from 'react';
import { updateTeritagePlanApi } from '@/config/apis';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { TERITAGES_KEY } from '@/config/key';
import ShowError from '../errors/display-error';
import { UpdateTeritagePlanRequest } from '@/type';
import { useInheritancePlanStore } from '@/store/useInheritancePlanStore';
import { useApplications } from '@/context/dashboard-provider';
import { transformBeneficiaries } from '@/lib/utils';

const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);

interface ManageAllocationProps {
  beneficiary:
    | {
        sharePercentage: number;
        name: string;
        email: string;
        notifyBeneficiary: boolean;
        full_wallet_address: string;
      }
    | any;
  totalValue: number;
  setCurrentStage: (arg: number) => void;
}

export default function ManageAllocation({ beneficiary, totalValue, setCurrentStage }: ManageAllocationProps) {
  const queryClient: any = useQueryClient();
  const { teritageData } = useApplications();
  const allocatedValue = Number(((totalValue * beneficiary.sharePercentage) / 100).toFixed(2));
  const [newAllocation, setNewAllocation] = useState<number[]>([beneficiary.sharePercentage]);
  const [errorField, setErrorField] = useState<string | null>(null);
  const { setBeneficiaries } = useInheritancePlanStore();

  const { mutate, isPending } = useMutation({
    mutationFn: updateTeritagePlanApi,
    onSuccess: () => {
      queryClient.invalidateQueries(TERITAGES_KEY);
      toast.success('Plan updated successfully');
      setErrorField(null);
      setCurrentStage(1);
    },
    onError: (error: any) => setErrorField(error?.response?.data?.message || 'An error occured while processing'),
  });

  console.log({ teritageData });

  const handleChangeAllocation = () => {
    setErrorField(null);
    const inheritors = teritageData?.plan.inheritors.map((item) => {
      if (item.email === beneficiary.email) {
        return { ...item, sharePercentage: newAllocation[0] };
      }
      return item;
    });

    const totalShare = inheritors?.reduce((acc, item) => acc + (Number(item.sharePercentage) || 0), 0);
    if (totalShare && totalShare > 100) {
      setErrorField('Total share cannot exceed 100%');
    } else {
      console.log(inheritors);

      const payload: UpdateTeritagePlanRequest = {
        inheritors,
        tokens: teritageData?.plan.tokens as any,
        checkInIntervalSeconds: teritageData?.plan.checkInIntervalSeconds,
        socialLinks: teritageData?.plan.socialLinks,
        notifyBeneficiary: teritageData?.plan.notifyBeneficiary,
      };

      mutate(payload);
    }
  };

  const handleSelectEdit = () => {
    setCurrentStage(3);
    if (teritageData?.plan) {
      setBeneficiaries(transformBeneficiaries([{ ...beneficiary, address: beneficiary.full_wallet_address }]));
    }
  };

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

          <Button variant="ghost" size="sm" className="bg-card text-xs text-inverse px-2 py-0.5 h-7" startIcon={<PencilIcon />} onClick={handleSelectEdit}>
            Edit
          </Button>
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
        <Separator />

        <div className="text-sm text-muted-foreground space-y-2">
          <p>Allotted Percentage</p>
          <div className="flex items-center gap-4">
            <div className="bg-[#F2F2F20D] w-[90%] p-2.5 py-4 rounded-md">
              <Slider defaultValue={newAllocation} max={100} step={1} onValueChange={(value) => setNewAllocation(value)} />
            </div>
            <div className="bg-[#F2F2F20D] w-[10%] p-2.5 py-4 rounded-md text-white flex items-center justify-center">{newAllocation[0]}%</div>
          </div>
        </div>
      </div>

      <ShowError error={errorField} setError={setErrorField} />

      <Button onClick={handleChangeAllocation} loadingText="Please wait..." isLoading={isPending}>
        Save changes
      </Button>
    </div>
  );
}
