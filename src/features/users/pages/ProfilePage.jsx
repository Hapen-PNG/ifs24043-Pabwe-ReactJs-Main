import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "../../../components/Avatar";
import useInput from "../../../hooks/useInput";
import { showWarningDialog } from "../../../helpers/toolsHelper";
import {
  asyncChangeProfile,
  asyncChangeProfilePassword,
  asyncChangeProfilePhoto,
} from "../states/action";

const FIELD =
  "w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100";

const Card = ({ title, children }) => (
  <section className="rounded-[1.75rem] bg-white p-6 ring-1 ring-stone-200">
    <h3 className="mb-4 text-lg font-bold text-indigo-950">{title}</h3>
    {children}
  </section>
);

const Field = ({ id, label, error, ...props }) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-stone-700">{label}</label>
    <input id={id} className={FIELD} {...props} />
    {error && <p className="mt-1.5 text-sm font-medium text-rose-600">{error}</p>}
  </div>
);

const SubmitButton = ({ busy, children }) => (
  <button type="submit" disabled={busy} className="rounded-2xl bg-indigo-950 px-5 py-3 font-bold text-amber-300 hover:bg-indigo-900 disabled:opacity-60">
    {children}
  </button>
);

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { profile, isChangeProfile, isChangeProfilePhoto, isChangeProfilePassword } = useSelector(
    (state) => state.users,
  );

  const name = useInput(profile.name);
  const email = useInput(profile.email);
  const current = useInput("");
  const next = useInput("");
  const confirm = useInput("");
  const [photo, setPhoto] = useState(null);
  const [passwordErrors, setPasswordErrors] = useState({});

  const saveProfile = (event) => {
    event.preventDefault();
    dispatch(asyncChangeProfile({ name: name.value.trim(), email: email.value.trim() }));
  };

  const pickPhoto = (event) => {
    const chosen = event.target.files[0];
    if (chosen && !chosen.type.startsWith("image/")) {
      showWarningDialog("Berkas harus berupa gambar.");
      return;
    }
    setPhoto(chosen ?? null);
  };

  const savePhoto = async (event) => {
    event.preventDefault();
    if (await dispatch(asyncChangeProfilePhoto(photo))) setPhoto(null);
  };

  const savePassword = async (event) => {
    event.preventDefault();
    const found = {};
    if (!current.value) found.current = "Kata sandi saat ini wajib diisi";
    if (next.value.length < 6) found.next = "Kata sandi baru minimal 6 karakter";
    if (confirm.value !== next.value) found.confirm = "Konfirmasi tidak sama";
    setPasswordErrors(found);
    if (Object.keys(found).length > 0) return;

    const changed = await dispatch(
      asyncChangeProfilePassword({ password: current.value, new_password: next.value }),
    );
    if (changed) {
      current.reset();
      next.reset();
      confirm.reset();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-5 rounded-[2rem] bg-indigo-950 p-6 text-white">
        <Avatar name={profile.name} photo={profile.photo} className="size-20 text-2xl" />
        <div className="min-w-0">
          <h2 className="truncate text-2xl font-extrabold">{profile.name}</h2>
          <p className="truncate text-indigo-200">{profile.email}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Data diri">
          <form onSubmit={saveProfile} className="space-y-4">
            <Field id="profile-name" label="Nama" value={name.value} onChange={name.onChange} />
            <Field id="profile-email" label="Email" type="email" value={email.value} onChange={email.onChange} />
            <SubmitButton busy={isChangeProfile}>Simpan data diri</SubmitButton>
          </form>
        </Card>

        <Card title="Foto profil">
          <form onSubmit={savePhoto} className="space-y-4">
            <label htmlFor="profile-photo" className="block text-sm font-bold text-stone-700">Pilih foto</label>
            <input
              id="profile-photo"
              type="file"
              accept="image/*"
              onChange={pickPhoto}
              className="w-full rounded-2xl border border-dashed border-stone-300 p-3 text-sm"
            />
            <button type="submit" disabled={!photo || isChangeProfilePhoto} className="rounded-2xl bg-indigo-950 px-5 py-3 font-bold text-amber-300 hover:bg-indigo-900 disabled:opacity-50">
              Unggah foto
            </button>
          </form>
        </Card>

        <div className="lg:col-span-2">
          <Card title="Ganti kata sandi">
            <form onSubmit={savePassword} noValidate className="grid gap-4 md:grid-cols-3">
              <Field id="pw-current" label="Kata sandi saat ini" type="password" value={current.value} onChange={current.onChange} error={passwordErrors.current} />
              <Field id="pw-new" label="Kata sandi baru" type="password" value={next.value} onChange={next.onChange} error={passwordErrors.next} />
              <Field id="pw-confirm" label="Ulangi kata sandi baru" type="password" value={confirm.value} onChange={confirm.onChange} error={passwordErrors.confirm} />
              <div className="md:col-span-3">
                <SubmitButton busy={isChangeProfilePassword}>Ubah kata sandi</SubmitButton>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
