import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  info: {},             // stored personal info (read-only)
  editInfo: {},         // temporary editable version
  mode: 'initial',      // 'initial' | 'edit'
};

const informationSlice = createSlice({
  name: 'information',
  initialState,
  reducers: {
    setInfo: (state, action) => {
      state.info = action.payload;
    },
    setEditInfo: (state, action) => {
      state.editInfo = action.payload;
    },
    updateEditField: (state, action) => {
      const { field, value } = action.payload;
      state.editInfo[field] = value;
    },
    setMode: (state, action) => {
      state.mode = action.payload;  // 'initial' or 'edit'
    },
    discardEdit: (state) => {
      state.editInfo = {};
      state.mode = 'initial';
    },
  },
});

export const {
  setInfo,
  setEditInfo,
  updateEditField,
  setMode,
  discardEdit,
} = informationSlice.actions;

export default informationSlice.reducer;