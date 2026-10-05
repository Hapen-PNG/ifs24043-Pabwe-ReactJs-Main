import { createSlice } from "@reduxjs/toolkit";
import { isAuthLogout } from "../../auth/states/reducer";

const initialState = {
  lostFounds: [],
  lostFound: null,
  isLostFound: false,
  isLostFoundAdd: false,
  isLostFoundAdded: false,
  isLostFoundChange: false,
  isLostFoundChanged: false,
  isLostFoundChangeCover: false,
  isLostFoundChangedCover: false,
  isLostFoundDelete: false,
  isLostFoundDeleted: false,
  lostFoundStats: null,
};

const assign = (key) => (state, { payload }) => {
  state[key] = payload;
};

// Satu reducer per kunci state, dibangkitkan dari daftar kunci agar tidak berulang.
const reducers = Object.fromEntries(Object.keys(initialState).map((key) => [key, assign(key)]));

const lostFoundSlice = createSlice({
  name: "lostFounds",
  initialState,
  reducers,
  extraReducers: (builder) => {
    builder.addCase(isAuthLogout, () => initialState);
  },
});

export const {
  lostFounds,
  lostFound,
  isLostFound,
  isLostFoundAdd,
  isLostFoundAdded,
  isLostFoundChange,
  isLostFoundChanged,
  isLostFoundChangeCover,
  isLostFoundChangedCover,
  isLostFoundDelete,
  isLostFoundDeleted,
  lostFoundStats,
} = lostFoundSlice.actions;
export default lostFoundSlice.reducer;
