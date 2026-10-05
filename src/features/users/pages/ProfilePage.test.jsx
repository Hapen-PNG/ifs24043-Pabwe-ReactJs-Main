import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfilePage from "./ProfilePage";
import { fetchMe, postMyPhoto, putMe, putMyPassword } from "../api/userApi";
import { showWarningDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders, stateWith } from "../../../test-utils";

vi.mock("../api/userApi");
vi.mock("../../../helpers/toolsHelper", async (original) => ({
  ...(await original()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
  showWarningDialog: vi.fn(),
}));

const ME = { id: 1, name: "Budi Santoso", email: "budi@del.ac.id", photo: null };
const setup = (patch = {}) =>
  renderWithProviders(<ProfilePage />, { preloadedState: stateWith({ users: { profile: ME, ...patch } }) });

beforeEach(() => {
  vi.clearAllMocks();
  fetchMe.mockResolvedValue({ data: { user: { ...ME, name: "Budi Baru" } } });
});

describe("ProfilePage", () => {
  it("menampilkan identitas dan form terisi", () => {
    setup();
    expect(screen.getByRole("heading", { name: "Budi Santoso" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nama")).toHaveValue("Budi Santoso");
    expect(screen.getByLabelText("Email")).toHaveValue("budi@del.ac.id");
  });

  it("mengubah data diri dan menyegarkan profil", async () => {
    putMe.mockResolvedValue({});
    const { store } = setup();
    await userEvent.clear(screen.getByLabelText("Nama"));
    await userEvent.type(screen.getByLabelText("Nama"), "  Budi Baru ");
    await userEvent.click(screen.getByRole("button", { name: "Simpan data diri" }));
    await waitFor(() => expect(putMe).toHaveBeenCalledWith({ name: "Budi Baru", email: "budi@del.ac.id" }));
    await waitFor(() => expect(store.getState().users.profile.name).toBe("Budi Baru"));
  });

  it("tombol unggah foto nonaktif tanpa berkas; menolak non-gambar", () => {
    setup();
    expect(screen.getByRole("button", { name: "Unggah foto" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Pilih foto"), {
      target: { files: [new File(["x"], "a.txt", { type: "text/plain" })] },
    });
    expect(showWarningDialog).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Unggah foto" })).toBeDisabled();
  });

  it("mengunggah foto lalu mengosongkan pilihan; pilihan kosong diabaikan", async () => {
    postMyPhoto.mockResolvedValue({});
    setup();
    const input = screen.getByLabelText("Pilih foto");
    const file = new File(["x"], "a.png", { type: "image/png" });
    await userEvent.upload(input, file);
    expect(screen.getByRole("button", { name: "Unggah foto" })).toBeEnabled();
    await userEvent.click(screen.getByRole("button", { name: "Unggah foto" }));
    await waitFor(() => expect(postMyPhoto).toHaveBeenCalledWith(file));
    await waitFor(() => expect(screen.getByRole("button", { name: "Unggah foto" })).toBeDisabled());
    fireEvent.change(input, { target: { files: [] } });
    expect(screen.getByRole("button", { name: "Unggah foto" })).toBeDisabled();
  });

  it("foto tetap terpilih bila unggah gagal", async () => {
    postMyPhoto.mockRejectedValue(new Error("gagal"));
    setup();
    await userEvent.upload(screen.getByLabelText("Pilih foto"), new File(["x"], "a.png", { type: "image/png" }));
    await userEvent.click(screen.getByRole("button", { name: "Unggah foto" }));
    await waitFor(() => expect(postMyPhoto).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: "Unggah foto" })).toBeEnabled();
  });

  it("validasi ganti kata sandi", async () => {
    setup();
    await userEvent.type(screen.getByLabelText("Kata sandi baru"), "123");
    await userEvent.type(screen.getByLabelText("Ulangi kata sandi baru"), "321");
    await userEvent.click(screen.getByRole("button", { name: "Ubah kata sandi" }));
    expect(screen.getByText("Kata sandi saat ini wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Kata sandi baru minimal 6 karakter")).toBeInTheDocument();
    expect(screen.getByText("Konfirmasi tidak sama")).toBeInTheDocument();
    expect(putMyPassword).not.toHaveBeenCalled();
  });

  it("ganti kata sandi berhasil mengosongkan form", async () => {
    putMyPassword.mockResolvedValue({});
    setup();
    await userEvent.type(screen.getByLabelText("Kata sandi saat ini"), "lama123");
    await userEvent.type(screen.getByLabelText("Kata sandi baru"), "baru1234");
    await userEvent.type(screen.getByLabelText("Ulangi kata sandi baru"), "baru1234");
    await userEvent.click(screen.getByRole("button", { name: "Ubah kata sandi" }));
    await waitFor(() => expect(putMyPassword).toHaveBeenCalledWith({ password: "lama123", new_password: "baru1234" }));
    await waitFor(() => expect(screen.getByLabelText("Kata sandi baru")).toHaveValue(""));
  });

  it("form kata sandi tidak dikosongkan bila API gagal", async () => {
    putMyPassword.mockRejectedValue(new Error("sandi salah"));
    setup();
    await userEvent.type(screen.getByLabelText("Kata sandi saat ini"), "lama123");
    await userEvent.type(screen.getByLabelText("Kata sandi baru"), "baru1234");
    await userEvent.type(screen.getByLabelText("Ulangi kata sandi baru"), "baru1234");
    await userEvent.click(screen.getByRole("button", { name: "Ubah kata sandi" }));
    await waitFor(() => expect(putMyPassword).toHaveBeenCalled());
    expect(screen.getByLabelText("Kata sandi baru")).toHaveValue("baru1234");
  });
});
