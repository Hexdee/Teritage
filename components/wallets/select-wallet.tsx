/* eslint-disable @next/next/no-img-element */
import type { ISelectWalletNextPage } from '@/type';
import { PencilIcon2 } from '../icons';
import { useApplications } from '@/context/dashboard-provider';
import EmptyState from '../ui/empty-state';

export const SelectWallet = ({ handleNext, handleViewWallet }: ISelectWalletNextPage) => {
  const { walletsTokenData, userProfile } = useApplications();

  const tokens = walletsTokenData?.tokens ?? [];

  return (
    <>
      {walletsTokenData && tokens.length === 0 && <EmptyState />}
      {walletsTokenData && tokens.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {tokens.map((token, index) => (
            <div
              className="p-1 border-2 border-primary rounded-md cursor-pointer hover:border-primary/95"
              onClick={() => handleViewWallet(token)}
              key={token.name + index}
            >
              <div className="bg-primary rounded-md p-4 space-y-8 hover:bg-primary/95 transition">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2 items-center">
                    <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${token.symbol || token.name}`} alt="logo" className="rounded-full h-6 w-6" />
                    <p>{token.name}</p>
                  </div>
                  <PencilIcon2 width={18} height={18} />
                </div>

                <div>
                  <p className="font-medium capitalize">{userProfile?.username || userProfile?.name}</p>
                  <p className="text-muted/70">${token.priceUsd}</p>
                </div>
              </div>
            </div>
          ))}

          <button
            className="bg-card rounded-md p-5 w-full flex flex-col items-center justify-center cursor-default hover:bg-card/80 transition opacity-40"
            onClick={handleNext}
            role="button"
            disabled
          >
            <span className="text-inverse text-3xl">+</span>
            <p className="text-inverse mt-2 text-lg">Add Wallet</p>
          </button>
        </div>
      )}
    </>
  );
};
