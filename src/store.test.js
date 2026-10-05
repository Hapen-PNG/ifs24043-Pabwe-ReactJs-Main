import { expect, it } from "vitest";
import store, { reducer } from "./store";
import { isAuthLogin } from "./features/auth/states/reducer";
import { lostFounds } from "./features/lost-founds/states/reducer";

it("menggabungkan slice auth, users, dan lostFounds", () => {
  expect(Object.keys(reducer)).toEqual(["auth", "users", "lostFounds"]);
  expect(Object.keys(store.getState())).toEqual(["auth", "users", "lostFounds"]);
});

it("slice bereaksi terhadap action dari fitur masing-masing", () => {
  store.dispatch(isAuthLogin("tok"));
  store.dispatch(lostFounds([{ id: 1 }]));
  expect(store.getState().auth.token).toBe("tok");
  expect(store.getState().lostFounds.lostFounds).toEqual([{ id: 1 }]);
});
