import { combineReducers } from "redux";
import authReducer from "./authReducer";
import employeeReducer from "./employeeReducer";
import hrReducer from "./hrReducer";
import uiReducer from "./uiReducer";

export default combineReducers({
  auth: authReducer,
  employee: employeeReducer,
  hr: hrReducer,
  ui: uiReducer,
});
