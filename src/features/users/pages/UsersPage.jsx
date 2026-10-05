import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconSearch } from "@tabler/icons-react";
import Avatar from "../../../components/Avatar";
import useInput from "../../../hooks/useInput";
import { asyncGetUsers } from "../states/action";
import { user as selectUser } from "../states/reducer";

export default function UsersPage() {
  const dispatch = useDispatch();
  const { users, user: selected, profile } = useSelector((state) => state.users);
  const keyword = useInput("");

  useEffect(() => {
    dispatch(asyncGetUsers());
  }, [dispatch]);

  const needle = keyword.value.trim().toLowerCase();
  const matches = users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(needle));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-indigo-950">Komunitas pengguna</h2>
        <p className="mt-1 text-stone-600">{users.length} orang terdaftar di TemuBalik.</p>
      </div>

      <div className="relative max-w-md">
        <IconSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-600" />
        <input
          type="search"
          aria-label="Cari pengguna"
          placeholder="Cari nama atau email…"
          value={keyword.value}
          onChange={keyword.onChange}
          className="w-full rounded-2xl bg-white py-3 pl-11 pr-4 outline-none ring-1 ring-stone-200 focus:ring-2 focus:ring-indigo-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        {matches.length === 0 ? (
          <p className="rounded-[1.75rem] border-2 border-dashed border-stone-300 py-12 text-center font-semibold text-stone-600">
            Pengguna tidak ditemukan.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {matches.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => dispatch(selectUser(u))}
                  aria-pressed={selected?.id === u.id}
                  className="flex w-full items-center gap-3 rounded-3xl bg-white p-4 text-left ring-1 ring-stone-200 transition hover:ring-indigo-400 aria-pressed:ring-2 aria-pressed:ring-indigo-950"
                >
                  <Avatar name={u.name} photo={u.photo} className="size-12" />
                  <span className="min-w-0">
                    <span className="block truncate font-bold text-indigo-950">
                      {u.name}
                      {u.id === profile?.id && (
                        <span className="ml-2 rounded-full bg-amber-200 px-2 py-0.5 text-xs">Anda</span>
                      )}
                    </span>
                    <span className="block truncate text-sm text-stone-600">{u.email}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <aside aria-label="Detail pengguna" className="h-fit rounded-[1.75rem] bg-indigo-950 p-6 text-center text-white">
          {selected ? (
            <>
              <Avatar name={selected.name} photo={selected.photo} className="mx-auto size-20 text-2xl" />
              <h3 className="mt-4 text-xl font-bold">{selected.name}</h3>
              <p className="text-sm text-indigo-200">{selected.email}</p>
            </>
          ) : (
            <p className="text-sm text-indigo-200">Pilih seorang pengguna untuk melihat detailnya.</p>
          )}
        </aside>
      </div>
    </div>
  );
}
