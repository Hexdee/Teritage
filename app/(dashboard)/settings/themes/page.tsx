'use client';
import { AutomaticModeIcon, DarkModeIcon, LigthModeIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

export default function Theme() {
  const { setTheme, theme } = useTheme();

  const userThemes = [
    { name: 'Light', icon: <LigthModeIcon /> },
    { name: 'Dark', icon: <DarkModeIcon /> },
    { name: 'Automatic', icon: <AutomaticModeIcon /> },
  ];

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b font-medium text-xl">
        <h1>Theme</h1>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {userThemes.map((each) => (
          <div
            className={cn('bg-card p-4 w-fit rounded-md space-y-4 cursor-pointer', each.name.toLowerCase() === theme && 'border border-primary')}
            key={each.name}
            onClick={() => setTheme(each.name.toLowerCase())}
          >
            {each.icon}
            <p className="font-medium">{each.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
