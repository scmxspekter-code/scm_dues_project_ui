import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Member, MessageLog } from '@/types';

export type DefaulterDrawerTab = 'history' | 'message';

interface DefaultersState {
  defaulters: Member[];
  filteredDefaulters: Member[];
  searchTerm: string;
  member: Member | null;
  isDrawerOpen: boolean;
  drawerDefaultTab: DefaulterDrawerTab;
  messageHistory: MessageLog[];
}

const initialState: DefaultersState = {
  defaulters: [],
  filteredDefaulters: [],
  searchTerm: '',
  member: null,
  isDrawerOpen: false,
  drawerDefaultTab: 'history',
  messageHistory: [],
};

const defaultersSlice = createSlice({
  name: 'defaulters',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.filteredDefaulters = state.defaulters.filter((d) =>
        d.name.toLowerCase().includes(action.payload.toLowerCase())
      );
    },
    setDefaulters: (state, action: PayloadAction<Member[]>) => {
      state.defaulters = action.payload;
      state.filteredDefaulters = action.payload;
    },
    setSelectedDefaulter: (
      state,
      action: PayloadAction<
        Member | null | { member: Member; tab?: DefaulterDrawerTab }
      >
    ) => {
      const payload = action.payload;
      if (payload === null) {
        state.member = null;
        state.isDrawerOpen = false;
        return;
      }
      if (typeof payload === 'object' && 'member' in payload) {
        const { member, tab } = payload as {
          member: Member;
          tab?: DefaulterDrawerTab;
        };
        state.member = member;
        state.isDrawerOpen = true;
        state.drawerDefaultTab = tab === 'message' ? 'message' : 'history';
        return;
      }
      const member = payload as Member;
      state.member = member;
      state.isDrawerOpen = true;
      state.drawerDefaultTab = 'history';
    },
    toggleDefaulterDrawer: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
      if (!state.isDrawerOpen) {
        state.member = null;
      }
    },
    exportDefaulters: (state) => {
      const headers = 'ID,Name,Phone,Amount Due,Joined Date\n';
      const rows = state.defaulters
        .map((d) => `${d.id},${d.name},${d.phone},${d.amountDue},${d.joinedDate}`)
        .join('\n');
      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `scm_defaulters_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    },
    setMessageHistory: (state, action: PayloadAction<MessageLog[]>) => {
      state.messageHistory = action.payload;
    },
    removeDefaulter: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.defaulters = state.defaulters.filter((d) => d.id !== id);
      state.filteredDefaulters = state.filteredDefaulters.filter((d) => d.id !== id);
      // If the removed defaulter is currently selected in the drawer, clear it
      if (state.member && state.member.id === id) {
        state.member = null;
        state.isDrawerOpen = false;
      }
    },
  },
});

export const {
  setSearchTerm,
  setDefaulters,
  setSelectedDefaulter,
  toggleDefaulterDrawer,
  exportDefaulters,
  setMessageHistory,
  removeDefaulter,
} = defaultersSlice.actions;
export default defaultersSlice.reducer;
