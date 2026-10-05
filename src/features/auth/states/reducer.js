import { createSlice } from "@reduxjs/toolkit";
import { getAccessToken } from "../../../helpers/apiHelper";

const authSlice = createSlice({
  name: "auth",
  initialState: () => ({ token: getAccessToken(), registered: false }),
  reducers: {
    isAuthLogin: (state, { payload }) => {
      state.token = payload;
      state.registered = false;
    },
    isAuthRegister: (state) => {
      state.registered = true;
    },
    isAuthLogout: (state) => {
      state.token = null;
      state.registered = false;
    },
  },
});

export const { isAuthLogin, isAuthRegister, isAuthLogout } = authSlice.actions;
export default authSlice.reducer;
