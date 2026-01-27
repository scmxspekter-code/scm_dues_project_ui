import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {  Member } from '@/types';

interface DefaultersState {
  defaulters: Member[];
  filteredDefaulters: Member[];
  searchTerm: string;
  selectedDefaulter: Member | null;
}

const initialState: DefaultersState = {
  defaulters: [],
  filteredDefaulters: [],
  searchTerm: '',
  selectedDefaulter: null,
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
      state.selectedDefaulter = action.payload;
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
   
  },
 
});

export const { setSearchTerm, setDefaulters, setSelectedDefaulter, exportDefaulters } = defaultersSlice.actions;
export default defaultersSlice.reducer;
