import { expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Avatar from "./Avatar";

it("menampilkan foto bila tersedia", () => {
  render(<Avatar name="Budi Santoso" photo="uploads/b.png" />);
  expect(screen.getByRole("img", { name: "Foto Budi Santoso" })).toHaveAttribute(
    "src",
    "https://open-api.delcom.org/uploads/b.png",
  );
});

it("menampilkan inisial bila tanpa foto", () => {
  render(<Avatar name="Budi Santoso" photo={null} />);
  expect(screen.getByLabelText("Inisial Budi Santoso")).toHaveTextContent("BS");
});
