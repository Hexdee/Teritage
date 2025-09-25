/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Table as ReactTable, useReactTable, getCoreRowModel, getPaginationRowModel, flexRender } from '@tanstack/react-table';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import EmptyState from './empty-state';

interface DataTableProps {
  columns: any[];
  data: any[];
  handleClickRow?: (row: any) => void;
  headerClassName?: string;
  tableTitle?: string;
}

const DataTable = ({
  columns,
  data,
  //   className,
  //   pageSize,
  //   dataLength,
  handleClickRow,
  headerClassName,
  tableTitle,
}: //   handleChangePageSize,
DataTableProps) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    enableGlobalFilter: true,
    getPaginationRowModel: getPaginationRowModel(),
  });
  return (
    <Table className="">
      <TableHeader className="overflow-hidden whitespace-nowrap text-ellipsis">
        {tableTitle && (
          <div className="px-6 py-3">
            <h1 className="font-medium text-lg">{tableTitle}</h1>
          </div>
        )}
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id} className="dark:hover:bg-[#191919] hover:bg-white dark:border-b-[#292929] border-b-[#CCCCCC99] border-b w-full">
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id} className={cn(headerClassName, 'py-5 text-[#888888] text-sm font-light')}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody className="">
        {table?.getRowModel().rows?.length ? (
          table?.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && 'selected'}
              onClick={() => (handleClickRow ? handleClickRow(row) : null)}
              className={cn('dark:hover:bg-[#191919] hover:bg-white text-sm  text-inverse text-dark border-none', handleClickRow && 'cursor-pointer')}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="capitalize py-5 border-t">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow className="dark:hover:bg-[#191919] hover:bg-white">
            <TableCell colSpan={columns?.length} className="h-24 w-full">
              <EmptyState />
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default DataTable;
