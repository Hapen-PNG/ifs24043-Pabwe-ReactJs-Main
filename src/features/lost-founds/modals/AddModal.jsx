import { useDispatch, useSelector } from "react-redux";
import ModalShell from "../../../components/ModalShell";
import ReportForm from "../components/ReportForm";
import { asyncAddLostFound } from "../states/action";

export default function AddModal({ onClose, onSaved }) {
  const dispatch = useDispatch();
  const busy = useSelector((state) => state.lostFounds.isLostFoundAdd);

  const save = async (payload) => {
    if (await dispatch(asyncAddLostFound(payload))) {
      onSaved();
      onClose();
    }
  };

  return (
    <ModalShell title="Buat laporan baru" subtitle="Ceritakan barang yang hilang atau kamu temukan." onClose={onClose}>
      <ReportForm busy={busy} submitLabel="Kirim laporan" onSubmit={save} />
    </ModalShell>
  );
}
