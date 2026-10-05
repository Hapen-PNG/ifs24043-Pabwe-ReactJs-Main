import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IconArrowLeft, IconCalendar, IconCamera, IconPencil, IconTrash, IconUser } from "@tabler/icons-react";
import { formatDate, isDone, reporterName, resolveMediaUrl } from "../../../helpers/toolsHelper";
import { StatusPill } from "../components/ItemCard";
import ChangeCoverModal from "../modals/ChangeCoverModal";
import ChangeModal from "../modals/ChangeModal";
import { asyncDeleteLostFound, asyncGetLostFound } from "../states/action";

export default function DetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const item = useSelector((state) => state.lostFounds.lostFound);
  const [dialog, setDialog] = useState(null); // "edit" | "cover" | null

  const load = useCallback(async () => {
    if (!(await dispatch(asyncGetLostFound(id)))) navigate("/");
  }, [dispatch, id, navigate]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async () => {
    if (await dispatch(asyncDeleteLostFound(id))) navigate("/");
  };

  if (!item) return <p role="status" className="py-20 text-center text-stone-600">Memuat detail laporan…</p>;

  const cover = resolveMediaUrl(item.cover);

  return (
    <div className="space-y-5">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-800 hover:underline">
        <IconArrowLeft size={18} /> Kembali ke daftar
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="grid place-items-center overflow-hidden rounded-[2rem] bg-stone-200 ring-1 ring-stone-200">
          {cover ? (
            <img src={cover} alt={`Cover ${item.title}`} className="h-auto max-h-[30rem] w-full object-contain" />
          ) : (
            <p className="py-32 text-sm font-semibold text-stone-600">Belum ada foto cover</p>
          )}
        </div>

        <article className="rounded-[2rem] bg-white p-7 ring-1 ring-stone-200">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={item.status} />
            <span
              className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase ${
                isDone(item) ? "bg-indigo-950 text-amber-300" : "bg-stone-100 text-stone-600"
              }`}
            >
              {isDone(item) ? "Selesai" : "Belum selesai"}
            </span>
          </div>

          <h2 className="mt-4 text-3xl font-extrabold leading-tight text-indigo-950">{item.title}</h2>

          <dl className="mt-4 space-y-2 text-sm text-stone-600">
            <div>
              <dt className="sr-only">Pelapor</dt>
              <dd className="flex items-center gap-2 font-semibold">
                <IconUser size={16} aria-hidden="true" /> {reporterName(item)}
              </dd>
            </div>
            <div>
              <dt className="sr-only">Tanggal lapor</dt>
              <dd className="flex items-center gap-2 font-semibold">
                <IconCalendar size={16} aria-hidden="true" /> {formatDate(item.created_at)}
              </dd>
            </div>
          </dl>

          <p className="mt-5 whitespace-pre-line leading-relaxed text-stone-700">{item.description}</p>

          <div className="mt-7 flex flex-wrap gap-2">
            <button type="button" onClick={() => setDialog("cover")} className="flex items-center gap-2 rounded-xl bg-indigo-950 px-4 py-2.5 text-sm font-bold text-amber-300 hover:bg-indigo-900">
              <IconCamera size={18} /> Ganti cover
            </button>
            <button type="button" onClick={() => setDialog("edit")} className="flex items-center gap-2 rounded-xl bg-amber-100 px-4 py-2.5 text-sm font-bold text-amber-900 hover:bg-amber-200">
              <IconPencil size={18} /> Ubah data
            </button>
            <button type="button" onClick={remove} className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-100">
              <IconTrash size={18} /> Hapus
            </button>
          </div>
        </article>
      </div>

      {dialog === "edit" && <ChangeModal item={item} onClose={() => setDialog(null)} onSaved={load} />}
      {dialog === "cover" && <ChangeCoverModal item={item} onClose={() => setDialog(null)} onSaved={load} />}
    </div>
  );
}
