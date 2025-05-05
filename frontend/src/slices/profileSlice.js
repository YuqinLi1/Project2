import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  employees: [],
  filteredEmployees: [],
  searchTerm: "",
  selectedEmployee: null,
};

const profilesSlice = createSlice({
  name: "profiles",
  initialState,
  reducers: {
    setEmployees: (state, action) => {
      state.employees = action.payload;
      state.filteredEmployees = action.payload;
    },
    setFilteredEmployees: (state, action) => {
      state.filteredEmployees = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
      // Filter employees based on search term
      if (action.payload) {
        const term = action.payload.toLowerCase();
        state.filteredEmployees = state.employees.filter(
          (employee) =>
            employee.firstName.toLowerCase().includes(term) ||
            employee.lastName.toLowerCase().includes(term) ||
            (employee.preferredName &&
              employee.preferredName.toLowerCase().includes(term))
        );
      } else {
        state.filteredEmployees = state.employees;
      }
    },
    setSelectedEmployee: (state, action) => {
      state.selectedEmployee = action.payload;
    },
  },
});

export const {
  setEmployees,
  setFilteredEmployees,
  setSearchTerm,
  setSelectedEmployee,
} = profilesSlice.actions;

export default profilesSlice.reducer;
