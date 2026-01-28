import { useState, useEffect, useRef, useCallback } from 'react';
import { PaymentRecord, PaginationMeta, isApiError, IApiParams } from '../types';
import { $api } from '@/api';
import { debounce } from '@/utils/debounce';
import toast from 'react-hot-toast';

export const usePayments = () => {
  // API state
  const [apiState, setApiState] = useState({
    getPayments: false,
    exportPayments: false,
  });

  // Pagination & search state
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | undefined>(undefined);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'successful' | 'failed' | 'pending' | undefined>(undefined);
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});

  // Refs
  const isMountedRef = useRef(true);

  // Debounce search term
  const debouncedSetSearch = useRef(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
      setCurrentPage(1); // Reset to page 1 when search changes
    }, 500)
  ).current;

  // Update debounced search when searchTerm changes
  useEffect(() => {
    debouncedSetSearch(searchTerm);
  }, [searchTerm, debouncedSetSearch]);

  // API functions
  const getPayments = useCallback(async (params: IApiParams) => {
    try {
      setApiState((prev) => ({ ...prev, getPayments: true }));
      const response = await $api.payments.getPayments(params);
      
      if (isMountedRef.current && response.data) {
        setPayments(response.data);
        
        // Set pagination meta if available
        if (response.meta) {
          setPaginationMeta(response.meta);
        }
      }
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to fetch payments');
      } else {
        toast.error('Failed to fetch payments');
      }
      if (isMountedRef.current) {
        setPayments([]);
      }
    } finally {
      if (isMountedRef.current) {
        setApiState((prev) => ({ ...prev, getPayments: false }));
      }
    }
  }, []);

  // Fetch payments effect
  useEffect(() => {
    isMountedRef.current = true;
    
    const params: IApiParams = {
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearchTerm || undefined,
      status: statusFilter,
    };

    getPayments(params);

    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, debouncedSearchTerm, statusFilter, getPayments]);

  // Handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const exportPayments = async (): Promise<void> => {
    try {
      setApiState((prev) => ({ ...prev, exportPayments: true }));
      const blob = await $api.exports.exportPayments({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm || undefined,
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payments-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Payments exported successfully');
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to export payments');
      } else {
        toast.error('Failed to export payments');
      }
    } finally {
      setApiState((prev) => ({ ...prev, exportPayments: false }));
    }
  };

  return {
    // State
    payments,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateRange,
    setDateRange,
    currentPage,
    itemsPerPage,
    paginationMeta,
    apiState,
    // Handlers
    handlePageChange,
    handleItemsPerPageChange,
    exportPayments,
  };
};
