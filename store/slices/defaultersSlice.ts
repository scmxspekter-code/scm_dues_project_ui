import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {  Member, MessageLog } from '@/types';

interface DefaultersState {
  defaulters: Member[];
  filteredDefaulters: Member[];
  searchTerm: string;
  member: Member | null;
  isDrawerOpen: boolean;
  messageHistory: MessageLog[];
}

const initialState: DefaultersState = {
  defaulters: [],
  filteredDefaulters: [],
  searchTerm: '',
  member: null,
  isDrawerOpen: false,
  messageHistory: [],
};



const defaultersSlice = createSlice({
  name: 'defaulters',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.filteredDefaulters = state.defaulters.filter(d =>
        d.name.toLowerCase().includes(action.payload.toLowerCase())
      );
    },
    setDefaulters: (state, action: PayloadAction<Member[]>) => {
      state.defaulters = action.payload;
      state.filteredDefaulters = action.payload;
    },
    setSelectedDefaulter: (state, action: PayloadAction<Member | null>) => {
      state.member = action.payload;
      state.isDrawerOpen = !!action.payload;
    },
    toggleDefaulterDrawer: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
      if (!state.isDrawerOpen) {
        state.member = null;
      }
    },
    exportDefaulters: (state) => {
      const headers = "ID,Name,Phone,Amount Due,Joined Date\n";
      const rows = state.defaulters.map(d => `${d.id},${d.name},${d.phone},${d.amountDue},${d.joinedDate}`).join("\n");
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
  },
 
});

export const { setSearchTerm, setDefaulters, setSelectedDefaulter, toggleDefaulterDrawer, exportDefaulters, setMessageHistory } = defaultersSlice.actions;
export default defaultersSlice.reducer;
