/* eslint-disable @typescript-eslint/no-unused-expressions */
'use client';
import { ArrowLeft, ChangePasswordIcon, ChangePinIcon } from '@/components/icons';
import { ChevronRight } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { ChangePasswordForm } from '@/components/forms/change-password-form';
import { ChangePinForm, ChangePinForm2 } from '@/components/forms/change-pin-form';

export default function Security() {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [openPasswordChange, setOpenPasswordChange] = useState<boolean>(false);
  const [openPinChange, setOpenPinChange] = useState<boolean>(false);
  const [showStage2, setShowStage2] = useState<boolean>(false);
  const [count, setCount] = useState(0);
  const [verifiedPin, setVerifiedPin] = useState<string | null>(null);
  const [hasExistingPin, setHasExistingPin] = useState<boolean>(false);

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b font-medium text-xl">
        <h1>Security</h1>
      </div>

      <div className="space-y-8">
        {isDesktop ? (
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
                  <ArrowLeft
                    role="navigation"
                    className="cursor-pointer"
                    aria-label="navigate backward"
                    onClick={() => setOpenPasswordChange(false)}
                  />
                  <SheetTitle>Change Password</SheetTitle>
                </div>
                <Separator />
              </SheetHeader>
              <ChangePasswordForm />
            </SheetContent>
          </Sheet>
        ) : (
          <Drawer open={openPasswordChange} onOpenChange={setOpenPasswordChange}>
            <DrawerTrigger asChild>
              <div className="flex justify-between w-full items-center cursor-pointer" role="button">
                <div className="flex items-center space-x-2">
                  <ChangePasswordIcon />
                  <p>Change Password</p>
                </div>
                <ChevronRight size={20} />
              </div>
            </DrawerTrigger>
            <DrawerContent className="max-h-[90vh]">
              <DrawerHeader>
                <div className="flex space-x-2 items-center">
                  <ArrowLeft
                    role="navigation"
                    className="cursor-pointer"
                    aria-label="navigate backward"
                    onClick={() => setOpenPasswordChange(false)}
                  />
                  <DrawerTitle className="text-left">Change Password</DrawerTitle>
                </div>
                <Separator />
              </DrawerHeader>
              <div className="overflow-y-auto px-4 pb-10">
                <ChangePasswordForm />
              </div>
            </DrawerContent>
          </Drawer>
        )}

        {isDesktop ? (
          <Sheet
            open={openPinChange}
            onOpenChange={(value) => {
              setOpenPinChange(value);
              if (!value) {
                setShowStage2(false);
                setCount(0);
                setVerifiedPin(null);
                setHasExistingPin(false);
              }
            }}
          >
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
                      if (count === 0) {
                        setOpenPinChange(false);
                        setVerifiedPin(null);
                        setHasExistingPin(false);
                      } else {
                        setShowStage2(false);
                      }
                      setCount(0);
                    }}
                  />
                  <SheetTitle>Change PIN</SheetTitle>
                </div>
                <Separator />
              </SheetHeader>
              <div className="px-4">
                {showStage2 && verifiedPin !== null ? (
                  <ChangePinForm2
                    currentPin={verifiedPin}
                    hasExistingPin={hasExistingPin}
                    onCompleted={() => {
                      setOpenPinChange(false);
                      setShowStage2(false);
                      setCount(0);
                      setVerifiedPin(null);
                      setHasExistingPin(false);
                    }}
                  />
                ) : (
                  <ChangePinForm
                    setCount={setCount}
                    setShowStage2={setShowStage2}
                    onVerified={(pin, existing) => {
                      setVerifiedPin(existing ? pin : null);
                      setHasExistingPin(existing);
                    }}
                  />
                )}
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <Drawer
            open={openPinChange}
            onOpenChange={(value) => {
              setOpenPinChange(value);
              if (!value) {
                setShowStage2(false);
                setCount(0);
                setVerifiedPin(null);
                setHasExistingPin(false);
              }
            }}
          >
            <DrawerTrigger asChild>
              <div className="flex justify-between w-full items-center cursor-pointer" role="button">
                <div className="flex items-center space-x-2">
                  <ChangePinIcon />
                  <p>Change PIN</p>
                </div>
                <ChevronRight size={20} />
              </div>
            </DrawerTrigger>
            <DrawerContent className="max-h-[90vh]">
              <DrawerHeader>
                <div className="flex space-x-2 items-center">
                  <ArrowLeft
                    role="navigation"
                    className="cursor-pointer"
                    aria-label="navigate backward"
                    onClick={() => {
                      if (count === 0) {
                        setOpenPinChange(false);
                        setVerifiedPin(null);
                        setHasExistingPin(false);
                      } else {
                        setShowStage2(false);
                      }
                      setCount(0);
                    }}
                  />
                  <DrawerTitle className="text-left">Change PIN</DrawerTitle>
                </div>
                <Separator />
              </DrawerHeader>
              <div className="px-4 overflow-y-auto pb-10">
                {showStage2 && verifiedPin !== null ? (
                  <ChangePinForm2
                    currentPin={verifiedPin}
                    hasExistingPin={hasExistingPin}
                    onCompleted={() => {
                      setOpenPinChange(false);
                      setShowStage2(false);
                      setCount(0);
                      setVerifiedPin(null);
                      setHasExistingPin(false);
                    }}
                  />
                ) : (
                  <ChangePinForm
                    setCount={setCount}
                    setShowStage2={setShowStage2}
                    onVerified={(pin, existing) => {
                      setVerifiedPin(existing ? pin : null);
                      setHasExistingPin(existing);
                    }}
                  />
                )}
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    </div>
  );
}
