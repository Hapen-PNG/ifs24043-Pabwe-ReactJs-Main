import { describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import useInput from "./useInput";

describe("useInput", () => {
  it("memakai nilai awal bawaan string kosong", () => {
    const { result } = renderHook(() => useInput());
    expect(result.current.value).toBe("");
  });

  it("memperbarui nilai lewat onChange, setValue, dan reset", () => {
    const { result } = renderHook(() => useInput("awal"));
    act(() => result.current.onChange({ target: { value: "baru" } }));
    expect(result.current.value).toBe("baru");
    act(() => result.current.setValue("manual"));
    expect(result.current.value).toBe("manual");
    act(() => result.current.reset());
    expect(result.current.value).toBe("awal");
  });
});
