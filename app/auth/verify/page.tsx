import { Suspense } from 'react';
import { VerifyForm } from '@/components/forms/verify-form';

export default function Verify() {
  return (
    <Suspense fallback={<div className="flex justify-center py-10 text-sm text-muted">Loading verification form...</div>}>
      <VerifyForm />
    </Suspense>
  );
}
