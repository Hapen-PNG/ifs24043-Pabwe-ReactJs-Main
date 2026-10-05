import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildUrl,
  callApi,
  getAccessToken,
  putAccessToken,
  removeAccessToken,
} from "./apiHelper";

const mockFetch = (response) => {
  const spy = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", spy);
  return spy;
};
const jsonResponse = (json, ok = true, status = 200) => ({ ok, status, json: async () => json });

afterEach(() => vi.unstubAllGlobals());

describe("token storage", () => {
  it("menyimpan, membaca, dan menghapus token", () => {
    expect(getAccessToken()).toBeNull();
    putAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});

describe("buildUrl", () => {
  it("menambahkan query dan membuang nilai kosong", () => {
    const url = buildUrl("/lost-founds", { status: "lost", is_me: 1, a: "", b: null, c: undefined });
    expect(url).toBe(`${DELCOM_BASEURL}/lost-founds?status=lost&is_me=1`);
  });

  it("bekerja tanpa params", () => {
    expect(buildUrl("/users")).toBe(`${DELCOM_BASEURL}/users`);
  });
});

describe("callApi", () => {
  it("GET tanpa token dan tanpa body", async () => {
    const spy = mockFetch(jsonResponse({ success: true, data: { ok: 1 } }));
    const json = await callApi("/users");
    expect(json.data.ok).toBe(1);
    const [, init] = spy.mock.calls[0];
    expect(init.method).toBe("GET");
    expect(init.headers.Authorization).toBeUndefined();
    expect(init.body).toBeUndefined();
  });

  it("mengirim bearer token dan body JSON", async () => {
    putAccessToken("tok");
    const spy = mockFetch(jsonResponse({ success: true }));
    await callApi("/auth/login", { method: "POST", body: { a: 1 } });
    const [, init] = spy.mock.calls[0];
    expect(init.headers.Authorization).toBe("Bearer tok");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.body).toBe(JSON.stringify({ a: 1 }));
  });

  it("mengirim FormData apa adanya tanpa Content-Type", async () => {
    const spy = mockFetch(jsonResponse({ success: true }));
    const form = new FormData();
    await callApi("/x", { method: "POST", form });
    const [, init] = spy.mock.calls[0];
    expect(init.body).toBe(form);
    expect(init.headers["Content-Type"]).toBeUndefined();
  });

  it("melempar error dengan pesan dari server", async () => {
    mockFetch(jsonResponse({ success: false, message: "Salah" }, false, 400));
    await expect(callApi("/x")).rejects.toThrow("Salah");
  });

  it("melempar error generik bila respons bukan JSON", async () => {
    mockFetch({ ok: false, status: 500, json: async () => { throw new Error("bad json"); } });
    await expect(callApi("/x")).rejects.toThrow("Permintaan gagal (500)");
  });

  it("menganggap success:false sebagai error walau HTTP 200", async () => {
    mockFetch(jsonResponse({ success: false, message: "Ditolak" }));
    await expect(callApi("/x")).rejects.toThrow("Ditolak");
  });
});
