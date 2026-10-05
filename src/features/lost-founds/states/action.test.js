import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  asyncAddLostFound,
  asyncChangeLostFound,
  asyncChangeLostFoundCover,
  asyncDeleteLostFound,
  asyncGetLostFound,
  asyncGetLostFoundStats,
  asyncGetLostFounds,
} from "./action";
import * as api from "../api/lostFoundApi";
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import { makeStore } from "../../../test-utils";

vi.mock("../api/lostFoundApi");
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn().mockResolvedValue({}),
  showConfirmDialog: vi.fn(),
}));

beforeEach(() => vi.clearAllMocks());

describe("pengambilan data", () => {
  it("asyncGetLostFounds mengisi daftar dan mematikan loading", async () => {
    api.fetchLostFounds.mockResolvedValue({ data: { lost_founds: [{ id: 1 }] } });
    const store = makeStore();
    await store.dispatch(asyncGetLostFounds({ is_me: 1 }));
    expect(api.fetchLostFounds).toHaveBeenCalledWith({ is_me: 1 });
    expect(store.getState().lostFounds.lostFounds).toEqual([{ id: 1 }]);
    expect(store.getState().lostFounds.isLostFound).toBe(false);
  });

  it("asyncGetLostFounds menampilkan error", async () => {
    api.fetchLostFounds.mockRejectedValue(new Error("gagal"));
    const store = makeStore();
    await store.dispatch(asyncGetLostFounds());
    expect(showErrorDialog).toHaveBeenCalledWith("gagal");
    expect(store.getState().lostFounds.isLostFound).toBe(false);
  });

  it("asyncGetLostFound sukses dan gagal", async () => {
    api.fetchLostFound.mockResolvedValueOnce({ data: { lost_found: { id: 3 } } });
    const store = makeStore();
    expect(await store.dispatch(asyncGetLostFound(3))).toBe(true);
    expect(store.getState().lostFounds.lostFound).toEqual({ id: 3 });

    api.fetchLostFound.mockRejectedValueOnce(new Error("404"));
    expect(await store.dispatch(asyncGetLostFound(9))).toBe(false);
    expect(store.getState().lostFounds.lostFound).toBeNull();
    expect(showErrorDialog).toHaveBeenCalledWith("404");
  });

  it("asyncGetLostFoundStats menggabungkan harian dan bulanan", async () => {
    api.fetchStatsDaily.mockResolvedValue({ data: [1] });
    api.fetchStatsMonthly.mockResolvedValue({ data: [2] });
    const store = makeStore();
    await store.dispatch(asyncGetLostFoundStats());
    expect(store.getState().lostFounds.lostFoundStats).toEqual({ daily: [1], monthly: [2] });
  });

  it("asyncGetLostFoundStats menampilkan error", async () => {
    api.fetchStatsDaily.mockRejectedValue(new Error("stat gagal"));
    api.fetchStatsMonthly.mockResolvedValue({ data: [] });
    await makeStore().dispatch(asyncGetLostFoundStats());
    expect(showErrorDialog).toHaveBeenCalledWith("stat gagal");
  });
});

describe("mutasi", () => {
  it.each([
    ["tambah", () => asyncAddLostFound({ title: "a" }), api.postLostFound, "isLostFoundAdded"],
    ["ubah", () => asyncChangeLostFound(1, { title: "a" }), api.putLostFound, "isLostFoundChanged"],
    ["ganti cover", () => asyncChangeLostFoundCover(1, new File(["a"], "a.png")), api.postLostFoundCover, "isLostFoundChangedCover"],
  ])("%s sukses menyalakan flag selesai", async (_n, build, call, doneFlag) => {
    call.mockResolvedValue({});
    const store = makeStore();
    expect(await store.dispatch(build())).toBe(true);
    expect(store.getState().lostFounds[doneFlag]).toBe(true);
    expect(showSuccessDialog).toHaveBeenCalled();
  });

  it.each([
    ["tambah", () => asyncAddLostFound({}), api.postLostFound, "isLostFoundAdd"],
    ["ubah", () => asyncChangeLostFound(1, {}), api.putLostFound, "isLostFoundChange"],
    ["ganti cover", () => asyncChangeLostFoundCover(1, null), api.postLostFoundCover, "isLostFoundChangeCover"],
  ])("%s gagal menampilkan error dan mematikan flag proses", async (_n, build, call, busyFlag) => {
    call.mockRejectedValue(new Error("ditolak"));
    const store = makeStore();
    expect(await store.dispatch(build())).toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("ditolak");
    expect(store.getState().lostFounds[busyFlag]).toBe(false);
  });

  it("hapus dibatalkan bila tidak dikonfirmasi", async () => {
    showConfirmDialog.mockResolvedValue(false);
    expect(await makeStore().dispatch(asyncDeleteLostFound(1))).toBe(false);
    expect(api.removeLostFound).not.toHaveBeenCalled();
  });

  it("hapus berjalan setelah konfirmasi", async () => {
    showConfirmDialog.mockResolvedValue(true);
    api.removeLostFound.mockResolvedValue({});
    const store = makeStore();
    expect(await store.dispatch(asyncDeleteLostFound(1))).toBe(true);
    expect(api.removeLostFound).toHaveBeenCalledWith(1);
    expect(store.getState().lostFounds.isLostFoundDeleted).toBe(true);
  });
});
