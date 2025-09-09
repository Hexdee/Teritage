'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';

import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ModeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <div className="border-none bg-card shadow-md flex rounded-full items-center w-[96px] p-1.5 justify-between">
      <Moon
        className={cn(
          'h-[2.2rem] text-muted-foreground w-[2.2rem] rotate-0 scale-100 transition-all p-2',
          theme === 'dark' && 'bg-card rounded-full text-white'
        )}
        onClick={() => setTheme('dark')}
        role="button"
      />

      <Sun
        className={cn(
          'h-[2.2rem] text-muted-foreground w-[2.2rem] rotate-0 scale-100 transition-all p-2',
          theme === 'light' && 'bg-card rounded-full text-white'
        )}
        onClick={() => setTheme('light')}
        role="button"
      />
    </div>
  );
}
