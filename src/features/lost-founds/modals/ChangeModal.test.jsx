import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChangeModal from "./ChangeModal";
import { putLostFound } from "../api/lostFoundApi";
import { renderWithProviders } from "../../../test-utils";

vi.mock("../api/lostFoundApi");
vi.mock("../../../helpers/toolsHelper", async (original) => ({
  ...(await original()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn().mockResolvedValue({}),
}));

const item = { id: 4, title: "Tas", description: "Tas ransel warna biru", status: "found", is_completed: 0 };

const setup = () => {
  const handlers = { onClose: vi.fn(), onSaved: vi.fn() };
  renderWithProviders(<ChangeModal item={item} {...handlers} />);
  return handlers;
};

beforeEach(() => vi.clearAllMocks());

describe("ChangeModal", () => {
  it("terisi data laporan dan memiliki toggle selesai", () => {
    setup();
    expect(screen.getByLabelText("Judul")).toHaveValue("Tas");
    expect(screen.getByLabelText("Deskripsi")).toHaveValue("Tas ransel warna biru");
    expect(screen.getByRole("button", { name: "Barang Ditemukan" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByLabelText(/Tandai selesai/)).not.toBeChecked();
  });

  it("menyimpan perubahan termasuk status selesai", async () => {
    putLostFound.mockResolvedValue({});
    const { onClose, onSaved } = setup();
    await userEvent.clear(screen.getByLabelText("Judul"));
    await userEvent.type(screen.getByLabelText("Judul"), "Tas baru");
    await userEvent.click(screen.getByLabelText(/Tandai selesai/));
    await userEvent.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(putLostFound).toHaveBeenCalledWith(4, {
      title: "Tas baru", description: "Tas ransel warna biru", status: "found", is_completed: 1,
    });
    expect(onClose).toHaveBeenCalled();
  });

  it("mengirim is_completed 0 bila toggle tidak dicentang", async () => {
    putLostFound.mockResolvedValue({});
    setup();
    await userEvent.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    await waitFor(() => expect(putLostFound).toHaveBeenCalled());
    expect(putLostFound.mock.calls[0][1].is_completed).toBe(0);
  });

  it("tidak menutup modal saat API gagal", async () => {
    putLostFound.mockRejectedValue(new Error("gagal"));
    const { onClose, onSaved } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    await waitFor(() => expect(putLostFound).toHaveBeenCalled());
    expect(onSaved).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
