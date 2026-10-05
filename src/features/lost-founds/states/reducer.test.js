import { describe, expect, it } from "vitest";
import reducer, * as actions from "./reducer";
import { isAuthLogout } from "../../auth/states/reducer";

const initial = reducer(undefined, { type: "@@init" });
const keys = Object.keys(initial);

describe("lostFounds reducer", () => {
  it("memiliki seluruh kunci state yang diwajibkan", () => {
    expect(keys).toEqual([
      "lostFounds", "lostFound", "isLostFound",
      "isLostFoundAdd", "isLostFoundAdded",
      "isLostFoundChange", "isLostFoundChanged",
      "isLostFoundChangeCover", "isLostFoundChangedCover",
      "isLostFoundDelete", "isLostFoundDeleted",
      "lostFoundStats",
    ]);
  });

  it.each(keys)("action %s mengisi state dengan payload", (key) => {
    const payload = { contoh: key };
    expect(reducer(initial, actions[key](payload))[key]).toEqual(payload);
  });

  it("direset saat logout", () => {
    const dirty = reducer(initial, actions.lostFounds([{ id: 1 }]));
    expect(reducer(dirty, isAuthLogout())).toEqual(initial);
  });
});
