import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import DetailPage from "./DetailPage";
import * as api from "../api/lostFoundApi";
import { showConfirmDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";

vi.mock("../api/lostFoundApi");
vi.mock("../../../helpers/toolsHelper", async (original) => ({
  ...(await original()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn().mockResolvedValue({}),
  showWarningDialog: vi.fn(),
  showConfirmDialog: vi.fn(),
}));

const ITEM = {
  id: 5, title: "Laptop hitam", description: "Laptop dengan stiker kucing", status: "lost",
  is_completed: 0, cover: "uploads/laptop.png", created_at: "2026-03-01T00:00:00Z", user: { name: "Siti" },
};

const tree = (
  <Routes>
    <Route path="/" element={<p>Beranda</p>} />
    <Route path="/lost-founds/:id" element={<DetailPage />} />
  </Routes>
);
const open = () => renderWithProviders(tree, { route: "/lost-founds/5" });

beforeEach(() => {
  vi.clearAllMocks();
  api.fetchLostFound.mockResolvedValue({ data: { lost_found: ITEM } });
});

describe("DetailPage", () => {
  it("menampilkan status memuat lalu rincian laporan lengkap", async () => {
    open();
    expect(screen.getByRole("status")).toHaveTextContent("Memuat detail");
    expect(await screen.findByRole("heading", { name: "Laptop hitam" })).toBeInTheDocument();
    expect(api.fetchLostFound).toHaveBeenCalledWith("5");
    expect(screen.getByText("Siti")).toBeInTheDocument();
    expect(screen.getByText("Laptop dengan stiker kucing")).toBeInTheDocument();
    expect(screen.getByText("Belum selesai")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Cover Laptop hitam" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Kembali ke daftar/ })).toBeInTheDocument();
  });

  it("laporan selesai tanpa cover", async () => {
    api.fetchLostFound.mockResolvedValue({ data: { lost_found: { ...ITEM, cover: null, is_completed: 1 } } });
    open();
    expect(await screen.findByText("Belum ada foto cover")).toBeInTheDocument();
    expect(screen.getByText("Selesai")).toBeInTheDocument();
  });

  it("kembali ke beranda bila laporan tidak ditemukan", async () => {
    api.fetchLostFound.mockRejectedValue(new Error("404"));
    open();
    expect(await screen.findByText("Beranda")).toBeInTheDocument();
  });

  it("ubah data: membuka modal, menyimpan, dan memuat ulang rincian", async () => {
    api.putLostFound.mockResolvedValue({});
    open();
    await screen.findByRole("heading", { name: "Laptop hitam" });
    await userEvent.click(screen.getByRole("button", { name: /Ubah data/ }));
    expect(screen.getByRole("dialog", { name: "Ubah laporan" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    await waitFor(() => expect(api.putLostFound).toHaveBeenCalledWith(5, expect.any(Object)));
    await waitFor(() => expect(api.fetchLostFound).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("ganti cover: modal terbuka dan dapat ditutup", async () => {
    open();
    await screen.findByRole("heading", { name: "Laptop hitam" });
    await userEvent.click(screen.getByRole("button", { name: /Ganti cover/ }));
    expect(screen.getByRole("dialog", { name: "Ganti foto cover" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Tutup" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("modal ubah data dapat ditutup tanpa menyimpan", async () => {
    open();
    await screen.findByRole("heading", { name: "Laptop hitam" });
    await userEvent.click(screen.getByRole("button", { name: /Ubah data/ }));
    await userEvent.click(screen.getByRole("button", { name: "Tutup" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("hapus dikonfirmasi -> kembali ke beranda", async () => {
    showConfirmDialog.mockResolvedValue(true);
    api.removeLostFound.mockResolvedValue({});
    open();
    await screen.findByRole("heading", { name: "Laptop hitam" });
    await userEvent.click(screen.getByRole("button", { name: /Hapus/ }));
    expect(await screen.findByText("Beranda")).toBeInTheDocument();
    expect(api.removeLostFound).toHaveBeenCalledWith("5");
  });

  it("hapus dibatalkan -> tetap di halaman detail", async () => {
    showConfirmDialog.mockResolvedValue(false);
    open();
    await screen.findByRole("heading", { name: "Laptop hitam" });
    await userEvent.click(screen.getByRole("button", { name: /Hapus/ }));
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
    expect(screen.getByRole("heading", { name: "Laptop hitam" })).toBeInTheDocument();
  });
});
