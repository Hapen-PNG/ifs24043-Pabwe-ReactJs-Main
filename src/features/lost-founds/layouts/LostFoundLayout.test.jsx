import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import LostFoundLayout from "./LostFoundLayout";
import { fetchMe } from "../../users/api/userApi";
import { getAccessToken, putAccessToken } from "../../../helpers/apiHelper";
import { renderWithProviders, stateWith } from "../../../test-utils";

vi.mock("../../users/api/userApi");

const tree = (
  <Routes>
    <Route path="/" element={<LostFoundLayout />}>
      <Route index element={<p>Konten dashboard</p>} />
    </Route>
    <Route path="/auth/login" element={<p>Halaman login</p>} />
  </Routes>
);

const me = { id: 1, name: "Budi", email: "b@x.id", photo: null };
beforeEach(() => vi.clearAllMocks());

describe("LostFoundLayout (route guard)", () => {
  it("tanpa token langsung diarahkan ke login", () => {
    renderWithProviders(tree);
    expect(screen.getByText("Halaman login")).toBeInTheDocument();
    expect(fetchMe).not.toHaveBeenCalled();
  });

  it("dengan token memuat profil lalu merender navbar, sidebar, dan konten", async () => {
    fetchMe.mockResolvedValue({ data: { user: me } });
    renderWithProviders(tree, { preloadedState: stateWith({ auth: { token: "t" } }) });
    expect(screen.getByRole("status")).toHaveTextContent("Memuat sesi");
    expect(await screen.findByText("Konten dashboard")).toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "Navigasi utama" })).toBeInTheDocument();
    expect(screen.getByText("Sesi aktif")).toBeInTheDocument();
  });

  it("memulihkan token tersimpan saat startup dan menunggu validasi me sebelum merender route", async () => {
    let resolveMe;
    putAccessToken("tersimpan");
    fetchMe.mockReturnValue(new Promise((resolve) => {
      resolveMe = resolve;
    }));

    const { store } = renderWithProviders(tree);
    expect(store.getState().auth.token).toBe("tersimpan");
    expect(fetchMe).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status")).toHaveTextContent("Memuat sesi");
    expect(screen.queryByText("Halaman login")).not.toBeInTheDocument();

    await act(async () => {
      resolveMe({ data: { user: me } });
    });

    expect(await screen.findByText("Konten dashboard")).toBeInTheDocument();
    expect(getAccessToken()).toBe("tersimpan");
  });

  it("token tidak valid membersihkan sesi dan kembali ke login", async () => {
    fetchMe.mockRejectedValue(new Error("401"));
    const { store } = renderWithProviders(tree, { preloadedState: stateWith({ auth: { token: "basi" } }) });
    expect(await screen.findByText("Halaman login")).toBeInTheDocument();
    expect(store.getState().auth.token).toBeNull();
  });

  it("drawer mobile dibuka dari navbar dan ditutup lewat overlay", async () => {
    fetchMe.mockResolvedValue({ data: { user: me } });
    renderWithProviders(tree, { preloadedState: stateWith({ auth: { token: "t" } }) });
    await screen.findByText("Konten dashboard");
    await userEvent.click(screen.getByRole("button", { name: "Buka menu" }));
    await userEvent.click(screen.getByTestId("sidebar-overlay"));
    await waitFor(() => expect(screen.queryByTestId("sidebar-overlay")).not.toBeInTheDocument());
  });
});
