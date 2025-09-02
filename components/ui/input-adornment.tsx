import { cn } from '@/lib/utils';
import { HTMLAttributes, ReactNode } from 'react';

type InputAdornmentProps = {
  adornment: ReactNode;
  position: 'start' | 'end';
  pointerEvents?: 'auto' | 'none';
} & HTMLAttributes<HTMLDivElement>;

const positionConfig = {
  start: 'left-6',
  end: 'right-6',
} as const;

const InputAdornment = ({ adornment, pointerEvents = 'auto', position, ...props }: InputAdornmentProps) => (
  <div
    className={cn(`absolute z-10 select-none`, positionConfig[position], pointerEvents === 'auto' ? 'pointer-events-auto' : 'pointer-events-none')}
    {...props}
  >
    {adornment}
  </div>
);

export default InputAdornment;
