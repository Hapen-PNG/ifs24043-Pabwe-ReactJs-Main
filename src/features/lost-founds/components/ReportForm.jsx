import { useState } from "react";
import clsx from "clsx";
import { IconLoader2 } from "@tabler/icons-react";
import useInput from "../../../hooks/useInput";

const BLANK = { title: "", description: "", status: "lost", completed: false };
const KINDS = [
  ["lost", "Barang Hilang"],
  ["found", "Barang Ditemukan"],
];
const FIELD =
  "w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none transition focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100";

// Form bersama untuk tambah & ubah laporan. onSubmit menerima payload siap kirim.
export default function ReportForm({ initial = BLANK, withCompleted = false, busy, submitLabel, onSubmit }) {
  const title = useInput(initial.title);
  const description = useInput(initial.description);
  const [status, setStatus] = useState(initial.status);
  const [completed, setCompleted] = useState(initial.completed);
  const [errors, setErrors] = useState({});

  const handleSubmit = (event) => {
    event.preventDefault();
    const found = {};
    if (!title.value.trim()) found.title = "Judul wajib diisi";
    if (description.value.trim().length < 10) found.description = "Deskripsi minimal 10 karakter";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const payload = { title: title.value.trim(), description: description.value.trim(), status };
    if (withCompleted) payload.is_completed = completed ? 1 : 0;
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div role="group" aria-label="Jenis laporan" className="grid grid-cols-2 gap-2">
        {KINDS.map(([id, text]) => (
          <button
            key={id}
            type="button"
            aria-pressed={status === id}
            onClick={() => setStatus(id)}
            className={clsx(
              "rounded-2xl border-2 px-3 py-3 text-sm font-bold transition",
              status === id
                ? "border-indigo-950 bg-indigo-950 text-amber-300"
                : "border-stone-200 text-stone-600 hover:border-indigo-300",
            )}
          >
            {text}
          </button>
        ))}
      </div>

      <div>
        <label htmlFor="report-title" className="mb-1.5 block text-sm font-bold text-stone-700">
          Judul
        </label>
        <input id="report-title" className={FIELD} value={title.value} onChange={title.onChange} />
        {errors.title && <p className="mt-1.5 text-sm font-medium text-rose-600">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="report-description" className="mb-1.5 block text-sm font-bold text-stone-700">
          Deskripsi
        </label>
        <textarea
          id="report-description"
          rows={4}
          className={FIELD}
          value={description.value}
          onChange={description.onChange}
        />
        {errors.description && (
          <p className="mt-1.5 text-sm font-medium text-rose-600">{errors.description}</p>
        )}
      </div>

      {withCompleted && (
        <label
          htmlFor="report-completed"
          className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900"
        >
          <input
            id="report-completed"
            type="checkbox"
            checked={completed}
            onChange={(event) => setCompleted(event.target.checked)}
            className="size-5 accent-indigo-950"
          />
          Tandai selesai (barang sudah kembali ke pemilik)
        </label>
      )}

      <button
        type="submit"
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-950 py-3.5 font-bold text-amber-300 transition hover:bg-indigo-900 disabled:opacity-60"
      >
        {busy && <IconLoader2 size={18} className="animate-spin" />}
        {submitLabel}
      </button>
    </form>
  );
}
