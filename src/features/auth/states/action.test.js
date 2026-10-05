import { beforeEach, describe, expect, it, vi } from "vitest";
import { asyncLogin, asyncLogout, asyncRegister } from "./action";
import { isAuthLogin, isAuthLogout, isAuthRegister } from "./reducer";
import { postLogin, postRegister } from "../api/authApi";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

vi.mock("../api/authApi");
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn().mockResolvedValue({}),
}));

const dispatch = vi.fn();
beforeEach(() => vi.clearAllMocks());

describe("asyncLogin", () => {
  it("menyimpan token dan dispatch isAuthLogin", async () => {
    postLogin.mockResolvedValue({ data: { token: "T" } });
    expect(await asyncLogin({ email: "e" })(dispatch)).toBe(true);
    expect(getAccessToken()).toBe("T");
    expect(dispatch).toHaveBeenCalledWith(isAuthLogin("T"));
  });

  it("menampilkan dialog error saat gagal", async () => {
    postLogin.mockRejectedValue(new Error("salah"));
    expect(await asyncLogin({})(dispatch)).toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("salah");
  });
});

describe("asyncRegister", () => {
  it("sukses -> dispatch isAuthRegister + dialog sukses", async () => {
    postRegister.mockResolvedValue({});
    expect(await asyncRegister({})(dispatch)).toBe(true);
    expect(dispatch).toHaveBeenCalledWith(isAuthRegister());
    expect(showSuccessDialog).toHaveBeenCalled();
  });

  it("gagal -> dialog error", async () => {
    postRegister.mockRejectedValue(new Error("email dipakai"));
    expect(await asyncRegister({})(dispatch)).toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("email dipakai");
  });
});

it("asyncLogout menghapus token dan dispatch isAuthLogout", () => {
  putAccessToken("x");
  asyncLogout()(dispatch);
  expect(getAccessToken()).toBeNull();
  expect(dispatch).toHaveBeenCalledWith(isAuthLogout());
});
