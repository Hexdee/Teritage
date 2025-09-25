import Image from 'next/image';
import { Button } from '../ui/button';

export default function VerifyError() {
  return (
    <div className="bg-background flex justify-center p-4 rounded-lg">
      <div className="text-center space-y-4">
        <Image src="/alert.png" alt="Alert" width={80} height={80} className="mx-auto" />
        <h1 className="text-inverse text-lg">That’s Incorrect</h1>
        <p className="text-muted-foreground text-base">The code you entered is incorrect. Double-check and try again, or tap resend code.</p>
        <Button className="w-full">Try Again</Button>
      </div>
    </div>
  );
}
