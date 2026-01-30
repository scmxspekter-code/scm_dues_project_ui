import React, { ReactNode } from 'react';
import classNames from 'classnames';
import { TableSkeleton } from './Skeleton';

export interface TableColumn<T extends Record<string, unknown> = Record<string, unknown>> {
  header: string | ReactNode;
  accessor?: keyof T | ((row: T) => ReactNode);
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T extends Record<string, unknown> = Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyState?: ReactNode;
  loadingState?: ReactNode;
  onRowClick?: (row: T) => void;
  rowClassName?: string | ((row: T) => string);
  className?: string;
  containerClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  keyExtractor?: (row: T, index: number) => string | number;
}

export const Table = <T extends Record<string, unknown> = Record<string, unknown>>({
  columns,
  data,
  isLoading = false,
  emptyState,
  loadingState,
  onRowClick,
  rowClassName,
  className,
  containerClassName,
  headerClassName,
  bodyClassName,
  keyExtractor = (row: T, _index: number) => (row.id || row._id || _index) as string | number,
}: TableProps<T>) => {
  const renderCellContent = (column: TableColumn<T>, row: T, _index: number): ReactNode => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    if (column.accessor) {
      return row[column.accessor] as ReactNode;
    }
    return null;
  };

  const getRowClassName = (row: T, _index: number): string => {
    const baseClasses = 'hover:bg-slate-50/50 transition-colors group';
    const customClasses =
      typeof rowClassName === 'function' ? rowClassName(row) : rowClassName || '';
    return classNames(baseClasses, customClasses);
  };

  return (
    <div
      className={classNames(
        'flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden',
        containerClassName
      )}
    >
      <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0 scrollbar-hide -mx-px">
        <table className={classNames('w-full text-left min-w-[640px] sm:min-w-0', className)}>
          <thead
            className={classNames(
              'bg-slate-50 border-b border-slate-100 sticky top-0 z-10',
              headerClassName
            )}
          >
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={classNames(
                    'px-6 sm:px-8 py-4 sm:py-5 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap',
                    {
                      'text-left': column.align === 'left' || !column.align,
                      'text-center': column.align === 'center',
                      'text-right': column.align === 'right',
                    },
                    column.headerClassName || column.className
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={classNames('divide-y divide-slate-100', bodyClassName)}>
            {isLoading ? (
              <>
                {loadingState ? (
                  <tr>
                    <td colSpan={columns.length} className="px-3 sm:px-6 py-12 sm:py-20 text-center">
                      {loadingState}
                    </td>
                  </tr>
                ) : (
                  <TableSkeleton
                    columnCount={columns.length}
                    rowCount={10}
                    variant="member"
                  />
                )}
              </>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 sm:px-6 py-12 sm:py-20 text-center">
                  {emptyState || (
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-slate-50 p-4 rounded-full mb-4">
                        <svg
                          className="text-slate-300"
                          width={40}
                          height={40}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.35-4.35" />
                        </svg>
                      </div>
                      <h5 className="font-bold text-slate-800 text-sm">No data found</h5>
                      <p className="text-slate-400 text-sm">Try adjusting your filters.</p>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={keyExtractor(row, index)}
                  onClick={() => onRowClick?.(row)}
                  className={classNames(getRowClassName(row, index), {
                    'cursor-pointer': !!onRowClick,
                  })}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={classNames(
                        'px-6 sm:px-8 py-4 sm:py-5 text-sm',
                        {
                          'text-left': column.align === 'left' || !column.align,
                          'text-center': column.align === 'center',
                          'text-right': column.align === 'right',
                        },
                        column.cellClassName,
                        column.className
                      )}
                    >
                      {renderCellContent(column, row, index)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
