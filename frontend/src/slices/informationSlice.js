import { createSlice } from '@reduxjs/toolkit';
console.log("✅ informationSlice loaded");

const initialState = {
  info: null, // initially no info
  editInfo: {},
  mode: 'initial',
};

const informationSlice = createSlice({
  name: 'information',
  initialState,
  reducers: {
    setInfo: (state, action) => {
      console.log("✅ setInfo reducer called with payload:", action.payload);
      state.info = action.payload;
    },
    setEditInfo: (state, action) => {
      console.log("✅ setEditInfo reducer called with payload:", action.payload);
      state.editInfo = action.payload;
    },
    updateEditField: (state, action) => {
      const { field, value } = action.payload;
      const keys = field.split('.');
      let target = state.editInfo;
    
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        const isArrayIndex = /^\d+$/.test(keys[i + 1]);
        if (!target[key]) {
          target[key] = isArrayIndex ? [] : {};
        }
        target = target[key];
      }
    
      target[keys[keys.length - 1]] = value;
    },
    setMode: (state, action) => {
      state.mode = action.payload;
    },
    discardEdit: (state) => {
      state.editInfo = {};
      state.mode = 'initial';
    },
  },
});

export const { setInfo, setEditInfo, updateEditField, setMode, discardEdit } = informationSlice.actions;
export default informationSlice.reducer;