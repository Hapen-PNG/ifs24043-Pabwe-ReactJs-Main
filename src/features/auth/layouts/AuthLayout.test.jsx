import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { renderWithProviders, stateWith } from "../../../test-utils";

const tree = (
  <Routes>
    <Route path="/" element={<p>Beranda</p>} />
    <Route path="/auth" element={<AuthLayout />}>
      <Route path="login" element={<p>Isi login</p>} />
    </Route>
  </Routes>
);

describe("AuthLayout", () => {
  it("menampilkan banner dan konten anak untuk tamu", () => {
    renderWithProviders(tree, { route: "/auth/login" });
    expect(screen.getByText("Isi login")).toBeInTheDocument();
    expect(screen.getByText(/Biar kampus yang bantu cari/)).toBeInTheDocument();
  });

  it("mengalihkan ke beranda bila sudah punya token", () => {
    renderWithProviders(tree, { route: "/auth/login", preloadedState: stateWith({ auth: { token: "t" } }) });
    expect(screen.getByText("Beranda")).toBeInTheDocument();
  });
});
