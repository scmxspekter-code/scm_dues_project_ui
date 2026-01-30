import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  IApiParams,
  Member,
  PaymentStatus,
  PaginationMeta,
  ICreateMemberPayload,
  UpdateMemberPayload,
  PaymentLink,
  MessageLog,
  CollectionHistory,
  PaymentRecord,
  CreatePaymentLinksBulkPayload,
  isApiError,
} from '@/types';
import { $api } from '@/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setMembers,
  toggleAddMember,
  updateMember as updateMemberAction,
} from '@/store/slices/membersSlice';
import { toast } from 'react-hot-toast';
import { debounce } from '@/utils/debounce';
import { FormikHelpers } from 'formik';

export const useMembers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | undefined>(undefined);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberForEdit, setMemberForEdit] = useState<Member | null>(null);
  const dispatch = useAppDispatch();
  const { members, isAddMemberDrawerOpen } = useAppSelector((state) => state.members);
  const [apiState, setApiState] = useState({
    getMembers: false,
    createMember: false,
    updateMember: false,
    deleteMember: false,
    sendReminder: false,
    getReminderHistory: false,
    getCollectionHistory: false,
    getPaymentLink: false,
    createPaymentLink: false,
    markAsPaid: false,
    getCollectionPayments: false,
    createPaymentLinksBulk: false,
    getBirthdays: false,
    getAnniversaries: false,
    createMembersBulk: false,
  });
  const toggleAddMemberDrawerHandler = () => {
    dispatch(toggleAddMember());
  };

  const closeAddMemberDrawerHandler = () => {
    dispatch(toggleAddMember());
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const [statusFilter, setStatusFilter] = useState<PaymentStatus | undefined>(undefined);
  const [isBulkPaymentLinksModalOpen, setIsBulkPaymentLinksModalOpen] = useState(false);
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);

  const closeDetailDrawer = useCallback(() => setSelectedMember(null), []);
  const closeEditDrawer = useCallback(() => setMemberForEdit(null), []);
  const openEditDrawer = useCallback((m: Member) => {
    setSelectedMember(null);
    setMemberForEdit(m);
  }, []);

  // Memoize getMembers to prevent unnecessary recreations
  const getMembers = useCallback(
    async (params: IApiParams) => {
      try {
        setApiState((prev) => ({ ...prev, getMembers: true }));
        const response = await $api.members.getMembers(params);
        dispatch(setMembers(response.data!));
        if (response.meta) {
          setPaginationMeta(response.meta);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(error.message || 'Failed to fetch members');
        } else {
          toast.error('Failed to fetch members');
        }
        throw error;
      } finally {
        setApiState((prev) => ({ ...prev, getMembers: false }));
      }
    },
    [dispatch]
  );

  // Track previous params to prevent duplicate calls
  const prevParamsRef = useRef<IApiParams | null>(null);
  const isMountedRef = useRef(false);

  // Debounce search term efficiently using useRef to persist debounced function
  const debouncedSetSearchRef = useRef(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
      setCurrentPage(1);
    }, 500)
  );

  // Update debounced search term when searchTerm changes (skip on initial mount)
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    debouncedSetSearchRef.current(searchTerm);
  }, [searchTerm]);

  // Memoize params to prevent unnecessary API calls
  const params = useMemo<IApiParams>(
    () => ({
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearchTerm || undefined,
      status: statusFilter,
    }),
    [currentPage, itemsPerPage, debouncedSearchTerm, statusFilter]
  );

  // Fetch members - only when params actually change
  useEffect(() => {
    // Compare params object properties directly instead of JSON.stringify
    const prevParams = prevParamsRef.current;
    if (
      prevParams &&
      prevParams.page === params.page &&
      prevParams.limit === params.limit &&
      prevParams.search === params.search &&
      prevParams.status === params.status
    ) {
      return;
    }

    // Update ref and call getMembers
    prevParamsRef.current = { ...params };
    getMembers(params);
  }, [params, getMembers]);

  const createMembersBulk = async (payloads: ICreateMemberPayload[]): Promise<void> => {
    if (payloads.length === 0) return;
    try {
      setApiState((prev) => ({ ...prev, createMembersBulk: true }));
      const normalized = payloads.map((p) => ({
        ...p,
        phoneNumber: (p.phoneNumber || '').replace(/^0/, '+234'),
      }));
      await $api.members.createMember(normalized);
      const refreshParams: IApiParams = {
        page: 1,
        limit: itemsPerPage,
        search: debouncedSearchTerm || undefined,
        status: statusFilter,
      };
      prevParamsRef.current = { ...refreshParams };
      setCurrentPage(1);
      await getMembers(refreshParams);
      toast.success(`${payloads.length} member(s) created successfully`);
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to create members');
      } else {
        toast.error('Failed to create members');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, createMembersBulk: false }));
    }
  };

  const createMember = async (payload: ICreateMemberPayload,helpers:FormikHelpers<ICreateMemberPayload>): Promise<void> => {
    try {
      setApiState((prev) => ({ ...prev, createMember: true }));
      const newPayload = { ...payload, phoneNumber: payload.phoneNumber.replace(/^0/, '+234') };
      await $api.members.createMember([newPayload]);
      dispatch(toggleAddMember());

      const refreshParams: IApiParams = {
        page: 1,
        limit: itemsPerPage,
        search: debouncedSearchTerm || undefined,
        status: statusFilter,
      };

      // Update prevParamsRef to prevent useEffect from triggering again
      prevParamsRef.current = { ...refreshParams };
      setCurrentPage(1);
      await getMembers(refreshParams);

      toast.success('Member created successfully');
      helpers.resetForm();
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to create member');
      } else {
        toast.error('Failed to create member');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, createMember: false }));
    }
  };

  const updateMember = async (id: string, payload: UpdateMemberPayload): Promise<void> => {
    try {
      setApiState((prev) => ({ ...prev, updateMember: true }));
      const { data } = await $api.members.updateMember(id, payload);
      if (data && data.length > 0) {
        dispatch(updateMemberAction(data[0]));
        toast.success('Member updated successfully');
      }
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to update member');
      } else {
        toast.error('Failed to update member');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, updateMember: false }));
    }
  };

  const deleteMember = async (id: string, memberName?: string): Promise<void> => {
    // Show confirmation dialog
    if (!window.confirm(`Are you sure you want to delete ${memberName || 'this member'}?`)) {
      return;
    }

    try {
      setApiState((prev) => ({ ...prev, deleteMember: true }));
      await $api.members.deleteMember(id);
      await getMembers({
        page: currentPage,
        limit: itemsPerPage,
        search: debouncedSearchTerm || undefined,
        status: statusFilter,
      });
      toast.success('Member deleted successfully');
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to delete member');
      } else {
        toast.error('Failed to delete member');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, deleteMember: false }));
    }
  };

  const sendReminder = async (
    id: string,
    channel: 'sms' | 'whatsapp'
  ): Promise<MessageLog | undefined> => {
    try {
      setApiState((prev) => ({ ...prev, sendReminder: true }));
      const { data } = await $api.members.sendReminder(id, channel);
      toast.success('Reminder sent successfully');
      return data;
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to send reminder');
      } else {
        toast.error('Failed to send reminder');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, sendReminder: false }));
    }
  };

  const getReminderHistory = useCallback(
    async (id: string, params: IApiParams): Promise<MessageLog[]> => {
      try {
        setApiState((prev) => ({ ...prev, getReminderHistory: true }));
        const { data } = await $api.members.getReminderHistory(id, params);
        return data || [];
      } catch (error: unknown) {
        if (isApiError(error)) {
          toast.error(error.message || 'Failed to fetch reminder history');
        } else {
          toast.error('Failed to fetch reminder history');
        }
        throw error;
      } finally {
        setApiState((prev) => ({ ...prev, getReminderHistory: false }));
      }
    },
    []
  );

  const getCollectionHistory = async (id: string): Promise<CollectionHistory | undefined> => {
    try {
      setApiState((prev) => ({ ...prev, getCollectionHistory: true }));
      const { data } = await $api.members.getCollectionHistory(id);
      return data;
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to fetch collection history');
      } else {
        toast.error('Failed to fetch collection history');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, getCollectionHistory: false }));
    }
  };

  const getPaymentLink = async (id: string): Promise<PaymentLink | undefined> => {
    try {
      setApiState((prev) => ({ ...prev, getPaymentLink: true }));
      const { data } = await $api.members.getPaymentLink(id);
      return data;
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to fetch payment link');
      } else {
        toast.error('Failed to fetch payment link');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, getPaymentLink: false }));
    }
  };

  const createPaymentLink = async (id: string): Promise<PaymentLink | undefined> => {
    try {
      setApiState((prev) => ({ ...prev, createPaymentLink: true }));
      const { data } = await $api.members.createPaymentLink(id);
      toast.success('Payment link created successfully');
      return data;
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to create payment link');
      } else {
        toast.error('Failed to create payment link');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, createPaymentLink: false }));
    }
  };

  const markAsPaid = async (id: string): Promise<void> => {
    try {
      setApiState((prev) => ({ ...prev, markAsPaid: true }));
      const { data } = await $api.members.markAsPaid(id);
      if (data) {
        dispatch(updateMemberAction(data));
        toast.success('Member marked as paid');
      }
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to mark as paid');
      } else {
        toast.error('Failed to mark as paid');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, markAsPaid: false }));
    }
  };

  const getCollectionPayments = async (id: string): Promise<PaymentRecord[]> => {
    try {
      setApiState((prev) => ({ ...prev, getCollectionPayments: true }));
      const { data } = await $api.members.getCollectionPayments(id);
      return data || [];
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to fetch payment history');
      } else {
        toast.error('Failed to fetch payment history');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, getCollectionPayments: false }));
    }
  };

  const createPaymentLinksBulk = async (ids: string[]): Promise<void> => {
    try {
      setApiState((prev) => ({ ...prev, createPaymentLinksBulk: true }));
      const payload: CreatePaymentLinksBulkPayload = { collectionIds: ids };
      const { data } = await $api.members.createPaymentLinksBulk(payload);
      if (data && data.length > 0) {
        toast.success(`Successfully created ${data.length} payment link(s)`);
        // Refresh members list
        await getMembers({
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearchTerm || undefined,
          status: statusFilter,
        });
      }
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to create bulk payment links');
      } else {
        toast.error('Failed to create bulk payment links');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, createPaymentLinksBulk: false }));
    }
  };

  const getBirthdays = async (): Promise<Member[]> => {
    try {
      setApiState((prev) => ({ ...prev, getBirthdays: true }));
      const { data } = await $api.members.getBirthdays();
      return data || [];
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to fetch birthdays');
      } else {
        toast.error('Failed to fetch birthdays');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, getBirthdays: false }));
    }
  };

  const getAnniversaries = async (): Promise<Member[]> => {
    try {
      setApiState((prev) => ({ ...prev, getAnniversaries: true }));
      const { data } = await $api.members.getAnniversaries();
      return data || [];
    } catch (error: unknown) {
      if (isApiError(error)) {
        toast.error(error.message || 'Failed to fetch anniversaries');
      } else {
        toast.error('Failed to fetch anniversaries');
      }
      throw error;
    } finally {
      setApiState((prev) => ({ ...prev, getAnniversaries: false }));
    }
  };

  return {
    createMember,
    createMembersBulk,
    updateMember,
    deleteMember,
    sendReminder,
    getReminderHistory,
    getCollectionHistory,
    getPaymentLink,
    createPaymentLink,
    markAsPaid,
    getCollectionPayments,
    createPaymentLinksBulk,
    getBirthdays,
    getAnniversaries,
    toggleAddMemberDrawer: toggleAddMemberDrawerHandler,
    closeAddMemberDrawer: closeAddMemberDrawerHandler,
    isAddMemberDrawerOpen,
    members,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentPage,
    itemsPerPage,
    paginationMeta,
    handlePageChange,
    handleItemsPerPageChange,
    apiState,
    selectedMember,
    setSelectedMember,
    memberForEdit,
    isDetailDrawerOpen: !!selectedMember,
    isEditDrawerOpen: !!memberForEdit,
    closeDetailDrawer,
    openEditDrawer,
    closeEditDrawer,
    isBulkPaymentLinksModalOpen,
    setIsBulkPaymentLinksModalOpen,
    isBulkUploadModalOpen,
    setIsBulkUploadModalOpen,
  };
};
