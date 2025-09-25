import DataTable from '@/components/ui/data-table';
import { columns } from './columns';
import { CalenderIcon, MagicPenIcon } from '@/components/icons';

export default function ActivityPage() {
  const data = [
    { icon: <CalenderIcon />, type: 'Health Check-In', date: '10th August, 2025 • 9:04 AM', status: 'success' },
    { icon: <CalenderIcon />, type: 'Health Check-In', date: '10th August, 2025 • 9:04 AM', status: 'triggered' },
    { icon: <MagicPenIcon />, type: 'Wallet Added', date: '10th August, 2025 • 9:04 AM', status: 'success' },
  ];
  return (
    <div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
