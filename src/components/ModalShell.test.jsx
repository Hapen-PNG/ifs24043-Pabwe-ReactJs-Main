import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ModalShell from "./ModalShell";

const setup = () => {
  const onClose = vi.fn();
  render(<ModalShell title="Judul" subtitle="Sub" onClose={onClose}><p>Isi dialog</p></ModalShell>);
  return onClose;
};

it("menampilkan judul, subjudul, dan isi", () => {
  setup();
  expect(screen.getByRole("dialog", { name: "Judul" })).toBeInTheDocument();
  expect(screen.getByText("Sub")).toBeInTheDocument();
  expect(screen.getByText("Isi dialog")).toBeInTheDocument();
});

it("menutup lewat tombol X dan backdrop", async () => {
  const onClose = setup();
  await userEvent.click(screen.getByRole("button", { name: "Tutup" }));
  await userEvent.click(screen.getByTestId("modal-backdrop"));
  expect(onClose).toHaveBeenCalledTimes(2);
});

it("menutup dengan Escape tetapi mengabaikan tombol lain", async () => {
  const onClose = setup();
  await userEvent.keyboard("a");
  expect(onClose).not.toHaveBeenCalled();
  await userEvent.keyboard("{Escape}");
  expect(onClose).toHaveBeenCalledTimes(1);
});
