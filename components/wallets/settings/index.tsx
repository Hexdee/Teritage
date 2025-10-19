/* eslint-disable @next/next/no-img-element */
import { BeneficiaryIconRounded, CopyIcon, DeleteIconRounded, WalletIconRounded } from '@/components/icons';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useApplications } from '@/context/dashboard-provider';
import { WalletToken } from '@/type';
import { copyToClipboard, transformBeneficiaries } from '@/lib/utils';
import { useInheritancePlanStore } from '@/store/useInheritancePlanStore';

interface IWalletSettings {
  setCurrentStage: (arg: number) => void;
  token: WalletToken | null;
}

export default function WalletSettings({ setCurrentStage, token }: IWalletSettings) {
  const [open, setOpen] = useState<boolean>(false);
  const { userProfile, teritageData } = useApplications();
  const { setBeneficiaries } = useInheritancePlanStore();

  const handleSelectBeneficiary = () => {
    setCurrentStage(8);
    if (teritageData?.plan) {
      setBeneficiaries(transformBeneficiaries(teritageData?.plan.inheritors));
    }
  };

  return (
    <div className="space-y-10">
      <div className="p-1 border-2 border-primary rounded-md cursor-pointer hover:border-primary/95">
        <div className="bg-primary rounded-md p-4 space-y-12 hover:bg-primary/95 transition">
          <div className="flex space-x-2 items-center">
            <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${token?.symbol || token?.name}`} alt="logo" className="rounded-full h-6 w-6" />
            <p className="text-white">{token?.name}</p>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-inverse font-medium capitalize">{token?.name || ''}</p>
              <p className="text-muted-foreground">${token?.priceUsd}</p>
            </div>
            <div
              className="flex space-x-0.5 items-center text-inverse bg-[#F2F2F21A] text-sm p-2 rounded-full cursor-pointer"
              onClick={() => copyToClipboard(token?.tokenId || '')}
              role="button"
            >
              <p>Copy Address</p>
              <CopyIcon />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="flex justify-between items-center cursor-pointer" onClick={() => setCurrentStage(7)}>
          <div className="flex space-x-2 items-center">
            <WalletIconRounded />
            <p className="font-medium">Wallet Name</p>
          </div>
          <div className="flex space-x-2 items-center">
            <p className="text-muted capitalize">{userProfile?.username || userProfile?.name}</p>
            <ChevronRight size={20} />
          </div>
        </div>

        <div className="flex justify-between items-center cursor-pointer" onClick={handleSelectBeneficiary}>
          <div className="flex space-x-2 items-center">
            <BeneficiaryIconRounded />
            <p className="font-medium">Beneficiary</p>
          </div>
          <ChevronRight size={20} />
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <div className="flex justify-between items-center cursor-pointer" role="button">
              <div className="flex space-x-2 items-center">
                <DeleteIconRounded />
                <p className="font-medium">Remove Wallet</p>
              </div>
              <ChevronRight size={20} />
            </div>
          </DialogTrigger>
          <DialogContent showCloseButton={false} className="space-y-4">
            <DialogHeader>
              <div className="flex justify-center w-full">
                <Image src="/delete.png" alt="delete" width={40} height={40} />
              </div>
              <DialogTitle className="text-center">Remove wallet</DialogTitle>
              <DialogDescription className="text-center">
                This action cannot be undone. This will permanently delete your wallet and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-4">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive">Yes, Remove</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
