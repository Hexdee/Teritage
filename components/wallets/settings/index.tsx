import { BeneficiaryIconRounded, CopyIcon, DeleteIconRounded, WalletIconRounded } from '@/components/icons';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface IWalletSettings {
  setCurrentStage: (arg: number) => void;
}

export default function WalletSettings({ setCurrentStage }: IWalletSettings) {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div className="space-y-10">
      <div className="p-1 border-2 border-primary rounded-md cursor-pointer hover:border-primary/95">
        <div className="bg-primary rounded-md p-4 space-y-12 hover:bg-primary/95 transition">
          <div className="flex space-x-2 items-center">
            <Image src="/coinbase.png" alt="coinbase" width={24} height={24} />
            <p>Coinbase</p>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="text-inverse font-medium">Mayor</p>
              <p className="text-muted-foreground">$2,345.555</p>
            </div>
            <div className="flex space-x-0.5 items-center text-inverse bg-[#F2F2F21A] text-sm p-2 rounded-full">
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
            <p className="text-muted">Mayor</p>
            <ChevronRight size={20} />
          </div>
        </div>

        <div className="flex justify-between items-center cursor-pointer" onClick={() => setCurrentStage(8)}>
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
