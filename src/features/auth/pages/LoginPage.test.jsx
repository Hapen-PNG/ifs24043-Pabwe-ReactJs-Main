import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import LoginPage from "./LoginPage";
import { postLogin } from "../api/authApi";
import { getAccessToken } from "../../../helpers/apiHelper";
import { renderWithProviders } from "../../../test-utils";

vi.mock("../api/authApi");
vi.mock("../../../helpers/toolsHelper", () => ({ showErrorDialog: vi.fn(), showSuccessDialog: vi.fn() }));

const Dashboard = () => <p>Dashboard token: {getAccessToken()}</p>;

beforeEach(() => vi.clearAllMocks());

describe("LoginPage", () => {
  it("menampilkan error validasi dan tidak memanggil API", async () => {
    renderWithProviders(<LoginPage />);
    const email = screen.getByLabelText("Email");
    const password = screen.getByLabelText("Kata sandi");
    expect(email).toHaveAttribute("type", "email");
    expect(email).toHaveAttribute("name", "email");
    expect(password).toHaveAttribute("type", "password");
    expect(password).toHaveAttribute("name", "password");
    expect(screen.getByRole("button", { name: "Masuk" })).toHaveAttribute("type", "submit");
    await userEvent.type(email, "salah");
    await userEvent.type(password, "123");
    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));
    expect(screen.getByText("Format email tidak valid")).toBeInTheDocument();
    expect(screen.getByText("Kata sandi minimal 6 karakter")).toBeInTheDocument();
    expect(postLogin).not.toHaveBeenCalled();
  });

  it("toggle tampilkan/sembunyikan kata sandi", async () => {
    renderWithProviders(<LoginPage />);
    const input = screen.getByLabelText("Kata sandi");
    expect(input).toHaveAttribute("type", "password");
    await userEvent.click(screen.getByRole("button", { name: "Tampilkan kata sandi" }));
    expect(input).toHaveAttribute("type", "text");
    await userEvent.click(screen.getByRole("button", { name: "Sembunyikan kata sandi" }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("login berhasil menyimpan token ke store", async () => {
    postLogin.mockResolvedValue({ data: { token: "JWT" } });
    const { store } = renderWithProviders(<LoginPage />);
    await userEvent.type(screen.getByLabelText("Email"), "a@b.co");
    await userEvent.type(screen.getByLabelText("Kata sandi"), "rahasia1");
    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));
    await waitFor(() => expect(store.getState().auth.token).toBe("JWT"));
    expect(postLogin).toHaveBeenCalledWith({ email: "a@b.co", password: "rahasia1" });
  });

  it("menyimpan token sebelum navigasi replace ke /", async () => {
    postLogin.mockResolvedValue({ data: { token: "JWT" } });
    const routes = (
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
    );
    renderWithProviders(routes, { route: "/auth/login" });
    await userEvent.type(screen.getByLabelText("Email"), "a@b.co");
    await userEvent.type(screen.getByLabelText("Kata sandi"), "rahasia1");
    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));

    expect(await screen.findByText("Dashboard token: JWT")).toBeInTheDocument();
    expect(getAccessToken()).toBe("JWT");
  });

  it("login gagal tidak mengubah token", async () => {
    postLogin.mockRejectedValue(new Error("Kredensial salah"));
    const { store } = renderWithProviders(<LoginPage />);
    await userEvent.type(screen.getByLabelText("Email"), "a@b.co");
    await userEvent.type(screen.getByLabelText("Kata sandi"), "rahasia1");
    await userEvent.click(screen.getByRole("button", { name: "Masuk" }));
    await waitFor(() => expect(postLogin).toHaveBeenCalled());
    expect(store.getState().auth.token).toBeNull();
  });
});
