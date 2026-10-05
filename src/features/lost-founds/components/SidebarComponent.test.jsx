import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SidebarComponent from "./SidebarComponent";
import { renderWithProviders } from "../../../test-utils";

const setup = (route, open = false) => {
  const onClose = vi.fn();
  renderWithProviders(<SidebarComponent open={open} onClose={onClose} />, { route });
  return onClose;
};

describe("SidebarComponent", () => {
  it.each([
    ["/", "Laporan"],
    ["/lost-founds/3", "Laporan"],
    ["/?tampilan=statistik", "Statistik"],
    ["/users", "Pengguna"],
    ["/profile", "Profil Saya"],
  ])("rute %s menandai menu %s sebagai aktif", (route, label) => {
    setup(route);
    expect(screen.getByRole("link", { name: label })).toHaveAttribute("aria-current", "page");
    expect(screen.getAllByRole("link", { current: "page" })).toHaveLength(1);
  });

  it("drawer tertutup tidak menampilkan overlay", () => {
    setup("/");
    expect(screen.queryByTestId("sidebar-overlay")).not.toBeInTheDocument();
  });

  it("drawer terbuka: overlay, tombol tutup, dan klik menu memanggil onClose", async () => {
    const onClose = setup("/", true);
    await userEvent.click(screen.getByTestId("sidebar-overlay"));
    await userEvent.click(screen.getByRole("button", { name: "Tutup menu" }));
    await userEvent.click(screen.getByRole("link", { name: "Pengguna" }));
    await userEvent.click(screen.getByRole("link", { name: /TemuBalik/ }));
    expect(onClose).toHaveBeenCalledTimes(4);
  });
});
