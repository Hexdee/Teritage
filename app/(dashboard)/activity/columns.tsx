/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Image from 'next/image';
import { ReactNode } from 'react';
import { CheckMarkGreen } from '@/components/icons';

const columns: {
  accessorKey: string;
  header: string;
  key: string;
  cell?: (arg: any) => ReactNode;
}[] = [
  {
    accessorKey: 'type',
    header: 'Type',
    key: 'type',
    cell: ({ row }) => <TypeCell data={row.original} />,
  },
  {
    accessorKey: 'date',
    header: 'Date',
    key: 'date',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    key: 'status',
    cell: ({ row }) => <StatusCell data={row.original} />,
  },
];

export { columns };

interface IData {
  data: {
    type: string;
    icon: ReactNode;
    status: string;
  };
}

export const TypeCell = ({ data }: IData) => {
  return (
    <div className="space-x-2 flex items-center">
      <div className="rounded-full p-1 bg-card">{data.icon}</div>
      <p className="">{data.type}</p>
    </div>
  );
};

export const StatusCell = ({ data }: IData) => {
  const EachStatus: Record<string, ReactNode> = {
    success: (
      <div className="flex space-x-2 bg-[#00D77F1A] text-success w-fit px-2 py-1.5 rounded-md items-center">
        <CheckMarkGreen /> <p>Successful</p>
      </div>
    ),
    triggered: (
      <div className="flex space-x-2 bg-[#FF4D4F1A] text-destructive w-fit px-2 py-1.5 rounded-md items-center">
        <Image src="/health-check.png" alt="health check" width={20} height={15} /> <p>Triggered</p>
      </div>
    ),
  };

  return <div>{EachStatus[data.status]}</div>;
};
