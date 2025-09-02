import { Search } from 'lucide-react';
import { Input } from './input';

export default function SearchInput() {
  return (
    <div className="relative">
      <Input type="search" placeholder="Search" className="pl-8" />
      <Search className="text-muted-foreground absolute top-1/3 left-2" size={18} />
    </div>
  );
}
