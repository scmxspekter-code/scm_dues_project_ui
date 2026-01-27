import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { IApiParams, Member, PaymentStatus, PaginationMeta } from '../types';
import { $api } from '@/api';
import { ICreateMemberPayload } from '@/api/member.repository';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addMember, setMembers, toggleAddMember, setSelectedMember as setSelectedMemberAction, toggleMemberDrawer } from '@/store/slices/membersSlice';
import { toast } from 'react-hot-toast';
import { debounce } from '@/utils/debounce';



export const useMembers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | undefined>(undefined);
  const dispatch = useAppDispatch();
  const { members, isAddMemberDrawerOpen } = useAppSelector((state) => state.members);
const [apiState, setApiState] = useState({
  getMembers:false,
  createMember:false,
  updateMember:false,
  deleteMember:false,
  getMember:false,
  getMemberHistory:false,
  getMemberPayments:false,
  getMemberReminders:false,
  getMemberSettings:false,
})
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

  // Debounce search term using useRef to persist the debounced function
  const debouncedSetSearchRef = useRef(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
      setCurrentPage(1); // Reset to page 1 when search term changes
    }, 500)
  );

  // Update debounced search term when searchTerm changes
  useEffect(() => {
    debouncedSetSearchRef.current(searchTerm);
  }, [searchTerm]);
  useEffect(() => {
    getMembers({
      page: currentPage,
      limit: itemsPerPage,
      search: debouncedSearchTerm || undefined,
    });
  }, [currentPage, itemsPerPage, debouncedSearchTerm]);
  const getMembers = useCallback(async (params: IApiParams) => {
    try {
      setApiState(prev => ({...prev, getMembers: true}));
      const response = await $api.members.getMembers(params);
      dispatch(setMembers(response.data!));
      // Set pagination meta if available
      if (response.meta) {
        setPaginationMeta(response.meta);
        // Don't sync currentPage and itemsPerPage from API response to avoid infinite loops
        // The local state should be the source of truth
      }
      // Remove toast for pagination changes to avoid spam
      if ((!params.page || params.page === 1) && !params.search) {
        toast.success('Members fetched successfully');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch members');
      throw error;
    } finally {
      setApiState(prev => ({...prev, getMembers: false}));
    }
  }, [dispatch]);

  const createMember = async (payload: ICreateMemberPayload) => {
    try {
      const {data} = await $api.members.createMember([payload]);
      dispatch(toggleAddMember());
      dispatch(addMember(data!));
    } catch (error: any) {
      throw error;
    }
  }

  // Fetch members when page, items per page, or debounced search term changes

  const setSelectedMember = (member: Member | null) => {
    dispatch(setSelectedMemberAction(member));
  };

  const toggleMemberDrawerHandler = () => {
    dispatch(toggleMemberDrawer());
  };

  return {
    createMember,
    toggleAddMemberDrawer: toggleAddMemberDrawerHandler,
    closeAddMemberDrawer: closeAddMemberDrawerHandler,
    isAddMemberDrawerOpen,
    members,
    searchTerm,
    setSearchTerm,
    currentPage,
    itemsPerPage,
    paginationMeta,
    handlePageChange,
    handleItemsPerPageChange,
    apiState,
    setSelectedMember,
    toggleMemberDrawer: toggleMemberDrawerHandler,
  }
};
