import { beforeEach, expect, it, vi } from "vitest";
import { postLogin, postRegister } from "./authApi";
import { callApi } from "../../../helpers/apiHelper";

vi.mock("../../../helpers/apiHelper", () => ({ callApi: vi.fn().mockResolvedValue({ ok: true }) }));
beforeEach(() => vi.clearAllMocks());

it("postRegister -> POST /auth/register", async () => {
  await postRegister({ name: "a" });
  expect(callApi).toHaveBeenCalledWith("/auth/register", { method: "POST", body: { name: "a" } });
});

it("postLogin -> POST /auth/login", async () => {
  await postLogin({ email: "a" });
  expect(callApi).toHaveBeenCalledWith("/auth/login", { method: "POST", body: { email: "a" } });
});
