import { beforeEach, expect, it, vi } from "vitest";
import { fetchMe, fetchUsers, postMyPhoto, putMe, putMyPassword } from "./userApi";
import { callApi } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper", () => ({ callApi: vi.fn().mockResolvedValue({}) }));
beforeEach(() => vi.clearAllMocks());

it("GET /users dan /auth/me", async () => {
  await fetchUsers();
  await fetchMe();
  expect(callApi).toHaveBeenNthCalledWith(1, "/users");
  expect(callApi).toHaveBeenNthCalledWith(2, "/auth/me");
});

it("PUT /users/me dan /users/me/password", async () => {
  await putMe({ name: "a" });
  await putMyPassword({ password: "x", new_password: "y" });
  expect(callApi).toHaveBeenNthCalledWith(1, "/users/me", { method: "PUT", body: { name: "a" } });
  expect(callApi).toHaveBeenNthCalledWith(2, "/users/me/password", {
    method: "PUT",
    body: { password: "x", new_password: "y" },
  });
});

it("POST /users/me/photo mengirim FormData berisi field photo", async () => {
  const file = new File(["x"], "a.png", { type: "image/png" });
  await postMyPhoto(file);
  const [path, options] = callApi.mock.calls[0];
  expect(path).toBe("/users/me/photo");
  expect(options.form.get("photo")).toBe(file);
});
