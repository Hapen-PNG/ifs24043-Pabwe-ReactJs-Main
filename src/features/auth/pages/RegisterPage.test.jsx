import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import RegisterPage from "./RegisterPage";
import { postRegister } from "../api/authApi";
import { renderWithProviders } from "../../../test-utils";

vi.mock("../api/authApi");
vi.mock("../../../helpers/toolsHelper", () => ({
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn().mockResolvedValue({}),
}));

const tree = (
  <Routes>
    <Route path="/auth/register" element={<RegisterPage />} />
    <Route path="/auth/login" element={<p>Halaman login</p>} />
  </Routes>
);

const fill = async (name, email, pass, confirm) => {
  await userEvent.type(screen.getByLabelText("Nama lengkap"), name);
  await userEvent.type(screen.getByLabelText("Email"), email);
  await userEvent.type(screen.getByLabelText("Kata sandi"), pass);
  await userEvent.type(screen.getByLabelText("Ulangi kata sandi"), confirm);
  await userEvent.click(screen.getByRole("button", { name: "Daftar" }));
};

beforeEach(() => vi.clearAllMocks());

describe("RegisterPage", () => {
  it("menolak input tidak valid", async () => {
    renderWithProviders(tree, { route: "/auth/register" });
    await fill("ab", "x", "123", "321");
    expect(screen.getByText("Nama minimal 3 karakter")).toBeInTheDocument();
    expect(screen.getByText("Format email tidak valid")).toBeInTheDocument();
    expect(screen.getByText("Kata sandi minimal 6 karakter")).toBeInTheDocument();
    expect(screen.getByText("Konfirmasi kata sandi tidak sama")).toBeInTheDocument();
    expect(postRegister).not.toHaveBeenCalled();
  });

  it("daftar berhasil lalu pindah ke halaman login", async () => {
    postRegister.mockResolvedValue({});
    const { store } = renderWithProviders(tree, { route: "/auth/register" });
    await fill("Budi", "budi@del.ac.id", "rahasia1", "rahasia1");
    expect(await screen.findByText("Halaman login")).toBeInTheDocument();
    expect(postRegister).toHaveBeenCalledWith({ name: "Budi", email: "budi@del.ac.id", password: "rahasia1" });
    expect(store.getState().auth.registered).toBe(true);
  });

  it("tetap di halaman daftar saat API gagal", async () => {
    postRegister.mockRejectedValue(new Error("Email sudah terdaftar"));
    renderWithProviders(tree, { route: "/auth/register" });
    await fill("Budi", "budi@del.ac.id", "rahasia1", "rahasia1");
    await waitFor(() => expect(postRegister).toHaveBeenCalled());
    expect(screen.getByRole("heading", { name: "Buat akun" })).toBeInTheDocument();
  });
});
