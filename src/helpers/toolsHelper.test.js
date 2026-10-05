import { beforeEach, describe, expect, it, vi } from "vitest";
import Swal from "sweetalert2";
import {
  formatDate,
  initialsOf,
  isDone,
  reporterName,
  resolveMediaUrl,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  showWarningDialog,
  toSeries,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

beforeEach(() => vi.clearAllMocks());

describe("dialog SweetAlert2", () => {
  it("success / error / warning memanggil Swal dengan ikon yang tepat", async () => {
    await showSuccessDialog("ok");
    await showErrorDialog("gagal");
    await showWarningDialog("awas");
    expect(Swal.fire.mock.calls.map(([o]) => o.icon)).toEqual(["success", "error", "warning"]);
    expect(Swal.fire.mock.calls[0][0].text).toBe("ok");
  });

  it("showConfirmDialog mengembalikan isConfirmed", async () => {
    Swal.fire.mockResolvedValueOnce({ isConfirmed: true });
    expect(await showConfirmDialog("hapus?")).toBe(true);
    Swal.fire.mockResolvedValueOnce({ isConfirmed: false });
    expect(await showConfirmDialog("hapus?")).toBe(false);
  });
});

describe("formatDate", () => {
  it("memformat tanggal ISO ke bahasa Indonesia", () => {
    expect(formatDate("2026-03-05T10:00:00Z")).toMatch(/2026/);
  });
  it("mengembalikan strip untuk kosong / tidak valid", () => {
    expect(formatDate(null)).toBe("-");
    expect(formatDate("bukan-tanggal")).toBe("-");
  });
});

describe("resolveMediaUrl", () => {
  it("menangani null, URL absolut, dan path relatif", () => {
    expect(resolveMediaUrl(null)).toBeNull();
    expect(resolveMediaUrl("https://x.test/a.png")).toBe("https://x.test/a.png");
    expect(resolveMediaUrl("/uploads/a.png")).toBe("https://open-api.delcom.org/uploads/a.png");
    expect(resolveMediaUrl("uploads/a.png")).toBe("https://open-api.delcom.org/uploads/a.png");
  });
});

describe("isDone", () => {
  it("membaca is_completed berupa angka/boolean/kosong", () => {
    expect(isDone({ is_completed: 1 })).toBe(true);
    expect(isDone({ is_completed: "0" })).toBe(false);
    expect(isDone({ is_completed: true })).toBe(true);
    expect(isDone(undefined)).toBe(false);
  });
});

describe("reporterName", () => {
  it("memilih sumber nama sesuai prioritas", () => {
    expect(reporterName({ author: { name: "A" } })).toBe("A");
    expect(reporterName({ user: { name: "U" } })).toBe("U");
    expect(reporterName({ user_id: 2 }, [{ id: 2, name: "Dari daftar" }])).toBe("Dari daftar");
    expect(reporterName({ user_id: 9 })).toBe("Pelapor anonim");
  });
});

describe("initialsOf", () => {
  it("mengambil maksimal dua inisial", () => {
    expect(initialsOf("budi santoso wijaya")).toBe("BS");
    expect(initialsOf("")).toBe("?");
    expect(initialsOf(undefined)).toBe("?");
  });
});

describe("toSeries", () => {
  it("menormalkan array, objek, dan bentuk {stats}", () => {
    expect(toSeries([{ date: "01", total: 3 }, { month: "Mar", count: 2 }, { value: 4 }, {}])).toEqual([
      { label: "01", value: 3 },
      { label: "Mar", value: 2 },
      { label: "3", value: 4 },
      { label: "4", value: 0 },
    ]);
    expect(toSeries({ stats: { Senin: 5 } })).toEqual([{ label: "Senin", value: 5 }]);
    expect(toSeries({ label: "x" }).length).toBe(1);
    expect(toSeries(null)).toEqual([]);
  });
});
