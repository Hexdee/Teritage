import { Search } from 'lucide-react';
import { Input } from './input';
import { cn } from '@/lib/utils';

export default function SearchInput({ inputClassName }: { inputClassName?: string }) {
  return (
    <div className="relative">
      <Input type="search" placeholder="Search" className={cn('pl-8', inputClassName)} />
      <Search className="text-muted-foreground absolute top-1/3 left-2" size={18} />
    </div>
  );
}
