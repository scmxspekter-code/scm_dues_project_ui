import { useState, useEffect, useRef, useCallback } from 'react';
import { Member, PaginationMeta, DefaultersStats, MessageLog, isApiError } from '../types';
import {
  setDefaulters,
  toggleDefaulterDrawer,
  setSelectedDefaulter as setSelectedDefaulterAction,
} from '@/store/slices/defaultersSlice';
import { $api } from '@/api';
import { IReportParams } from '@/api/defaulter.repository';
import { useAppDispatch } from '@/store/hooks';
import { debounce } from '@/utils/debounce';
import toast from 'react-hot-toast';

export type SortField = 'amount' | 'createdAt' | 'name';
export type SortOrder = 'asc' | 'desc';

export const useDefaulters = () => {
  const [apiState, setApiState] = useState({
    defaulters: false,
    defaultersReport: false,
    markAsDefaulted: false,
    getDefaultersStats: false,
    sendRemindersBulk: false,
  });
  const dispatch = useAppDispatch();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | undefined>(undefined);
  const [sortField, setSortField] = useState<SortField>('amount');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [debouncedSortField, setDebouncedSortField] = useState<SortField>('amount');
  const [debouncedSortOrder, setDebouncedSortOrder] = useState<SortOrder>('desc');
  const [isBulkReminderModalOpen, setIsBulkReminderModalOpen] = useState(false);

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
      setApiState((prev) => ({ ...prev, defaulters: true }));
      const response = await $api.defaulters.getDefaulters(params);
      dispatch(setDefaulters(response.data!));

      // Set pagination meta if available
      if (response.meta) {
        setPaginationMeta(response.meta);
      }
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to fetch defaulters');
      } else {
        toast.error('Failed to fetch defaulters');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, defaulters: false }));
    }
  };
  const getMessageHistory = useCallback(
    async (
      id: string,
      params?: { page?: number; limit?: number }
    ): Promise<MessageLog[] | undefined> => {
      try {
        const response = await $api.messaging.getMessageHistory(id, params);
        return response.data;
      } catch (error: unknown) {
        if (isApiError(error)) {
          toast.error(error.message || 'Failed to fetch message history');
        } else {
          toast.error('Failed to fetch message history');
        }
        throw error;
      }
    },
    []
  );
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
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      // Set new field with default desc order
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const setSelectedDefaulter = (defaulter: Member | null) => {
    dispatch(setSelectedDefaulterAction(defaulter));
  };

  const toggleDefaulterDrawerHandler = () => {
    dispatch(toggleDefaulterDrawer());
  };

  const markAsDefaulted = async (id: string, memberName?: string): Promise<void> => {
    // Show confirmation dialog
    if (
      !window.confirm(`Are you sure you want to mark ${memberName || 'this member'} as defaulted?`)
    ) {
      return;
    }

    try {
      setApiState((prev) => ({ ...prev, markAsDefaulted: true }));
      const { data } = await $api.members.markAsDefaulted(id);
      if (data) {
        // Refresh defaulters list
        await getDefaulters({
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearchTerm || undefined,
        });
        toast.success('Member marked as defaulted');
      }
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to mark as defaulted');
      } else {
        toast.error('Failed to mark as defaulted');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, markAsDefaulted: false }));
    }
  };

  const getDefaultersStats = async (): Promise<DefaultersStats | undefined> => {
    try {
      setApiState((prev) => ({ ...prev, getDefaultersStats: true }));
      const { data } = await $api.members.getDefaultersStats();
      return data;
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to fetch defaulters stats');
      } else {
        toast.error('Failed to fetch defaulters stats');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, getDefaultersStats: false }));
    }
  };

  const handleExport = async (): Promise<void> => {
    try {
      setApiState((prev) => ({ ...prev, defaultersReport: true }));

      // Use API export endpoint
      const blob = await $api.members.exportCollections({
        limit: 10000,
        search: debouncedSearchTerm || undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scm_defaulters_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Defaulters exported successfully');
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to export defaulters');
      } else {
        toast.error('Failed to export defaulters');
      }
    } finally {
      setApiState((prev) => ({ ...prev, defaultersReport: false }));
    }
  };

  // DefaulterActionModal logic
  const [reminderHistory, setReminderHistory] = useState<MessageLog[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<'sms' | 'whatsapp'>('whatsapp');

  const fetchReminderHistory = useCallback(
    async (memberId: string): Promise<void> => {
      if (!memberId) return;
      setIsLoadingHistory(true);
      try {
        const history = await getMessageHistory(memberId);
        setReminderHistory(history || []);
      } catch {
        setReminderHistory([]);
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [getMessageHistory]
  );

  const sendReminderToDefaulter = async (
    memberId: string,
    channel: 'sms' | 'whatsapp'
  ): Promise<void> => {
    setIsSendingReminder(true);
    try {
      await $api.members.sendReminder(memberId, channel);
      toast.success('Reminder sent successfully');
      // Refresh history after sending
      await fetchReminderHistory(memberId);
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to send reminder');
      } else {
        toast.error('Failed to send reminder');
      }
      throw error;
    } finally {
      setIsSendingReminder(false);
    }
  };

  const sendRemindersBulk = async (channel: 'sms' | 'whatsapp'): Promise<void> => {
    try {
      setApiState((prev) => ({ ...prev, sendRemindersBulk: true }));
      const { data } = await $api.members.sendRemindersBulk(channel);
      if (data) {
        toast.success(
          `Bulk reminders sent: ${data.sent} successful, ${data.failed} failed out of ${data.total} total`
        );
        // Refresh defaulters list
        await getDefaulters({
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearchTerm || undefined,
        });
      }
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to send bulk reminders');
      } else {
        toast.error('Failed to send bulk reminders');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, sendRemindersBulk: false }));
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    setSelectedDefaulter,
    toggleDefaulterDrawer: toggleDefaulterDrawerHandler,
    handleExport,
    markAsDefaulted,
    getDefaultersStats,
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
    sendRemindersBulk,
    isSendingBulkReminders: apiState.sendRemindersBulk,
    isBulkReminderModalOpen,
    setIsBulkReminderModalOpen,
    getMessageHistory,
    // DefaulterActionModal state and functions
    reminderHistory,
    isLoadingHistory,
    isSendingReminder,
    selectedChannel,
    setSelectedChannel,
    fetchReminderHistory,
    sendReminderToDefaulter,
  };
};
