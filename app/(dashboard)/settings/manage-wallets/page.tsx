import { PencilIcon2 } from '@/components/icons';
import Image from 'next/image';

export default function Settings() {
  return (
    <div className="space-y-4 h-[50vh]">
      <div className="pb-4 border-b font-medium text-xl">
        <h1>Manage Wallets</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-1 border-2 border-primary rounded-md cursor-pointer hover:border-primary/95">
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

        <div className="p-1 border-2 border-primary rounded-md cursor-pointer hover:border-primary/95">
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

        <div className="bg-card rounded-md p-5 w-full flex flex-col items-center justify-center cursor-pointer hover:bg-card/80 transition" role="button">
          <span className="text-inverse text-3xl">+</span>
          <p className="text-inverse mt-2 text-lg">Add Wallet</p>
        </div>
      </div>
    </div>
  );
}
