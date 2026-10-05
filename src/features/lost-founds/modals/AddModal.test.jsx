import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddModal from "./AddModal";
import { postLostFound } from "../api/lostFoundApi";
import { renderWithProviders, stateWith } from "../../../test-utils";

vi.mock("../api/lostFoundApi");
vi.mock("../../../helpers/toolsHelper", async (original) => ({
  ...(await original()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn().mockResolvedValue({}),
}));

const setup = (preloadedState) => {
  const handlers = { onClose: vi.fn(), onSaved: vi.fn() };
  renderWithProviders(<AddModal {...handlers} />, { preloadedState });
  return handlers;
};

const fillForm = async (title = "Kunci motor", description = "Kunci Honda warna hitam") => {
  await userEvent.type(screen.getByLabelText("Judul"), title);
  await userEvent.type(screen.getByLabelText("Deskripsi"), description);
};

beforeEach(() => vi.clearAllMocks());

describe("AddModal", () => {
  it("menampilkan form dengan jenis 'Barang Hilang' terpilih bawaan", () => {
    setup();
    expect(screen.getByRole("dialog", { name: "Buat laporan baru" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Barang Hilang" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByLabelText(/Tandai selesai/)).not.toBeInTheDocument();
  });

  it("validasi: judul & deskripsi wajib", async () => {
    const { onClose } = setup();
    await userEvent.type(screen.getByLabelText("Deskripsi"), "pendek");
    await userEvent.click(screen.getByRole("button", { name: "Kirim laporan" }));
    expect(screen.getByText("Judul wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Deskripsi minimal 10 karakter")).toBeInTheDocument();
    expect(postLostFound).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("mengirim laporan 'ditemukan' lalu menutup modal", async () => {
    postLostFound.mockResolvedValue({});
    const { onClose, onSaved } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Barang Ditemukan" }));
    await fillForm();
    await userEvent.click(screen.getByRole("button", { name: "Kirim laporan" }));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(postLostFound).toHaveBeenCalledWith({
      title: "Kunci motor", description: "Kunci Honda warna hitam", status: "found",
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("tetap terbuka bila API gagal", async () => {
    postLostFound.mockRejectedValue(new Error("gagal"));
    const { onClose, onSaved } = setup();
    await fillForm();
    await userEvent.click(screen.getByRole("button", { name: "Kirim laporan" }));
    await waitFor(() => expect(postLostFound).toHaveBeenCalled());
    expect(onSaved).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("tombol kirim nonaktif saat proses berjalan", () => {
    setup(stateWith({ lostFounds: { isLostFoundAdd: true } }));
    expect(screen.getByRole("button", { name: "Kirim laporan" })).toBeDisabled();
  });
});
