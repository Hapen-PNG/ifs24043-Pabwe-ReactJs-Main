import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import StatsPanel from "./StatsPanel";
import { fetchStatsDaily, fetchStatsMonthly } from "../api/lostFoundApi";
import { renderWithProviders } from "../../../test-utils";

vi.mock("../api/lostFoundApi");
vi.mock("../../../helpers/toolsHelper", async (original) => ({
  ...(await original()),
  showErrorDialog: vi.fn(),
}));

beforeEach(() => vi.clearAllMocks());

describe("StatsPanel", () => {
  it("menampilkan status memuat sebelum data tiba", () => {
    fetchStatsDaily.mockReturnValue(new Promise(() => {}));
    fetchStatsMonthly.mockReturnValue(new Promise(() => {}));
    renderWithProviders(<StatsPanel />);
    expect(screen.getByRole("status")).toHaveTextContent("Memuat statistik");
  });

  it("menggambar batang harian dan bulanan", async () => {
    fetchStatsDaily.mockResolvedValue({ data: [{ date: "Sen", total: 4 }, { date: "Sel", total: 2 }] });
    fetchStatsMonthly.mockResolvedValue({ data: [] });
    renderWithProviders(<StatsPanel />);
    const daily = await screen.findByRole("region", { name: "Laporan harian" });
    expect(within(daily).getByText("Sen")).toBeInTheDocument();
    expect(within(daily).getByText("4")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "Laporan bulanan" })).getByText("Belum ada data.")).toBeInTheDocument();
  });
});
