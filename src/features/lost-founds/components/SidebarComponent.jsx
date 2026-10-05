import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";
import {
  IconChartBar,
  IconLayoutDashboard,
  IconMapPinSearch,
  IconUser,
  IconUsers,
  IconX,
} from "@tabler/icons-react";

const MENU = [
  { id: "reports", to: "/", label: "Laporan", icon: IconLayoutDashboard },
  { id: "stats", to: "/?tampilan=statistik", label: "Statistik", icon: IconChartBar },
  { id: "users", to: "/users", label: "Pengguna", icon: IconUsers },
  { id: "profile", to: "/profile", label: "Profil Saya", icon: IconUser },
];

const activeMenuId = ({ pathname, search }) => {
  if (pathname === "/users") return "users";
  if (pathname === "/profile") return "profile";
  return search.includes("statistik") ? "stats" : "reports";
};

export default function SidebarComponent({ open, onClose }) {
  const activeId = activeMenuId(useLocation());

  return (
    <>
      {open && (
        <div
          data-testid="sidebar-overlay"
          className="fixed inset-0 z-30 bg-indigo-950/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        aria-label="Navigasi utama"
        className={clsx(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-indigo-950 p-6 text-indigo-100 transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-10 flex items-center justify-between">
          <Link to="/" onClick={onClose} className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-amber-300 text-indigo-950">
              <IconMapPinSearch size={22} />
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight text-white">
              Temu<span className="text-amber-300">Balik</span>
            </span>
          </Link>
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={onClose}
            className="rounded-full p-1.5 text-indigo-200 hover:bg-white/10 lg:hidden"
          >
            <IconX size={20} />
          </button>
        </div>

        <p className="mb-3 px-3 text-xs font-bold uppercase tracking-widest text-indigo-300/70">Menu</p>
        <nav className="flex flex-col gap-1">
          {MENU.map(({ id, to, label, icon: Icon }) => (
            <Link
              key={id}
              to={to}
              onClick={onClose}
              aria-current={activeId === id ? "page" : undefined}
              className={clsx(
                "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition",
                activeId === id
                  ? "bg-white/10 text-amber-300 ring-1 ring-white/10"
                  : "text-indigo-200 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon size={20} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto rounded-3xl bg-white/5 p-4 text-sm leading-relaxed text-indigo-200 ring-1 ring-white/10">
          <p className="font-bold text-amber-300">Tips cepat</p>
          <p className="mt-1">Sertakan foto dan ciri khusus barang agar pemilik lebih mudah mengenalinya.</p>
        </div>
      </aside>
    </>
  );
}
