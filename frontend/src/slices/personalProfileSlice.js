import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  info: null,
  editInfo: {},
  mode: 'init', // only 'init' or 'edit'
};

const personalProfileSlice = createSlice({
  name: 'personalProfile',
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
      const keys = field.split('.');
      let target = state.editInfo;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!target[key]) {
          target[key] = {};
        }
        target = target[key];
      }
      target[keys[keys.length - 1]] = value;
    },
    setMode: (state, action) => {
      state.mode = action.payload; // 'init' or 'edit'
    },
    discardEdit: (state) => {
      state.editInfo = {};
      state.mode = 'init';
    },
  },
});

export const {
  setInfo,
  setEditInfo,
  updateEditField,
  setMode,
  discardEdit,
} = personalProfileSlice.actions;

export default personalProfileSlice.reducer;