import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ChangeCoverModal from "./ChangeCoverModal";
import { postLostFoundCover } from "../api/lostFoundApi";
import { showWarningDialog } from "../../../helpers/toolsHelper";
import { renderWithProviders } from "../../../test-utils";

vi.mock("../api/lostFoundApi");
vi.mock("../../../helpers/toolsHelper", async (original) => ({
  ...(await original()),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn().mockResolvedValue({}),
  showWarningDialog: vi.fn(),
}));

const image = new File(["x"], "foto.png", { type: "image/png" });

const setup = (cover = null) => {
  const handlers = { onClose: vi.fn(), onSaved: vi.fn() };
  const view = renderWithProviders(<ChangeCoverModal item={{ id: 2, cover }} {...handlers} />);
  return { ...handlers, ...view };
};

beforeEach(() => {
  vi.clearAllMocks();
  URL.createObjectURL = vi.fn(() => "blob:pratinjau");
  URL.revokeObjectURL = vi.fn();
});

describe("ChangeCoverModal", () => {
  it("tanpa cover menampilkan placeholder dan tombol unggah nonaktif", () => {
    setup();
    expect(screen.getByText("Belum ada gambar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Unggah cover" })).toBeDisabled();
  });

  it("menampilkan cover yang sudah ada", () => {
    setup("uploads/lama.png");
    expect(screen.getByRole("img", { name: "Pratinjau cover" })).toHaveAttribute(
      "src",
      "https://open-api.delcom.org/uploads/lama.png",
    );
  });

  it("menolak berkas non-gambar", () => {
    setup();
    fireEvent.change(screen.getByLabelText("Berkas gambar"), {
      target: { files: [new File(["x"], "a.pdf", { type: "application/pdf" })] },
    });
    expect(showWarningDialog).toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Unggah cover" })).toBeDisabled();
  });

  it("memilih gambar menampilkan pratinjau, lalu mengunggah", async () => {
    postLostFoundCover.mockResolvedValue({});
    const { onClose, onSaved } = setup();
    await userEvent.upload(screen.getByLabelText("Berkas gambar"), image);
    expect(screen.getByRole("img", { name: "Pratinjau cover" })).toHaveAttribute("src", "blob:pratinjau");
    await userEvent.click(screen.getByRole("button", { name: "Unggah cover" }));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(postLostFoundCover).toHaveBeenCalledWith(2, image);
    expect(onClose).toHaveBeenCalled();
  });

  it("membatalkan pilihan berkas mengembalikan keadaan awal", async () => {
    setup();
    const input = screen.getByLabelText("Berkas gambar");
    await userEvent.upload(input, image);
    fireEvent.change(input, { target: { files: [] } });
    expect(screen.getByRole("button", { name: "Unggah cover" })).toBeDisabled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:pratinjau");
  });

  it("modal tetap terbuka bila upload gagal", async () => {
    postLostFoundCover.mockRejectedValue(new Error("gagal"));
    const { onClose, onSaved } = setup();
    await userEvent.upload(screen.getByLabelText("Berkas gambar"), image);
    await userEvent.click(screen.getByRole("button", { name: "Unggah cover" }));
    await waitFor(() => expect(postLostFoundCover).toHaveBeenCalled());
    expect(onSaved).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
