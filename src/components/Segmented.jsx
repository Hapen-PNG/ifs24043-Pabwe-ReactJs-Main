import clsx from "clsx";

// Kontrol pilihan tunggal berbentuk pil. options: [[id, label], ...]
export default function Segmented({ label, value, options, onChange }) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex flex-wrap gap-1 rounded-2xl bg-white p-1 ring-1 ring-stone-200"
    >
      {options.map(([id, text]) => (
        <button
          key={id}
          type="button"
          aria-pressed={value === id}
          onClick={() => onChange(id)}
          className={clsx(
            "rounded-xl px-3.5 py-1.5 text-sm font-semibold transition",
            value === id ? "bg-indigo-950 text-amber-300 shadow" : "text-stone-600 hover:bg-stone-100",
          )}
        >
          {text}
        </button>
      ))}
    </div>
  );
}
