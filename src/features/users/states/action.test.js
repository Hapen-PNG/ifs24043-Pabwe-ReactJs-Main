import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  asyncChangeProfile,
  asyncChangeProfilePassword,
  asyncChangeProfilePhoto,
  asyncGetProfile,
  asyncGetUsers,
} from "./action";
import { fetchMe, fetchUsers, postMyPhoto, putMe, putMyPassword } from "../api/userApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { makeStore } from "../../../test-utils";

vi.mock("../api/userApi");
vi.mock("../../../helpers/toolsHelper", () => ({ showErrorDialog: vi.fn(), showSuccessDialog: vi.fn() }));

beforeEach(() => vi.clearAllMocks());

describe("asyncGetUsers", () => {
  it("mengisi daftar pengguna", async () => {
    fetchUsers.mockResolvedValue({ data: { users: [{ id: 1 }] } });
    const store = makeStore();
    await store.dispatch(asyncGetUsers());
    expect(store.getState().users.users).toEqual([{ id: 1 }]);
  });

  it("menampilkan dialog error bila gagal", async () => {
    fetchUsers.mockRejectedValue(new Error("down"));
    await makeStore().dispatch(asyncGetUsers());
    expect(showErrorDialog).toHaveBeenCalledWith("down");
  });
});

describe("asyncGetProfile", () => {
  it("menyimpan profil dan mengembalikan true", async () => {
    fetchMe.mockResolvedValue({ data: { user: { id: 7, name: "Ani" } } });
    const store = makeStore();
    expect(await store.dispatch(asyncGetProfile())).toBe(true);
    expect(store.getState().users.profile.name).toBe("Ani");
    expect(store.getState().users.isProfile).toBe(false);
  });

  it("mengembalikan false tanpa dialog saat token tidak valid", async () => {
    fetchMe.mockRejectedValue(new Error("401"));
    expect(await makeStore().dispatch(asyncGetProfile())).toBe(false);
    expect(showErrorDialog).not.toHaveBeenCalled();
  });
});

describe("mutasi profil", () => {
  beforeEach(() => fetchMe.mockResolvedValue({ data: { user: { id: 1, name: "Baru" } } }));

  it.each([
    ["asyncChangeProfile", () => asyncChangeProfile({ name: "x" }), putMe],
    ["asyncChangeProfilePhoto", () => asyncChangeProfilePhoto(new File(["a"], "a.png")), postMyPhoto],
    ["asyncChangeProfilePassword", () => asyncChangeProfilePassword({ password: "a" }), putMyPassword],
  ])("%s sukses menyegarkan profil", async (_name, build, api) => {
    api.mockResolvedValue({});
    const store = makeStore();
    expect(await store.dispatch(build())).toBe(true);
    expect(api).toHaveBeenCalled();
    expect(store.getState().users.profile.name).toBe("Baru");
    expect(showSuccessDialog).toHaveBeenCalled();
  });

  it.each([
    ["asyncChangeProfile", () => asyncChangeProfile({}), putMe],
    ["asyncChangeProfilePhoto", () => asyncChangeProfilePhoto(null), postMyPhoto],
    ["asyncChangeProfilePassword", () => asyncChangeProfilePassword({}), putMyPassword],
  ])("%s gagal menampilkan error", async (_name, build, api) => {
    api.mockRejectedValue(new Error("ditolak"));
    expect(await makeStore().dispatch(build())).toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("ditolak");
  });
});
