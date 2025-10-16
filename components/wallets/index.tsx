import { ReactNode } from 'react';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '../ui/separator';
import { ArrowLeft } from '../icons';
import Introduction from '../beneficiary/introduction';
import BeneficiaryInfoForm from '../forms/beneficiary-info-form';
import TokenAllocation from '@/app/inheritance/token-allocation/page';
import { useApplications } from '@/context/dashboard-provider';
import SetUpInheritanceForm from '../forms/setup-inheritance-form';
import WalletSuccessPage from '@/app/inheritance/success/page';

export default function AddWalletContent() {
  const { setCurrentStage, currentStage, setOpenSheet } = useApplications();

  const showHeader = ![4, 5].includes(currentStage);

  const EachTitle: Record<number, string> = {
    6: 'Wallet Settings',
    7: 'Wallet Name',
    8: 'Beneficiary Information',
  };

  // const EachStage: Record<number, ReactNode> = {
  //   0: <SelectWallet handleNext={() => setCurrentStage(1)} handleViewWallet={() => setCurrentStage(6)} />,
  //   1: (
  //     <SelectNewWallet
  //       handleNext={(wallet) => {
  //         setSelectedWallet(wallet);
  //         setCurrentStage(2);
  //       }}
  //     />
  //   ),
  //   2: (
  //     <ConfirmWalletSelection
  //       selectedWallet={selectedWallet}
  //       handleBack={() => {
  //         setSelectedWallet(null);
  //         setCurrentStage(1);
  //       }}
  //       handleNext={() => setCurrentStage(3)}
  //     />
  //   ),
  //   3: <CreateUsernameForm handleNext={() => setCurrentStage(4)} />,
  //   4: <WalletSuccess handleNext={() => setCurrentStage(5)} />,
  //   5: <Introduction handleNext={() => setCurrentStage(6)} className="mt-2" />,
  //   6: <WalletSettings setCurrentStage={setCurrentStage} />,
  //   7: <CreateUsernameForm handleNext={() => setCurrentStage(6)} />,
  //   8: <BeneficiaryInfoForm handleNext={() => setCurrentStage(6)} />,
  // };

  const EachStage: Record<number, ReactNode> = {
    0: <Introduction handleNext={() => setCurrentStage(1)} className="mt-2" />,
    1: <SetUpInheritanceForm handleNext={() => setCurrentStage(2)} />,
    2: <BeneficiaryInfoForm handleNext={() => setCurrentStage(3)} />,
    3: <TokenAllocation handleNext={() => setCurrentStage(4)} />,
    4: (
      <WalletSuccessPage
        handleNext={() => {
          setOpenSheet(false);
          setCurrentStage(0);
        }}
      />
    ),
  };

  return (
    <>
      {showHeader && (
        <SheetHeader>
          <div className="flex space-x-2 items-center">
            {currentStage > 0 && (
              <ArrowLeft role="navigation" className="cursor-pointer" aria-label="navigate backward" onClick={() => setCurrentStage(currentStage - 1)} />
            )}
            <SheetTitle>{EachTitle[currentStage] || 'Add Wallets'}</SheetTitle>
          </div>
          <Separator />
        </SheetHeader>
      )}
      <div className="px-4 overflow-y-auto">{EachStage[currentStage]}</div>
    </>
  );
}
