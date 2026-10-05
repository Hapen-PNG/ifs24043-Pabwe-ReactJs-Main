import { describe, expect, it } from "vitest";
import reducer, {
  isChangeProfile,
  isChangeProfilePassword,
  isChangeProfilePhoto,
  isProfile,
  profile,
  user,
  users,
} from "./reducer";
import { isAuthLogout } from "../../auth/states/reducer";

const initial = reducer(undefined, { type: "@@init" });

describe("users reducer", () => {
  it("memiliki state awal lengkap", () => {
    expect(initial).toEqual({
      users: [],
      user: null,
      profile: null,
      isProfile: false,
      isChangeProfile: false,
      isChangeProfilePhoto: false,
      isChangeProfilePassword: false,
    });
  });

  it.each([
    ["users", users, [{ id: 1 }]],
    ["user", user, { id: 1 }],
    ["profile", profile, { id: 2 }],
    ["isProfile", isProfile, true],
    ["isChangeProfile", isChangeProfile, true],
    ["isChangeProfilePhoto", isChangeProfilePhoto, true],
    ["isChangeProfilePassword", isChangeProfilePassword, true],
  ])("action %s mengisi state", (key, creator, payload) => {
    expect(reducer(initial, creator(payload))[key]).toEqual(payload);
  });

  it("kembali ke state awal saat logout", () => {
    expect(reducer({ ...initial, profile: { id: 1 } }, isAuthLogout())).toEqual(initial);
  });
});
