import { useState, useEffect, useRef } from 'react';
import { Member, PaginationMeta, PaymentStatus } from '../types';
import { setDefaulters } from '@/store/slices/defaultersSlice';
import { $api } from '@/api';
import { IReportParams } from '@/api/defaulter.repository';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { debounce } from '@/utils/debounce';
import toast from 'react-hot-toast';

export type SortField = 'amount' | 'createdAt' | 'name';
export type SortOrder = 'asc' | 'desc';

export const useDefaulters = () => {
  const [apiState, setApiState] = useState({
    defaulters: false,
    defaultersReport: false,
  });
  const dispatch = useAppDispatch();
  const { defaulters } = useAppSelector((state) => state.defaulters);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | undefined>(undefined);
  const [selectedDefaulter, setSelectedDefaulter] = useState<Member | null>(null);
  const [sortField, setSortField] = useState<SortField>('amount');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [debouncedSortField, setDebouncedSortField] = useState<SortField>('amount');
  const [debouncedSortOrder, setDebouncedSortOrder] = useState<SortOrder>('desc');

  // Debounce search term
  const debouncedSetSearch = useRef(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
      setCurrentPage(1); // Reset to page 1 when search changes
    }, 500)
  ).current;

  // Debounce sort changes
  const debouncedSetSort = useRef(
    debounce((field: SortField, order: SortOrder) => {
      setDebouncedSortField(field);
      setDebouncedSortOrder(order);
      setCurrentPage(1); // Reset to page 1 when sort changes
    }, 300)
  ).current;

  // Update debounced search when searchTerm changes
  useEffect(() => {
    debouncedSetSearch(searchTerm);
  }, [searchTerm, debouncedSetSearch]);

  // Update debounced sort when sort changes
  useEffect(() => {
    debouncedSetSort(sortField, sortOrder);
  }, [sortField, sortOrder, debouncedSetSort]);

  const getDefaulters = async (params: IReportParams) => {
    try {
      setApiState(prev => ({...prev, defaulters: true}));
      const response = await $api.defaulters.getDefaulters(params);
      dispatch(setDefaulters(response.data!));
      
      // Set pagination meta if available
      if (response.meta) {
        setPaginationMeta(response.meta);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch defaulters');
      throw error;
    } finally {
      setApiState(prev => ({...prev, defaulters: false}));
    }
  };

  // Fetch defaulters when page, items per page, search term, or sort changes
  useEffect(() => {
    getDefaulters({
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearchTerm || undefined,
  
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, debouncedSearchTerm, debouncedSortField, debouncedSortOrder]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle order if same field
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default desc order
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleExport = async () => {
    try {
      setApiState(prev => ({...prev, defaultersReport: true}));
      
      // Fetch all defaulters for export (no pagination)
      const response = await $api.defaulters.getDefaulters({
        limit: 10000, // Large limit to get all
        search: debouncedSearchTerm || undefined,
      });

      const defaultersToExport = response.data || [];
      
      // Create CSV content
      const headers = "ID,Name,Phone Number,Amount Owed,Currency,Due Date,Payment Status,Reminder Frequency,Created At\n";
      const rows = defaultersToExport.map(d => {
        const escapeCSV = (value: any) => {
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          // Escape quotes and wrap in quotes if contains comma, newline, or quote
          if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        };

        return [
          escapeCSV(d.id),
          escapeCSV(d.name),
          escapeCSV(d.phoneNumber),
          escapeCSV(d.amount),
          escapeCSV(d.currency),
          escapeCSV(d.dueDate),
          escapeCSV(d.paymentStatus),
          escapeCSV(d.reminderFrequency),
          escapeCSV(d.createdAt),
        ].join(',');
      }).join('\n');

      const csvContent = headers + rows;
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scm_defaulters_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success('Defaulters exported successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to export defaulters');
    } finally {
      setApiState(prev => ({...prev, defaultersReport: false}));
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedDefaulter,
    setSelectedDefaulter,
    handleExport,
    currentPage,
    itemsPerPage,
    paginationMeta,
    handlePageChange,
    handleItemsPerPageChange,
    sortField,
    sortOrder,
    handleSort,
    isLoading: apiState.defaulters,
    isExporting: apiState.defaultersReport,
  };
};
