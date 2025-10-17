import { Suspense } from 'react';
import { SetPasswordForm } from '@/components/forms/set-password-form';

export default function SetPassword() {
  return (
    <Suspense fallback={<div className="flex justify-center py-10 text-sm text-muted">Preparing password form...</div>}>
      <SetPasswordForm />
    </Suspense>
  );
}
