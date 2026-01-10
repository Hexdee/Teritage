'use client';

import ClaimForm from '@/components/forms/claim-form';
import React from 'react';

export default function ClaimPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center">
      <div className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <ClaimForm />
      </div>
    </main>
  );
}
