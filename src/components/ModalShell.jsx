import { useEffect } from "react";
import { IconX } from "@tabler/icons-react";

// Kerangka dialog: backdrop klik-untuk-tutup, tombol Esc, dan header judul.
export default function ModalShell({ title, subtitle, onClose, children }) {
  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        data-testid="modal-backdrop"
        className="absolute inset-0 bg-indigo-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-white p-6 shadow-2xl sm:rounded-[2rem]"
      >
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="modal-title" className="text-xl font-bold text-indigo-950">
              {title}
            </h2>
            <p className="mt-1 text-sm text-stone-600">{subtitle}</p>
          </div>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="rounded-full bg-stone-100 p-2 text-stone-600 transition hover:bg-stone-200"
          >
            <IconX size={18} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
