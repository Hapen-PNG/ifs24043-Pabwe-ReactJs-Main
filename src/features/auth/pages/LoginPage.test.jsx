import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "./LoginPage";
import { postLogin } from "../api/authApi";
import { renderWithProviders } from "../../../test-utils";

vi.mock("../api/authApi");
vi.mock("../../../helpers/toolsHelper", () => ({ showErrorDialog: vi.fn(), showSuccessDialog: vi.fn() }));

beforeEach(() => vi.clearAllMocks());

describe("LoginPage", () => {
  it("menampilkan error validasi dan tidak memanggil API", async () => {
    renderWithProviders(<LoginPage />);
    await userEvent.type(screen.getByLabelText("Email"), "salah");
    await userEvent.type(screen.getByLabelText("Kata sandi"), "123");
    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));
    expect(screen.getByText("Format email tidak valid")).toBeInTheDocument();
    expect(screen.getByText("Kata sandi minimal 6 karakter")).toBeInTheDocument();
    expect(postLogin).not.toHaveBeenCalled();
  });

  it("toggle tampilkan/sembunyikan kata sandi", async () => {
    renderWithProviders(<LoginPage />);
    const input = screen.getByLabelText("Kata sandi");
    expect(input).toHaveAttribute("type", "password");
    await userEvent.click(screen.getByRole("button", { name: "Tampilkan kata sandi" }));
    expect(input).toHaveAttribute("type", "text");
    await userEvent.click(screen.getByRole("button", { name: "Sembunyikan kata sandi" }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("login berhasil menyimpan token ke store", async () => {
    postLogin.mockResolvedValue({ data: { token: "JWT" } });
    const { store } = renderWithProviders(<LoginPage />);
    await userEvent.type(screen.getByLabelText("Email"), "a@b.co");
    await userEvent.type(screen.getByLabelText("Kata sandi"), "rahasia1");
    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));
    await waitFor(() => expect(store.getState().auth.token).toBe("JWT"));
    expect(postLogin).toHaveBeenCalledWith({ email: "a@b.co", password: "rahasia1" });
  });

  it("login gagal tidak mengubah token", async () => {
    postLogin.mockRejectedValue(new Error("Kredensial salah"));
    const { store } = renderWithProviders(<LoginPage />);
    await userEvent.type(screen.getByLabelText("Email"), "a@b.co");
    await userEvent.type(screen.getByLabelText("Kata sandi"), "rahasia1");
    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));
    await waitFor(() => expect(postLogin).toHaveBeenCalled());
    expect(store.getState().auth.token).toBeNull();
  });
});
