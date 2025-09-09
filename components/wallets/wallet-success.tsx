import Image from 'next/image';
import { Button } from '../ui/button';
import { Label } from '../ui/label';

export default function WalletSuccess({ handleNext }: INextPage) {
  return (
    <div className="space-y-4">
      <div className="text-muted text-center space-y-4 max-h-[400px]">
        <Image src="/success.png" alt="success" width={600} height={400} className="-mt-24" />
        <h1>Wallet Connected Successfully</h1>
      </div>

      <Label className="text-white">Information</Label>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <p className="text-white">Wallet</p>
        <div className="flex space-x-2 justify-end">
          <Image src="/wallet-1.png" alt="wallet" width={20} height={20} />
          <p className="text-muted">Coinbase</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <p className="text-white">Address</p>
        <div className="flex space-x-2 justify-end">
          <Image src="/wallet-1.png" alt="wallet" width={20} height={20} />
          <p className="text-muted">0x3A9...F6D1</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <p className="text-white">Tokens</p>
        <div className="flex space-x-2 justify-end">
          <Image src="/wallet-collection.png" alt="wallet collections" width={44} height={20} />
        </div>
      </div>

      <Button className="w-full" onClick={handleNext}>
        Continue
      </Button>
    </div>
  );
}
