import { useState, useEffect, useRef } from 'react';
import { Member } from '../types';
import { useMembers } from './useMembers';
import { useMessaging } from './useMessaging';

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

  // Load data function
  const loadData = async (): Promise<void> => {
    try {
      const [birthdaysData, anniversariesData] = await Promise.all([
        getBirthdays(),
        getAnniversaries(),
      ]);
      if (isMountedRef.current) {
        setBirthdays(birthdaysData || []);
        setAnniversaries(anniversariesData || []);
      }
    } catch {
      if (isMountedRef.current) {
        setBirthdays([]);
        setAnniversaries([]);
      }
    }
  };

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

  return {
    // State
    birthdays,
    anniversaries,
    activeTab,
    setActiveTab,
    isLoading,
    safeMessagingApiState,
    // Handlers
    handleSendBirthdayMessage,
    handleSendAnniversaryMessage,
    handleSendBulkBirthdays,
    handleSendBulkAnniversaries,
  };
};
