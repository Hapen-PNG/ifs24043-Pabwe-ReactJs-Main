import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ItemCard, { StatusPill } from "./ItemCard";
import { renderWithProviders } from "../../../test-utils";

const base = {
  id: 7, title: "Dompet", description: "Dompet kulit", status: "lost",
  is_completed: 0, cover: null, created_at: "2026-03-01T00:00:00Z",
};

const setup = (item) => {
  const handlers = { onToggleDone: vi.fn(), onDelete: vi.fn() };
  renderWithProviders(<ItemCard item={item} {...handlers} />);
  return handlers;
};

describe("ItemCard", () => {
  it("laporan hilang tanpa cover & belum selesai", async () => {
    const handlers = setup(base);
    expect(screen.getByText("Hilang")).toBeInTheDocument();
    expect(screen.queryByText("Selesai")).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Lihat detail" })).toHaveAttribute("href", "/lost-founds/7");
    await userEvent.click(screen.getByRole("button", { name: "Tandai selesai Dompet" }));
    await userEvent.click(screen.getByRole("button", { name: "Hapus Dompet" }));
    expect(handlers.onToggleDone).toHaveBeenCalledWith(base);
    expect(handlers.onDelete).toHaveBeenCalledWith(base);
  });

  it("laporan ditemukan, selesai, dengan cover", () => {
    setup({ ...base, status: "found", is_completed: 1, cover: "uploads/d.png" });
    expect(screen.getByText("Ditemukan")).toBeInTheDocument();
    expect(screen.getByText("Selesai")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Cover Dompet" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Buka kembali Dompet" })).toBeInTheDocument();
  });

  it("StatusPill berdiri sendiri", () => {
    renderWithProviders(<StatusPill status="found" />);
    expect(screen.getByText("Ditemukan")).toBeInTheDocument();
  });
});
