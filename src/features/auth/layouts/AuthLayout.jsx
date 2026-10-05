import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { IconBackpack, IconCircleCheck, IconMapPinSearch } from "@tabler/icons-react";

const SAMPLE_TICKETS = [
  { label: "Hilang", text: "Dompet kulit cokelat di Gedung 9", tone: "bg-rose-400/20 text-rose-200" },
  { label: "Ditemukan", text: "Kunci motor di kantin", tone: "bg-emerald-400/20 text-emerald-200" },
  { label: "Selesai", text: "Botol minum kembali ke pemilik", tone: "bg-amber-300/20 text-amber-200" },
];

export default function AuthLayout() {
  const token = useSelector((state) => state.auth.token);
  if (token) return <Navigate to="/" replace />;

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-indigo-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 size-80 rounded-full bg-amber-300/20 blur-2xl" />
        <div className="absolute -bottom-32 -left-16 size-96 rounded-full bg-indigo-500/30 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-amber-300 text-indigo-950">
            <IconMapPinSearch size={24} />
          </span>
          <span className="font-display text-2xl font-extrabold">
            Temu<span className="text-amber-300">Balik</span>
          </span>
        </div>

        <div className="relative">
          <IconBackpack size={44} className="mb-5 text-amber-300" />
          <h2 className="font-display text-4xl font-extrabold leading-tight">
            Barang hilang? <br />
            <span className="text-amber-300">Biar kampus yang bantu cari.</span>
          </h2>
          <ul className="mt-8 space-y-3">
            {SAMPLE_TICKETS.map((ticket) => (
              <li
                key={ticket.label}
                className="flex items-center gap-3 rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10"
              >
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${ticket.tone}`}>
                  {ticket.label}
                </span>
                <span className="text-sm text-indigo-100">{ticket.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative flex items-center gap-2 text-sm text-indigo-200">
          <IconCircleCheck size={18} className="text-amber-300" /> Dibuat untuk praktikum PABWE 2026
        </p>
      </aside>

      <main className="flex items-center justify-center bg-stone-100 px-5 py-10">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
