import { useCallback, useState } from "react";

// Two-way binding sederhana: pasang `value` + `onChange` pada elemen form.
export default function useInput(initialValue = "") {
  const [value, setValue] = useState(initialValue);
  const onChange = useCallback((event) => setValue(event.target.value), []);
  const reset = useCallback(() => setValue(initialValue), [initialValue]);
  return { value, onChange, setValue, reset };
}
