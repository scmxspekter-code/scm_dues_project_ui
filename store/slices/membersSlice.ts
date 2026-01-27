import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Member } from '@/types';

interface MembersState {
  members: Member[];
  filteredMembers: Member[];
  searchTerm: string;
  member: Member | null;
  isAddMemberDrawerOpen: boolean;
  isDrawerOpen: boolean;
}

const initialState: MembersState = {
  members: [],
  filteredMembers: [],
  searchTerm: '',
  member: null,
  isAddMemberDrawerOpen: false,
  isDrawerOpen: false,
};

const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.filteredMembers = state.members.filter(
        (m) =>
          m.name.toLowerCase().includes(action.payload.toLowerCase()) ||
          m.phoneNumber.toLowerCase().includes(action.payload.toLowerCase())
      );
    },
    setSelectedMember: (state, action: PayloadAction<Member | null>) => {
      state.member = action.payload;
      state.isDrawerOpen = !!action.payload;
    },
    toggleMemberDrawer: (state) => {
      state.isDrawerOpen = !state.isDrawerOpen;
      if (!state.isDrawerOpen) {
        state.member = null;
      }
    },
    addMember: (state, action: PayloadAction<Member[]>) => {
      state.members.push(...action.payload);
      // Update filtered members based on current search term
      if (state.searchTerm) {
        state.filteredMembers = [...state.members].filter(
          (m) =>
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
      const index = state.members.findIndex((m) => m.id === action.payload.id);
      if (index !== -1) {
        state.members[index] = action.payload;
        state.filteredMembers = state.members;
      }
    },

    toggleAddMember: (state) => {
      state.isAddMemberDrawerOpen = !state.isAddMemberDrawerOpen;
    },
  },
});

export const {
  setSearchTerm,
  setSelectedMember,
  addMember,
  setMembers,
  updateMember,
  toggleAddMember,
  toggleMemberDrawer,
} = membersSlice.actions;
export default membersSlice.reducer;
