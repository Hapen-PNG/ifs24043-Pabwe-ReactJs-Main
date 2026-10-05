import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconLoader2, IconPhoto } from "@tabler/icons-react";
import ModalShell from "../../../components/ModalShell";
import { resolveMediaUrl, showWarningDialog } from "../../../helpers/toolsHelper";
import { asyncChangeLostFoundCover } from "../states/action";

export default function ChangeCoverModal({ item, onClose, onSaved }) {
  const dispatch = useDispatch();
  const busy = useSelector((state) => state.lostFounds.isLostFoundChangeCover);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) return undefined;
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const pickFile = (event) => {
    const chosen = event.target.files[0];
    if (chosen && !chosen.type.startsWith("image/")) {
      showWarningDialog("Berkas harus berupa gambar (JPG, PNG, WEBP).");
      return;
    }
    setFile(chosen ?? null);
  };

  const save = async () => {
    if (await dispatch(asyncChangeLostFoundCover(item.id, file))) {
      onSaved();
      onClose();
    }
  };

  const shown = preview ?? resolveMediaUrl(item.cover);

  return (
    <ModalShell title="Ganti foto cover" subtitle="Pilih gambar, lihat pratinjau, lalu unggah." onClose={onClose}>
      <div className="grid h-52 place-items-center overflow-hidden rounded-3xl bg-stone-100 ring-1 ring-stone-200">
        {shown ? (
          <img src={shown} alt="Pratinjau cover" className="size-full object-contain" />
        ) : (
          <span className="flex flex-col items-center gap-2 text-sm text-stone-600">
            <IconPhoto size={36} /> Belum ada gambar
          </span>
        )}
      </div>

      <label htmlFor="cover-file" className="mb-1.5 mt-5 block text-sm font-bold text-stone-700">
        Berkas gambar
      </label>
      <input
        id="cover-file"
        type="file"
        accept="image/*"
        onChange={pickFile}
        className="w-full rounded-2xl border border-dashed border-stone-300 p-3 text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-indigo-950 file:px-4 file:py-2 file:font-bold file:text-amber-300"
      />

      <button
        type="button"
        disabled={!file || busy}
        onClick={save}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-950 py-3.5 font-bold text-amber-300 transition hover:bg-indigo-900 disabled:opacity-50"
      >
        {busy && <IconLoader2 size={18} className="animate-spin" />}
        Unggah cover
      </button>
    </ModalShell>
  );
}
