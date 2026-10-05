import { beforeEach, expect, it, vi } from "vitest";
import * as api from "./lostFoundApi";
import { callApi } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper", () => ({ callApi: vi.fn().mockResolvedValue({}) }));
beforeEach(() => vi.clearAllMocks());

it("fetchLostFounds meneruskan filter status, is_completed, is_me", async () => {
  const params = { status: "lost", is_completed: 0, is_me: 1 };
  await api.fetchLostFounds(params);
  expect(callApi).toHaveBeenCalledWith("/lost-founds", { params });
});

it("fetchLostFound -> GET /lost-founds/:id", async () => {
  await api.fetchLostFound(5);
  expect(callApi).toHaveBeenCalledWith("/lost-founds/5");
});

it("postLostFound & putLostFound", async () => {
  await api.postLostFound({ title: "a" });
  await api.putLostFound(5, { title: "b" });
  expect(callApi).toHaveBeenNthCalledWith(1, "/lost-founds", { method: "POST", body: { title: "a" } });
  expect(callApi).toHaveBeenNthCalledWith(2, "/lost-founds/5", { method: "PUT", body: { title: "b" } });
});

it("postLostFoundCover mengirim FormData field cover", async () => {
  const file = new File(["x"], "c.png", { type: "image/png" });
  await api.postLostFoundCover(5, file);
  const [path, options] = callApi.mock.calls[0];
  expect(path).toBe("/lost-founds/5/cover");
  expect(options.method).toBe("POST");
  expect(options.form.get("cover")).toBe(file);
});

it("removeLostFound -> DELETE", async () => {
  await api.removeLostFound(5);
  expect(callApi).toHaveBeenCalledWith("/lost-founds/5", { method: "DELETE" });
});

it("statistik harian & bulanan", async () => {
  await api.fetchStatsDaily();
  await api.fetchStatsMonthly();
  expect(callApi).toHaveBeenNthCalledWith(1, "/lost-founds/stats/daily");
  expect(callApi).toHaveBeenNthCalledWith(2, "/lost-founds/stats/monthly");
});
