'use client';

import { WebContextType } from '@/type';
import React, { createContext, useContext } from 'react';

const WebContext = createContext<WebContextType | undefined>(undefined);

export function WebProvider({ children }: { children: React.ReactNode }) {
  return (
    <WebContext.Provider
      value={{
        user: '',
      }}
    >
      {children}
    </WebContext.Provider>
  );
}

export function useApplications() {
  const ctx = useContext(WebContext);
  if (!ctx) {
    throw new Error('useApplications must be used within an WebProvider');
  }
  return ctx;
}
