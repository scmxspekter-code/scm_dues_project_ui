import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {  Member } from '@/types';
import { IMemberCreateResponse } from '@/api/member.repository';


interface MembersState {
  members: Member[];
  filteredMembers: Member[];
  searchTerm: string;
  isLoading: boolean;
  error: string | null;
  selectedMember: Member | null;
  isAddMemberDrawerOpen: boolean;
}

const initialState: MembersState = {
  members: [] ,
  filteredMembers: [],
  searchTerm: '',
  isLoading: false,
  error: null,
  selectedMember: null,
  isAddMemberDrawerOpen: false,
};




const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.filteredMembers = state.members.filter(m =>
        m.name.toLowerCase().includes(action.payload.toLowerCase()) ||
        m.phoneNumber.toLowerCase().includes(action.payload.toLowerCase())
      );
    },
    setSelectedMember: (state, action: PayloadAction<Member | null>) => {
      state.selectedMember = action.payload;
    },
    addMember: (state, action: PayloadAction<Member[]>) => {
      state.members.push(...action.payload);
      // Update filtered members based on current search term
      if (state.searchTerm) {
        state.filteredMembers = [...state.members].filter(m =>
          m.name.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
          m.phoneNumber.toLowerCase().includes(state.searchTerm.toLowerCase())
        );
      } else {
        state.filteredMembers = state.members;
      }
    },
    setMembers: (state, action: PayloadAction<Member[]>) => {
      state.members = action.payload;
      state.filteredMembers = action.payload;
    },
    updateMember: (state, action: PayloadAction<Member>) => {
      const index = state.members.findIndex(m => m.id === action.payload.id);
      if (index !== -1) {
        state.members[index] = action.payload;
        state.filteredMembers = state.members;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    openAddMemberDrawer: (state) => {
      state.isAddMemberDrawerOpen = true;
    },
    closeAddMemberDrawer: (state) => {
      state.isAddMemberDrawerOpen = false;
    },
    toggleAddMemberDrawer: (state) => {
      state.isAddMemberDrawerOpen = !state.isAddMemberDrawerOpen;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },

});

export const { 
  setSearchTerm, 
  setSelectedMember, 
  addMember, 
  setMembers,
  updateMember, 
  clearError,
  openAddMemberDrawer,
  closeAddMemberDrawer,
  toggleAddMemberDrawer,
  setLoading,
  setError,
} = membersSlice.actions;
export default membersSlice.reducer;
