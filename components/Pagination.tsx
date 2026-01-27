import React from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Check } from 'lucide-react';
import classNames from 'classnames';
import { PaginationMeta } from '@/types';
import { Dropdown } from './Dropdown';

export interface PaginationProps {
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
  showItemsPerPage?: boolean;
  className?: string;
  disabled?: boolean;
  // Legacy props for backward compatibility
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  itemsPerPage?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  meta,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 50, 100],
  showItemsPerPage = true,
  className,
  disabled = false,
  // Legacy props
  currentPage: legacyCurrentPage,
  totalPages: legacyTotalPages,
  totalItems: legacyTotalItems,
  itemsPerPage: legacyItemsPerPage = 10,
}) => {
  // Use meta if provided, otherwise fall back to legacy props
  const currentPage = meta?.page ?? legacyCurrentPage ?? 1;
  const totalPages = meta?.pageCount ?? legacyTotalPages;
  const totalItems = meta?.total ?? legacyTotalItems;
  const itemsPerPage = meta?.perPage ?? legacyItemsPerPage;
  const hasPrevPage = meta?.hasPrevPage ?? (currentPage > 1);
  const hasNextPage = meta?.hasNextPage ?? (currentPage < (totalPages ?? 1));
  const pagingCounter = meta?.pagingCounter ?? ((currentPage - 1) * itemsPerPage + 1);
  
  // Calculate total pages if not provided
  const calculatedTotalPages = totalPages ?? (totalItems ? Math.ceil(totalItems / itemsPerPage) : 1);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;
    
    if (calculatedTotalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= calculatedTotalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 4) {
        // Near the beginning
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(calculatedTotalPages);
      } else if (currentPage >= calculatedTotalPages - 3) {
        // Near the end
        pages.push('ellipsis');
        for (let i = calculatedTotalPages - 4; i <= calculatedTotalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('ellipsis');
        pages.push(calculatedTotalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const startItem = pagingCounter;
  const endItem = totalItems ? Math.min(pagingCounter + itemsPerPage - 1, totalItems) : undefined;

  const handlePrevious = () => {
    if (disabled || !hasPrevPage) return;
    
    if (meta?.previousPage !== null && meta?.previousPage !== undefined) {
      onPageChange(meta.previousPage);
    } else if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (disabled || !hasNextPage) return;
    
    if (meta?.nextPage !== null && meta?.nextPage !== undefined) {
      onPageChange(meta.nextPage);
    } else if (currentPage < calculatedTotalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number | string) => {
    if (disabled) return;
    if (typeof page === 'number') {
      onPageChange(page);
    }
  };

  const handleItemsPerPageChange = (option: number) => {
    if (disabled) return;
    onItemsPerPageChange?.(option);
  };

  return (
    <div className={classNames('flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 bg-slate-50', className, {
      'opacity-50 pointer-events-none': disabled,
    })}>
      {/* Items info */}
      <div className={classNames('text-sm', {
        'text-slate-600': !disabled,
        'text-slate-400': disabled,
      })}>
        {totalItems !== undefined && startItem !== undefined && endItem !== undefined ? (
          <span>
            Showing <span className="font-bold text-slate-800">{startItem}</span> to{' '}
            <span className="font-bold text-slate-800">{endItem}</span> of{' '}
            <span className="font-bold text-slate-800">{totalItems}</span> results
          </span>
        ) : (
          <span>
            Page <span className="font-bold text-slate-800">{currentPage}</span> of{' '}
            <span className="font-bold text-slate-800">{calculatedTotalPages}</span>
          </span>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Items per page selector */}
        {showItemsPerPage && onItemsPerPageChange && (
          <div className="flex items-center gap-2 mr-4">
            <span className={classNames('text-sm', {
              'text-slate-600': !disabled,
              'text-slate-400': disabled,
            })}>Show:</span>
            <Dropdown
            position="top"
              trigger={
                <button 
                  disabled={disabled}
                  className={classNames(
                    'flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 font-medium transition-colors',
                    {
                      'hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 cursor-pointer': !disabled,
                      'cursor-not-allowed opacity-50': disabled,
                    }
                  )}
                >
                  <span>{itemsPerPage}</span>
                  <ChevronDown size={16} className="text-slate-400" />
                </button>
              }
              items={itemsPerPageOptions.map((option) => ({
                label: `${option} per page`,
                value: option.toString(),
                icon: option === itemsPerPage ? <Check size={16} className="text-cyan-600" /> : undefined,
                onClick: () => handleItemsPerPageChange(option),
                className: option === itemsPerPage ? 'bg-cyan-50 text-cyan-600 font-bold' : '',
                disabled: disabled,
              }))}
              placement="bottom-left"
              menuClassName="min-w-[160px]"
            />
          </div>
        )}

        {/* Previous button */}
        <button
          onClick={handlePrevious}
          disabled={disabled || !hasPrevPage}
          className={classNames(
            'p-2 rounded-lg border transition-colors',
            {
              'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer': hasPrevPage && !disabled,
              'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed': !hasPrevPage || disabled,
            }
          )}
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-1.5 text-slate-400 font-medium"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => handlePageClick(pageNum)}
                disabled={disabled}
                className={classNames(
                  'min-w-[36px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  {
                    'bg-cyan-600 text-white': isActive && !disabled,
                    'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 cursor-pointer': !isActive && !disabled,
                    'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed': disabled,
                  }
                )}
                aria-label={`Go to page ${pageNum}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          disabled={disabled || !hasNextPage}
          className={classNames(
            'p-2 rounded-lg border transition-colors',
            {
              'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 cursor-pointer': hasNextPage && !disabled,
              'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed': !hasNextPage || disabled,
            }
          )}
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};
