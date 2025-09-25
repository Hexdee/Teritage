/* eslint-disable @typescript-eslint/no-unused-expressions */
'use client';
import { ArrowLeft, ChangePasswordIcon, ChangePinIcon } from '@/components/icons';
import { ChevronRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { ChangePasswordForm } from '@/components/forms/change-password-form';
import { ChangePinForm, ChangePinForm2 } from '@/components/forms/change-pin-form';

export default function Security() {
  const [openPasswordChange, setOpenPasswordChange] = useState<boolean>(false);
  const [openPinChange, setOpenPinChange] = useState<boolean>(false);
  const [showStage2, setShowStage2] = useState<boolean>(false);
  const [count, setCount] = useState(0);

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b font-medium text-xl">
        <h1>Security</h1>
      </div>

      <div className="space-y-8">
        <Sheet open={openPasswordChange} onOpenChange={setOpenPasswordChange}>
          <SheetTrigger asChild>
            <div className="flex justify-between w-full items-center cursor-pointer" role="button">
              <div className="flex items-center space-x-2">
                <ChangePasswordIcon />
                <p>Change Password</p>
              </div>
              <ChevronRight size={20} />
            </div>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <div className="flex space-x-2 items-center">
                <ArrowLeft role="navigation" className="cursor-pointer" aria-label="navigate backward" onClick={() => setOpenPasswordChange(false)} />

                <SheetTitle>Change Password</SheetTitle>
              </div>
              <Separator />
            </SheetHeader>

            <ChangePasswordForm />
          </SheetContent>
        </Sheet>

        <Sheet open={openPinChange} onOpenChange={setOpenPinChange}>
          <SheetTrigger asChild>
            <div className="flex justify-between w-full items-center cursor-pointer" role="button">
              <div className="flex items-center space-x-2">
                <ChangePinIcon />
                <p>Change PIN</p>
              </div>
              <ChevronRight size={20} />
            </div>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <div className="flex space-x-2 items-center">
                <ArrowLeft
                  role="navigation"
                  className="cursor-pointer"
                  aria-label="navigate backward"
                  onClick={() => {
                    count === 0 ? setOpenPinChange(false) : setShowStage2(false);
                    setCount(0);
                  }}
                />

                <SheetTitle>Change PIN</SheetTitle>
              </div>
              <Separator />
            </SheetHeader>

            <div className="px-4">{showStage2 ? <ChangePinForm2 /> : <ChangePinForm setCount={setCount} setShowStage2={setShowStage2} />}</div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
