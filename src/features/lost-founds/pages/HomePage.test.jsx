import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomePage from "./HomePage";
import * as api from "../api/lostFoundApi";
import { showConfirmDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";

vi.mock("../api/lostFoundApi");
vi.mock("../../../helpers/toolsHelper", async (original) => ({
  ...(await original()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn().mockResolvedValue({}),
  showConfirmDialog: vi.fn(),
}));

const make = (id, over) => ({
  id, title: `Barang ${id}`, description: `Deskripsi barang nomor ${id}`, status: "lost",
  is_completed: 0, cover: null, created_at: "2026-03-01T00:00:00Z", ...over,
});
const ITEMS = [
  make(1, { title: "Dompet cokelat" }),
  make(2, { title: "Kunci motor", status: "found" }),
  make(3, { title: "Botol minum", status: "found", is_completed: 1 }),
  make(4, { title: "Payung", is_completed: 1 }),
];

const cardTitles = () => screen.queryAllByRole("heading", { level: 3 }).map((h) => h.textContent);

beforeEach(() => {
  vi.clearAllMocks();
  api.fetchLostFounds.mockResolvedValue({ data: { lost_founds: ITEMS } });
});

describe("HomePage", () => {
  it("menampilkan status memuat lalu daftar kartu", async () => {
    api.fetchLostFounds.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<HomePage />);
    expect(screen.getByRole("status")).toHaveTextContent("Memuat laporan");
  });

  it("menghitung ringkasan statistik dari data", async () => {
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet cokelat");
    const tile = (label) => screen.getByText(label).parentElement;
    expect(within(tile("Total laporan")).getByText("4")).toBeInTheDocument();
    expect(within(tile("Barang hilang")).getByText("2")).toBeInTheDocument();
    expect(within(tile("Barang ditemukan")).getByText("2")).toBeInTheDocument();
    expect(within(tile("Sudah selesai")).getByText("2")).toBeInTheDocument();
  });

  it("filter jenis dan progres bekerja", async () => {
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet cokelat");
    const jenis = screen.getByRole("group", { name: "Jenis" });
    const progres = screen.getByRole("group", { name: "Progres" });

    await userEvent.click(within(jenis).getByRole("button", { name: "Ditemukan" }));
    expect(cardTitles()).toEqual(["Kunci motor", "Botol minum"]);
    await userEvent.click(within(progres).getByRole("button", { name: "Selesai" }));
    expect(cardTitles()).toEqual(["Botol minum"]);
    await userEvent.click(within(progres).getByRole("button", { name: "Berjalan" }));
    expect(cardTitles()).toEqual(["Kunci motor"]);
    await userEvent.click(within(jenis).getByRole("button", { name: "Semua" }));
    await userEvent.click(within(progres).getByRole("button", { name: "Semua" }));
    expect(cardTitles()).toHaveLength(4);
  });

  it("pencarian langsung menyaring judul/deskripsi dan menampilkan keadaan kosong", async () => {
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet cokelat");
    await userEvent.type(screen.getByLabelText("Cari laporan"), "payung");
    expect(cardTitles()).toEqual(["Payung"]);
    await userEvent.clear(screen.getByLabelText("Cari laporan"));
    await userEvent.type(screen.getByLabelText("Cari laporan"), "tidak-ada");
    expect(screen.getByText("Tidak ada laporan yang cocok.")).toBeInTheDocument();
  });

  it("cakupan 'Laporan saya' memuat ulang dengan is_me=1", async () => {
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet cokelat");
    expect(api.fetchLostFounds).toHaveBeenLastCalledWith({ is_me: undefined });
    await userEvent.click(screen.getByRole("button", { name: "Laporan saya" }));
    await waitFor(() => expect(api.fetchLostFounds).toHaveBeenLastCalledWith({ is_me: 1 }));
  });

  it("aksi cepat: tandai selesai dan buka kembali", async () => {
    api.putLostFound.mockResolvedValue({});
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet cokelat");
    await userEvent.click(screen.getByRole("button", { name: "Tandai selesai Dompet cokelat" }));
    await waitFor(() =>
      expect(api.putLostFound).toHaveBeenCalledWith(1, {
        title: "Dompet cokelat", description: "Deskripsi barang nomor 1", status: "lost", is_completed: 1,
      }),
    );
    await waitFor(() => expect(api.fetchLostFounds).toHaveBeenCalledTimes(2));
    await userEvent.click(screen.getByRole("button", { name: "Buka kembali Payung" }));
    await waitFor(() => expect(api.putLostFound.mock.calls[1][1].is_completed).toBe(0));
  });

  it("aksi cepat gagal tidak memuat ulang daftar", async () => {
    api.putLostFound.mockRejectedValue(new Error("gagal"));
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet cokelat");
    await userEvent.click(screen.getByRole("button", { name: "Tandai selesai Dompet cokelat" }));
    await waitFor(() => expect(api.putLostFound).toHaveBeenCalled());
    expect(api.fetchLostFounds).toHaveBeenCalledTimes(1);
  });

  it("hapus: batal vs konfirmasi", async () => {
    api.removeLostFound.mockResolvedValue({});
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet cokelat");

    showConfirmDialog.mockResolvedValueOnce(false);
    await userEvent.click(screen.getByRole("button", { name: "Hapus Dompet cokelat" }));
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalledTimes(1));
    expect(api.removeLostFound).not.toHaveBeenCalled();

    showConfirmDialog.mockResolvedValueOnce(true);
    await userEvent.click(screen.getByRole("button", { name: "Hapus Dompet cokelat" }));
    await waitFor(() => expect(api.removeLostFound).toHaveBeenCalledWith(1));
    await waitFor(() => expect(api.fetchLostFounds).toHaveBeenCalledTimes(2));
  });

  it("modal tambah laporan: buka, simpan, dan muat ulang daftar", async () => {
    api.postLostFound.mockResolvedValue({});
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet cokelat");
    await userEvent.click(screen.getByRole("button", { name: /Buat laporan/ }));
    await userEvent.type(screen.getByLabelText("Judul"), "Laptop");
    await userEvent.type(screen.getByLabelText("Deskripsi"), "Laptop hitam stiker kucing");
    await userEvent.click(screen.getByRole("button", { name: "Kirim laporan" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(api.fetchLostFounds).toHaveBeenCalledTimes(2);
  });

  it("modal tambah laporan dapat ditutup", async () => {
    renderWithProviders(<HomePage />);
    await screen.findByText("Dompet cokelat");
    await userEvent.click(screen.getByRole("button", { name: /Buat laporan/ }));
    await userEvent.click(screen.getByRole("button", { name: "Tutup" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("tampilan statistik menampilkan panel statistik, bukan daftar kartu", async () => {
    api.fetchStatsDaily.mockResolvedValue({ data: [{ date: "Sen", total: 1 }] });
    api.fetchStatsMonthly.mockResolvedValue({ data: [] });
    renderWithProviders(<HomePage />, { route: "/?tampilan=statistik" });
    expect(screen.getByRole("heading", { name: "Statistik laporan" })).toBeInTheDocument();
    expect(await screen.findByRole("region", { name: "Laporan harian" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Cari laporan")).not.toBeInTheDocument();
  });
});
