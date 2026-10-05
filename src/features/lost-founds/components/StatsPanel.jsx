import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toSeries } from "../../../helpers/toolsHelper";
import { asyncGetLostFoundStats } from "../states/action";

function BarList({ title, rows }) {
  const peak = Math.max(1, ...rows.map((row) => row.value));
  return (
    <section aria-label={title} className="rounded-[1.75rem] bg-white p-6 ring-1 ring-stone-200">
      <h3 className="mb-4 text-lg font-bold text-indigo-950">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-stone-600">Belum ada data.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.label} className="grid grid-cols-[5.5rem_1fr_2rem] items-center gap-3 text-sm">
              <span className="truncate font-semibold text-stone-600">{row.label}</span>
              <span className="h-3 overflow-hidden rounded-full bg-stone-100">
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-indigo-700 to-amber-400"
                  style={{ width: `${(row.value / peak) * 100}%` }}
                />
              </span>
              <span className="text-right font-bold text-indigo-950">{row.value}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function StatsPanel() {
  const dispatch = useDispatch();
  const stats = useSelector((state) => state.lostFounds.lostFoundStats);

  useEffect(() => {
    dispatch(asyncGetLostFoundStats());
  }, [dispatch]);

  if (!stats) return <p role="status" className="py-10 text-center text-stone-600">Memuat statistik…</p>;

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <BarList title="Laporan harian" rows={toSeries(stats.daily)} />
      <BarList title="Laporan bulanan" rows={toSeries(stats.monthly)} />
    </div>
  );
}
