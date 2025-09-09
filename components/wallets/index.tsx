import { ReactNode, useState } from 'react';
import { SelectWallet } from './select-wallet';
import SelectNewWallet, { ConfirmWalletSelection } from './select-new-wallet';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '../ui/separator';
import { ArrowLeft } from '../icons';
import { CreateUsernameForm } from '../forms/create-username-form';
import WalletSuccess from './wallet-success';
import Introduction from '../beneficiary/introduction';

type IAddWalletContent = {
  setCurrentStage: (arg: number) => void;
  currentStage: number;
};

export default function AddWalletContent({ setCurrentStage, currentStage }: IAddWalletContent) {
  const [selectedWallet, setSelectedWallet] = useState<ISelectedWallet | null>(null);

  const showHeader = ![4, 5].includes(currentStage);

  const EachStage: Record<number, ReactNode> = {
    0: <SelectWallet handleNext={() => setCurrentStage(1)} />,
    1: (
      <SelectNewWallet
        type="existing"
        handleNext={(wallet) => {
          setSelectedWallet(wallet);
          setCurrentStage(2);
        }}
      />
    ),
    2: (
      <ConfirmWalletSelection
        selectedWallet={selectedWallet}
        handleBack={() => {
          setSelectedWallet(null);
          setCurrentStage(1);
        }}
        handleNext={() => setCurrentStage(3)}
      />
    ),
    3: <CreateUsernameForm handleNext={() => setCurrentStage(4)} />,
    4: <WalletSuccess handleNext={() => setCurrentStage(5)} />,
    5: <Introduction handleNext={() => setCurrentStage(6)} className="mt-2" />,
  };

  return (
    <>
      {showHeader && (
        <SheetHeader>
          <div className="flex space-x-2 items-center">
            {currentStage > 0 && (
              <ArrowLeft role="navigation" className="cursor-pointer" aria-label="navigate backward" onClick={() => setCurrentStage(currentStage - 1)} />
            )}
            <SheetTitle>Add Wallets</SheetTitle>
          </div>
          <Separator />
        </SheetHeader>
      )}
      <div className="px-4">{EachStage[currentStage]}</div>
    </>
  );
}
