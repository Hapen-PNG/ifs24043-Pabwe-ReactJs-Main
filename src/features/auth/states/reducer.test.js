import { expect, it } from "vitest";
import reducer, { isAuthLogin, isAuthLogout, isAuthRegister } from "./reducer";
import { putAccessToken } from "../../../helpers/apiHelper";

it("state awal membaca token dari localStorage", () => {
  putAccessToken("tersimpan");
  expect(reducer(undefined, { type: "@@init" })).toEqual({ token: "tersimpan", registered: false });
});

it("isAuthLogin menyimpan token", () => {
  const state = reducer({ token: null, registered: true }, isAuthLogin("t1"));
  expect(state).toEqual({ token: "t1", registered: false });
});

it("isAuthRegister menandai pendaftaran berhasil", () => {
  expect(reducer({ token: null, registered: false }, isAuthRegister()).registered).toBe(true);
});

it("isAuthLogout mengosongkan sesi", () => {
  expect(reducer({ token: "x", registered: true }, isAuthLogout())).toEqual({ token: null, registered: false });
});
