import Image from 'next/image';
import { PencilIcon2 } from '../icons';

export const SelectWallet = ({ handleNext, handleViewWallet }: ISelectWalletNextPage) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-1 border-2 border-primary rounded-md cursor-pointer hover:border-primary/95" onClick={handleViewWallet}>
        <div className="bg-primary rounded-md p-4 space-y-8 hover:bg-primary/95 transition">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2 items-center">
              <Image src="/coinbase.png" alt="coinbase" width={24} height={24} />
              <p>Coinbase</p>
            </div>
            <PencilIcon2 width={18} height={18} />
          </div>

          <div>
            <p className="font-medium">Mayor</p>
            <p className="text-muted/70">$2,345.58</p>
          </div>
        </div>
      </div>

      <div
        className="bg-card rounded-md p-5 w-full flex flex-col items-center justify-center cursor-pointer hover:bg-card/80 transition"
        onClick={handleNext}
        role="button"
      >
        <span className="text-inverse text-3xl">+</span>
        <p className="text-inverse mt-2 text-lg">Add Wallet</p>
      </div>
    </div>
  );
};
