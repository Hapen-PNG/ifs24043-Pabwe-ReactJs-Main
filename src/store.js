import { configureStore } from "@reduxjs/toolkit";
import auth from "./features/auth/states/reducer";
import users from "./features/users/states/reducer";
import lostFounds from "./features/lost-founds/states/reducer";

export const reducer = { auth, users, lostFounds };

const store = configureStore({ reducer });

export default store;
