/* eslint-disable react-hooks/exhaustive-deps */
import { ReactNode, useEffect, useState } from 'react';
import { SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '../ui/separator';
import { ArrowLeft } from '../icons';
import Introduction from '../beneficiary/introduction';
import BeneficiaryInfoForm from '../forms/beneficiary-info-form';
import TokenAllocation, { formatName } from '@/app/inheritance/token-allocation/page';
import { useApplications } from '@/context/dashboard-provider';
import SetUpInheritanceForm from '../forms/setup-inheritance-form';
import WalletSuccessPage from '@/app/inheritance/success/page';
import { SelectWallet } from './select-wallet';
import WalletSettings from './settings';
import { UpdateTeritagePlanRequest, WalletToken } from '@/type';
import { CreateUsernameForm } from '../forms/create-username-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTeritagePlanApi, userSetUsername } from '@/config/apis';
import { toast } from 'sonner';
import { TERITAGES_KEY, USER_PROFILE_KEY } from '@/config/key';
import { BeneficiaryEntry } from '@/store/useInheritancePlanStore';
import { getAddress } from 'viem';

export default function AddWalletContent() {
  const queryClient: any = useQueryClient();
  const { setCurrentStage, currentStage, openSheet, setOpenSheet, teritageData } = useApplications();
  const [currentWallet, setCurrentWallet] = useState<WalletToken | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const showHeader = ![4, 5].includes(currentStage);

  const { mutate, isPending } = useMutation({
    mutationFn: userSetUsername,
    onSuccess: () => {
      queryClient.invalidateQueries(USER_PROFILE_KEY);
      toast.success('Username updated successfully');
      setCurrentStage(6);
    },
    onError: (error: any) => setUsernameError(error?.response?.data?.message || 'An error occured while processing'),
  });

  const { mutate: mutatePlan, isPending: isMutating } = useMutation({
    mutationFn: updateTeritagePlanApi,
    onSuccess: () => {
      queryClient.invalidateQueries(TERITAGES_KEY);
      toast.success('Plan updated successfully');
      setCurrentStage(6);
    },
    onError: (error: any) => setUsernameError(error?.response?.data?.message || 'An error occured while processing'),
  });

  const handleMutatePlan = (values: BeneficiaryEntry[]) => {
    const payload: UpdateTeritagePlanRequest = {
      inheritors: values.map((beneficiary) => ({
        address: getAddress(beneficiary.walletAddress),
        sharePercentage: Math.round(beneficiary.sharePercentage),
        name: formatName(beneficiary),
        email: beneficiary.email.trim(),
      })),
      tokens: teritageData?.plan.tokens as any,
      checkInIntervalSeconds: teritageData?.plan.checkInIntervalSeconds,
      socialLinks: teritageData?.plan.socialLinks,
      notifyBeneficiary: teritageData?.plan.notifyBeneficiary,
    };

    mutatePlan(payload);
  };

  const handleUsernameNext = (values: { username: string }) => {
    setUsernameError(null);
    mutate(values);
  };

  const handleBack = () => {
    setCurrentStage(currentStage === 8 ? currentStage - 2 : currentStage - 1);
  };

  useEffect(() => {
    if (!openSheet) {
      setCurrentStage(0);
    }
  }, [openSheet]);

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
    0: (
      <SelectWallet
        handleNext={() => setCurrentStage(1)}
        handleViewWallet={(token) => {
          setCurrentWallet(token);
          setCurrentStage(6);
        }}
      />
    ),
    1: <Introduction handleNext={() => setCurrentStage(2)} className="mt-2" />,
    2: <SetUpInheritanceForm handleNext={() => setCurrentStage(3)} />,
    3: <BeneficiaryInfoForm handleNext={() => setCurrentStage(4)} />,
    4: <TokenAllocation handleNext={() => setCurrentStage(5)} />,
    5: (
      <WalletSuccessPage
        handleNext={() => {
          setOpenSheet(false);
          setCurrentStage(0);
        }}
      />
    ),
    6: <WalletSettings setCurrentStage={setCurrentStage} token={currentWallet} />,
    7: <CreateUsernameForm handleNext={handleUsernameNext} errorMessage={usernameError} setErrorMessage={setUsernameError} isLoading={isPending} />,
    8: <BeneficiaryInfoForm handleNext2={handleMutatePlan} isLoading={isMutating} />,

    // 2: (
    //   <ConfirmWalletSelection
    //     selectedWallet={selectedWallet}
    //     handleBack={() => {
    //       setSelectedWallet(null);
    //       setCurrentStage(1);
    //     }}
    //     handleNext={() => setCurrentStage(3)}
    //   />
    // ),
    // 3: (
    //   <CreateUsernameForm
    //     handleNext={handleUsernameNext(4)}
    //     errorMessage={usernameError}
    //     setErrorMessage={setUsernameError}
    //     isLoading={isUsernameLoading}
    //   />
    // ),
    // 4: <WalletSuccess handleNext={() => setCurrentStage(5)} />,
    // 5: <Introduction handleNext={() => setCurrentStage(6)} className="mt-2" />,
    // 6: <WalletSettings setCurrentStage={setCurrentStage} />,
    // 7: (
    // <CreateUsernameForm
    //   handleNext={handleUsernameNext(6)}
    //   errorMessage={usernameError}
    //   setErrorMessage={setUsernameError}
    //   isLoading={isUsernameLoading}
    // />
    // ),
    // 8: <BeneficiaryInfoForm handleNext={() => setCurrentStage(6)} />,
  };

  return (
    <>
      {showHeader && (
        <SheetHeader>
          <div className="flex space-x-2 items-center">
            {currentStage > 0 && <ArrowLeft role="navigation" className="cursor-pointer" aria-label="navigate backward" onClick={handleBack} />}
            <SheetTitle>{EachTitle[currentStage] || 'Add Wallets'}</SheetTitle>
          </div>
          <Separator />
        </SheetHeader>
      )}
      <div className="px-4 overflow-y-auto">{EachStage[currentStage]}</div>
    </>
  );
}
