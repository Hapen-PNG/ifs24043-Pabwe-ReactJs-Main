import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { IconInbox, IconLoader2, IconPlus, IconSearch } from "@tabler/icons-react";
import Segmented from "../../../components/Segmented";
import useInput from "../../../hooks/useInput";
import { isDone } from "../../../helpers/toolsHelper";
import ItemCard from "../components/ItemCard";
import StatsPanel from "../components/StatsPanel";
import AddModal from "../modals/AddModal";
import { asyncChangeLostFound, asyncDeleteLostFound, asyncGetLostFounds } from "../states/action";

const STATUS_OPTIONS = [["all", "Semua"], ["lost", "Hilang"], ["found", "Ditemukan"]];
const PROGRESS_OPTIONS = [["all", "Semua"], ["open", "Berjalan"], ["done", "Selesai"]];
const SCOPE_OPTIONS = [["all", "Semua laporan"], ["mine", "Laporan saya"]];

function StatTile({ label, value, tone }) {
  return (
    <div className={`rounded-[1.75rem] p-5 ${tone}`}>
      <p className="text-sm font-bold">{label}</p>
      <p className="mt-1 font-display text-4xl font-extrabold">{value}</p>
    </div>
  );
}

export default function HomePage() {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const showingStats = searchParams.get("tampilan") === "statistik";
  const { lostFounds, isLostFound } = useSelector((state) => state.lostFounds);

  const [scope, setScope] = useState("all");
  const [status, setStatus] = useState("all");
  const [progress, setProgress] = useState("all");
  const [adding, setAdding] = useState(false);
  const keyword = useInput("");

  const reload = useCallback(
    () => dispatch(asyncGetLostFounds({ is_me: scope === "mine" ? 1 : undefined })),
    [dispatch, scope],
  );

  useEffect(() => {
    reload();
  }, [reload]);

  const needle = keyword.value.trim().toLowerCase();
  const visible = lostFounds.filter(
    (item) =>
      (status === "all" || item.status === status) &&
      (progress === "all" || isDone(item) === (progress === "done")) &&
      `${item.title} ${item.description}`.toLowerCase().includes(needle),
  );

  const toggleDone = async (item) => {
    const changed = await dispatch(
      asyncChangeLostFound(item.id, {
        title: item.title,
        description: item.description,
        status: item.status,
        is_completed: isDone(item) ? 0 : 1,
      }),
    );
    if (changed) reload();
  };

  const remove = async (item) => {
    if (await dispatch(asyncDeleteLostFound(item.id))) reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-indigo-950">
            {showingStats ? "Statistik laporan" : "Daftar laporan"}
          </h2>
          <p className="mt-1 text-stone-600">Pantau barang hilang dan temuan di sekitar kampus.</p>
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 rounded-2xl bg-amber-300 px-5 py-3 font-extrabold text-indigo-950 shadow-lg shadow-amber-300/40 transition hover:bg-amber-400"
        >
          <IconPlus size={20} /> Buat laporan
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Total laporan" value={lostFounds.length} tone="bg-indigo-950 text-white" />
        <StatTile label="Barang hilang" value={lostFounds.filter((i) => i.status === "lost").length} tone="bg-rose-100 text-rose-800" />
        <StatTile label="Barang ditemukan" value={lostFounds.filter((i) => i.status === "found").length} tone="bg-emerald-100 text-emerald-800" />
        <StatTile label="Sudah selesai" value={lostFounds.filter(isDone).length} tone="bg-amber-100 text-amber-900" />
      </div>

      {showingStats ? (
        <StatsPanel />
      ) : (
        <>
          <div className="space-y-3 rounded-[1.75rem] bg-stone-200/60 p-4">
            <div className="relative">
              <IconSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" />
              <input
                type="search"
                aria-label="Cari laporan"
                placeholder="Cari judul atau deskripsi…"
                value={keyword.value}
                onChange={keyword.onChange}
                className="w-full rounded-2xl border-0 bg-white py-3 pl-11 pr-4 outline-none ring-1 ring-stone-200 focus:ring-2 focus:ring-indigo-600"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Segmented label="Cakupan" value={scope} options={SCOPE_OPTIONS} onChange={setScope} />
              <Segmented label="Jenis" value={status} options={STATUS_OPTIONS} onChange={setStatus} />
              <Segmented label="Progres" value={progress} options={PROGRESS_OPTIONS} onChange={setProgress} />
            </div>
          </div>

          {isLostFound && (
            <p role="status" className="flex items-center justify-center gap-2 py-10 text-stone-600">
              <IconLoader2 className="animate-spin" /> Memuat laporan…
            </p>
          )}

          {!isLostFound && visible.length === 0 && (
            <div className="grid place-items-center gap-2 rounded-[1.75rem] border-2 border-dashed border-stone-300 py-16 text-stone-600">
              <IconInbox size={40} />
              <p className="font-semibold">Tidak ada laporan yang cocok.</p>
            </div>
          )}

          {!isLostFound && visible.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((item) => (
                <ItemCard key={item.id} item={item} onToggleDone={toggleDone} onDelete={remove} />
              ))}
            </div>
          )}
        </>
      )}

      {adding && <AddModal onClose={() => setAdding(false)} onSaved={reload} />}
    </div>
  );
}
