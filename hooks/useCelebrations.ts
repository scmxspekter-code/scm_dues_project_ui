import { useState, useEffect, useRef, useCallback } from 'react';
import { Member } from '../types';
import { useMembers } from './useMembers';
import { useMessaging } from './useMessaging';

const PAGE_SIZE = 15;

export const useCelebrations = () => {
  const { getBirthdays, getAnniversaries, apiState } = useMembers();
  const {
    triggerBirthdayMessage,
    triggerAnniversaryMessage,
    triggerBulkBirthdayMessages,
    triggerBulkAnniversaryMessages,
    apiState: messagingApiState,
  } = useMessaging();

  // State
  const [birthdays, setBirthdays] = useState<Member[]>([]);
  const [anniversaries, setAnniversaries] = useState<Member[]>([]);
  const [activeTab, setActiveTab] = useState<'birthdays' | 'anniversaries'>('birthdays');
  const [pageBirthdays, setPageBirthdays] = useState(1);
  const [pageAnniversaries, setPageAnniversaries] = useState(1);
  const [hasMoreBirthdays, setHasMoreBirthdays] = useState(true);
  const [hasMoreAnniversaries, setHasMoreAnniversaries] = useState(true);
  const [isLoadingMoreBirthdays, setIsLoadingMoreBirthdays] = useState(false);
  const [isLoadingMoreAnniversaries, setIsLoadingMoreAnniversaries] = useState(false);

  // Refs
  const isMountedRef = useRef(true);

  // Computed values
  const isLoading = (apiState?.getBirthdays || apiState?.getAnniversaries) ?? false;
  const safeMessagingApiState = messagingApiState ?? {
    triggerBirthday: false,
    triggerAnniversary: false,
    triggerBulkBirthday: false,
    triggerBulkAnniversary: false,
  };

  // Load initial data (page 1)
  const loadData = useCallback(async (): Promise<void> => {
    try {
      const [birthdaysRes, anniversariesRes] = await Promise.all([
        getBirthdays({ page: 1, limit: PAGE_SIZE }),
        getAnniversaries({ page: 1, limit: PAGE_SIZE }),
      ]);
      if (isMountedRef.current) {
        setBirthdays(birthdaysRes.data);
        setAnniversaries(anniversariesRes.data);
        setPageBirthdays(1);
        setPageAnniversaries(1);
        setHasMoreBirthdays(birthdaysRes.hasNextPage);
        setHasMoreAnniversaries(anniversariesRes.hasNextPage);
      }
    } catch {
      if (isMountedRef.current) {
        setBirthdays([]);
        setAnniversaries([]);
      }
    }
  }, [getBirthdays, getAnniversaries]);

  // Load initial data effect
  useEffect(() => {
    isMountedRef.current = true;

    const fetchData = async (): Promise<void> => {
      try {
        await loadData();
      } catch {
        // Error already handled in hook
      }
    };
    fetchData();

    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers
  const handleSendBirthdayMessage = async (memberId: string): Promise<void> => {
    try {
      await triggerBirthdayMessage({ collectionId: memberId });
      await loadData();
    } catch {
      // Error already handled in hook
    }
  };

  const handleSendAnniversaryMessage = async (memberId: string): Promise<void> => {
    try {
      await triggerAnniversaryMessage({ collectionId: memberId });
      await loadData();
    } catch {
      // Error already handled in hook
    }
  };

  const handleSendBulkBirthdays = async (): Promise<void> => {
    try {
      await triggerBulkBirthdayMessages();
      await loadData();
    } catch {
      // Error already handled in hook
    }
  };

  const handleSendBulkAnniversaries = async (): Promise<void> => {
    try {
      await triggerBulkAnniversaryMessages();
      await loadData();
    } catch {
      // Error already handled in hook
    }
  };

  const loadMoreBirthdays = useCallback(async (): Promise<void> => {
    if (!hasMoreBirthdays || isLoadingMoreBirthdays) return;
    setIsLoadingMoreBirthdays(true);
    try {
      const nextPage = pageBirthdays + 1;
      const res = await getBirthdays({ page: nextPage, limit: PAGE_SIZE });
      if (isMountedRef.current) {
        setBirthdays((prev) => [...prev, ...res.data]);
        setPageBirthdays(nextPage);
        setHasMoreBirthdays(res.hasNextPage);
      }
    } catch {
      // Error already handled in getBirthdays
    } finally {
      if (isMountedRef.current) setIsLoadingMoreBirthdays(false);
    }
  }, [hasMoreBirthdays, isLoadingMoreBirthdays, pageBirthdays, getBirthdays]);

  const loadMoreAnniversaries = useCallback(async (): Promise<void> => {
    if (!hasMoreAnniversaries || isLoadingMoreAnniversaries) return;
    setIsLoadingMoreAnniversaries(true);
    try {
      const nextPage = pageAnniversaries + 1;
      const res = await getAnniversaries({ page: nextPage, limit: PAGE_SIZE });
      if (isMountedRef.current) {
        setAnniversaries((prev) => [...prev, ...res.data]);
        setPageAnniversaries(nextPage);
        setHasMoreAnniversaries(res.hasNextPage);
      }
    } catch {
      // Error already handled in getAnniversaries
    } finally {
      if (isMountedRef.current) setIsLoadingMoreAnniversaries(false);
    }
  }, [hasMoreAnniversaries, isLoadingMoreAnniversaries, pageAnniversaries, getAnniversaries]);

  return {
    // State
    birthdays,
    anniversaries,
    activeTab,
    setActiveTab,
    isLoading,
    safeMessagingApiState,
    hasMoreBirthdays,
    hasMoreAnniversaries,
    isLoadingMoreBirthdays,
    isLoadingMoreAnniversaries,
    // Handlers
    handleSendBirthdayMessage,
    handleSendAnniversaryMessage,
    handleSendBulkBirthdays,
    handleSendBulkAnniversaries,
    loadMoreBirthdays,
    loadMoreAnniversaries,
  };
};
