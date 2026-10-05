import { createSlice } from "@reduxjs/toolkit";
import { isAuthLogout } from "../../auth/states/reducer";

const initialState = {
  users: [],
  user: null,
  profile: null,
  isProfile: false,
  isChangeProfile: false,
  isChangeProfilePhoto: false,
  isChangeProfilePassword: false,
};

// Setiap reducer cukup menimpa satu kunci state dengan payload.
const assign = (key) => (state, { payload }) => {
  state[key] = payload;
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    users: assign("users"),
    user: assign("user"),
    profile: assign("profile"),
    isProfile: assign("isProfile"),
    isChangeProfile: assign("isChangeProfile"),
    isChangeProfilePhoto: assign("isChangeProfilePhoto"),
    isChangeProfilePassword: assign("isChangeProfilePassword"),
  },
  extraReducers: (builder) => {
    builder.addCase(isAuthLogout, () => initialState);
  },
});

export const {
  users,
  user,
  profile,
  isProfile,
  isChangeProfile,
  isChangeProfilePhoto,
  isChangeProfilePassword,
} = usersSlice.actions;
export default usersSlice.reducer;
