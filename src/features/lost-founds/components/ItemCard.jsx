import clsx from "clsx";
import { Link } from "react-router-dom";
import { IconCalendar, IconCircleCheck, IconPackage, IconRotate2, IconTrash } from "@tabler/icons-react";
import { formatDate, isDone, resolveMediaUrl } from "../../../helpers/toolsHelper";

export const StatusPill = ({ status }) => (
  <span
    className={clsx(
      "rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide",
      status === "lost" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700",
    )}
  >
    {status === "lost" ? "Hilang" : "Ditemukan"}
  </span>
);

export default function ItemCard({ item, onToggleDone, onDelete }) {
  const cover = resolveMediaUrl(item.cover);
  const done = isDone(item);

  return (
    <article className="group flex flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-40 bg-gradient-to-br from-indigo-100 to-amber-100">
        {cover ? (
          <img src={cover} alt={`Cover ${item.title}`} className="size-full object-cover" />
        ) : (
          <span className="grid size-full place-items-center text-indigo-300">
            <IconPackage size={44} />
          </span>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          <StatusPill status={item.status} />
          {done && (
            <span className="flex items-center gap-1 rounded-full bg-indigo-950 px-3 py-1 text-xs font-extrabold text-amber-300">
              <IconCircleCheck size={14} /> Selesai
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-1 text-lg font-bold text-indigo-950">{item.title}</h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm leading-relaxed text-stone-600">{item.description}</p>
        <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-stone-600">
          <IconCalendar size={14} /> {formatDate(item.created_at)}
        </p>

        <div className="mt-4 flex items-center gap-2">
          <Link
            to={`/lost-founds/${item.id}`}
            className="flex-1 rounded-xl bg-indigo-950 py-2 text-center text-sm font-bold text-amber-300 hover:bg-indigo-900"
          >
            Lihat detail
          </Link>
          <button
            type="button"
            aria-label={done ? `Buka kembali ${item.title}` : `Tandai selesai ${item.title}`}
            onClick={() => onToggleDone(item)}
            className="rounded-xl bg-amber-100 p-2 text-amber-800 hover:bg-amber-200"
          >
            {done ? <IconRotate2 size={18} /> : <IconCircleCheck size={18} />}
          </button>
          <button
            type="button"
            aria-label={`Hapus ${item.title}`}
            onClick={() => onDelete(item)}
            className="rounded-xl bg-rose-50 p-2 text-rose-700 hover:bg-rose-100"
          >
            <IconTrash size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}
