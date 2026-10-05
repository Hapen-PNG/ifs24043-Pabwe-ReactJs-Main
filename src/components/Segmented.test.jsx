import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Segmented from "./Segmented";

it("menandai opsi aktif dan memanggil onChange", async () => {
  const onChange = vi.fn();
  render(<Segmented label="Jenis" value="a" options={[["a", "Satu"], ["b", "Dua"]]} onChange={onChange} />);
  expect(screen.getByRole("button", { name: "Satu" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("button", { name: "Dua" })).toHaveAttribute("aria-pressed", "false");
  await userEvent.click(screen.getByRole("button", { name: "Dua" }));
  expect(onChange).toHaveBeenCalledWith("b");
});
