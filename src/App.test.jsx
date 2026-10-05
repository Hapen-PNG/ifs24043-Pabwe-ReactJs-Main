import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import App from "./App";
import { fetchMe, fetchUsers } from "./features/users/api/userApi";
import { fetchLostFounds, fetchLostFound } from "./features/lost-founds/api/lostFoundApi";
import { renderWithProviders, stateWith } from "./test-utils";

vi.mock("./features/users/api/userApi");
vi.mock("./features/lost-founds/api/lostFoundApi");
vi.mock("./helpers/toolsHelper", async (original) => ({ ...(await original()), showErrorDialog: vi.fn() }));

const ME = { id: 1, name: "Budi Santoso", email: "b@del.ac.id", photo: null };
const signedIn = () => stateWith({ auth: { token: "t" } });

beforeEach(() => {
  vi.clearAllMocks();
  fetchMe.mockResolvedValue({ data: { user: ME } });
  fetchUsers.mockResolvedValue({ data: { users: [ME] } });
  fetchLostFounds.mockResolvedValue({
    data: { lost_founds: [{ id: 9, title: "Jam tangan", description: "Jam tangan hitam", status: "lost", is_completed: 0, created_at: "2026-03-01" }] },
  });
  fetchLostFound.mockResolvedValue({
    data: { lost_found: { id: 9, title: "Jam tangan", description: "Jam tangan hitam", status: "lost", is_completed: 0, created_at: "2026-03-01" } },
  });
});

describe("App routing", () => {
  it("tamu yang membuka / diarahkan ke halaman login", () => {
    renderWithProviders(<App />);
    expect(screen.getByRole("heading", { name: "Masuk" })).toBeInTheDocument();
  });

  it("/auth otomatis ke /auth/login", () => {
    renderWithProviders(<App />, { route: "/auth" });
    expect(screen.getByRole("heading", { name: "Masuk" })).toBeInTheDocument();
  });

  it("/auth/register menampilkan form pendaftaran", () => {
    renderWithProviders(<App />, { route: "/auth/register" });
    expect(screen.getByRole("heading", { name: "Buat akun" })).toBeInTheDocument();
  });

  it("pengguna login melihat dashboard di /", async () => {
    renderWithProviders(<App />, { preloadedState: signedIn() });
    expect(await screen.findByText("Jam tangan")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Daftar laporan" })).toBeInTheDocument();
  });

  it("pengguna login yang membuka /auth dilempar ke dashboard", async () => {
    renderWithProviders(<App />, { route: "/auth/login", preloadedState: signedIn() });
    expect(await screen.findByText("Jam tangan")).toBeInTheDocument();
  });

  it("/lost-founds/:id menampilkan detail", async () => {
    renderWithProviders(<App />, { route: "/lost-founds/9", preloadedState: signedIn() });
    expect(await screen.findByRole("heading", { name: "Jam tangan", level: 2 })).toBeInTheDocument();
  });

  it("/users menampilkan daftar pengguna", async () => {
    renderWithProviders(<App />, { route: "/users", preloadedState: signedIn() });
    expect(await screen.findByRole("heading", { name: "Komunitas pengguna" })).toBeInTheDocument();
  });

  it("/profile menampilkan pengaturan akun", async () => {
    renderWithProviders(<App />, { route: "/profile", preloadedState: signedIn() });
    expect(await screen.findByRole("heading", { name: "Ganti kata sandi" })).toBeInTheDocument();
  });

  it("route tidak dikenal diarahkan ke /", async () => {
    renderWithProviders(<App />, { route: "/acak/sekali", preloadedState: signedIn() });
    expect(await screen.findByText("Jam tangan")).toBeInTheDocument();
  });
});
