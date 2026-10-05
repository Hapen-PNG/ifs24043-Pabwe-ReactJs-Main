import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import NavbarComponent from "./NavbarComponent";
import { renderWithProviders, stateWith } from "../../../test-utils";

const profile = { id: 1, name: "Budi Santoso", email: "budi@del.ac.id", photo: null };
const preloadedState = stateWith({ auth: { token: "t" }, users: { profile } });

const setup = (onOpenMenu = vi.fn()) =>
  renderWithProviders(
    <Routes>
      <Route path="/" element={<NavbarComponent onOpenMenu={onOpenMenu} />} />
      <Route path="/profile" element={<p>Halaman profil</p>} />
      <Route path="/auth/login" element={<p>Halaman login</p>} />
    </Routes>,
    { preloadedState },
  );

describe("NavbarComponent", () => {
  it("menampilkan judul, status sesi, dan nama pengguna", () => {
    setup();
    expect(screen.getByRole("heading", { name: /Pusat Lost/ })).toBeInTheDocument();
    expect(screen.getByText("Sesi aktif")).toBeInTheDocument();
    expect(screen.getByText("Budi Santoso")).toBeInTheDocument();
  });

  it("tidak merender apa pun saat profil belum ada (sesi berakhir)", () => {
    const { container } = renderWithProviders(<NavbarComponent onOpenMenu={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("tombol hamburger memanggil onOpenMenu", async () => {
    const onOpenMenu = vi.fn();
    setup(onOpenMenu);
    await userEvent.click(screen.getByRole("button", { name: "Buka menu" }));
    expect(onOpenMenu).toHaveBeenCalled();
  });

  it("dropdown dapat dibuka dan ditutup", async () => {
    setup();
    const trigger = screen.getByRole("button", { name: /Budi Santoso/ });
    await userEvent.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByText("budi@del.ac.id")).toBeInTheDocument();
    await userEvent.click(trigger);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("menu Profil saya menutup dropdown dan berpindah halaman", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /Budi Santoso/ }));
    await userEvent.click(screen.getByRole("menuitem", { name: /Profil saya/ }));
    expect(screen.getByText("Halaman profil")).toBeInTheDocument();
  });

  it("logout menghapus token dan mengarahkan ke login", async () => {
    localStorage.setItem("temubalik.token", "t");
    const { store } = setup();
    await userEvent.click(screen.getByRole("button", { name: /Budi Santoso/ }));
    await userEvent.click(screen.getByRole("menuitem", { name: /Keluar/ }));
    expect(store.getState().auth.token).toBeNull();
    expect(localStorage.getItem("temubalik.token")).toBeNull();
    expect(screen.getByText("Halaman login")).toBeInTheDocument();
  });
});
