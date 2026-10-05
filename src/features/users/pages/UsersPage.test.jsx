import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UsersPage from "./UsersPage";
import { fetchUsers } from "../api/userApi";
import { renderWithProviders, stateWith } from "../../../test-utils";

vi.mock("../api/userApi");
vi.mock("../../../helpers/toolsHelper", async (original) => ({ ...(await original()), showErrorDialog: vi.fn() }));

const USERS = [
  { id: 1, name: "Budi Santoso", email: "budi@del.ac.id", photo: null },
  { id: 2, name: "Citra Dewi", email: "citra@del.ac.id", photo: "uploads/c.png" },
];

const setup = () =>
  renderWithProviders(<UsersPage />, { preloadedState: stateWith({ users: { profile: USERS[0] } }) });

beforeEach(() => {
  vi.clearAllMocks();
  fetchUsers.mockResolvedValue({ data: { users: USERS } });
});

describe("UsersPage", () => {
  it("memuat dan menampilkan daftar pengguna, menandai akun sendiri", async () => {
    setup();
    expect(await screen.findByText("Citra Dewi")).toBeInTheDocument();
    expect(screen.getByText("2 orang terdaftar di TemuBalik.")).toBeInTheDocument();
    expect(screen.getByText("Anda")).toBeInTheDocument();
    expect(screen.getByText(/Pilih seorang pengguna/)).toBeInTheDocument();
  });

  it("pencarian menyaring berdasarkan nama atau email", async () => {
    setup();
    await screen.findByText("Citra Dewi");
    await userEvent.type(screen.getByLabelText("Cari pengguna"), "citra@");
    expect(screen.queryByText("Budi Santoso")).not.toBeInTheDocument();
    await userEvent.clear(screen.getByLabelText("Cari pengguna"));
    await userEvent.type(screen.getByLabelText("Cari pengguna"), "zzz");
    expect(screen.getByText("Pengguna tidak ditemukan.")).toBeInTheDocument();
  });

  it("memilih pengguna menampilkan panel detail", async () => {
    const { store } = setup();
    await userEvent.click(await screen.findByRole("button", { name: /Citra Dewi/ }));
    const panel = screen.getByRole("complementary", { name: "Detail pengguna" });
    expect(panel).toHaveTextContent("citra@del.ac.id");
    expect(store.getState().users.user.id).toBe(2);
  });
});
