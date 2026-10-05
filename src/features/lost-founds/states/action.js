import {
  fetchLostFound,
  fetchLostFounds,
  fetchStatsDaily,
  fetchStatsMonthly,
  postLostFound,
  postLostFoundCover,
  putLostFound,
  removeLostFound,
} from "../api/lostFoundApi";
import {
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
} from "../../../helpers/toolsHelper";
import {
  isLostFound,
  isLostFoundAdd,
  isLostFoundAdded,
  isLostFoundChange,
  isLostFoundChangeCover,
  isLostFoundChanged,
  isLostFoundChangedCover,
  isLostFoundDelete,
  isLostFoundDeleted,
  lostFound,
  lostFoundStats,
  lostFounds,
} from "./reducer";

export const asyncGetLostFounds = (params) => async (dispatch) => {
  dispatch(isLostFound(true));
  try {
    const { data } = await fetchLostFounds(params);
    dispatch(lostFounds(data.lost_founds));
  } catch (error) {
    showErrorDialog(error.message);
  } finally {
    dispatch(isLostFound(false));
  }
};

export const asyncGetLostFound = (id) => async (dispatch) => {
  dispatch(lostFound(null));
  try {
    const { data } = await fetchLostFound(id);
    dispatch(lostFound(data.lost_found));
    return true;
  } catch (error) {
    showErrorDialog(error.message);
    return false;
  }
};

export const asyncGetLostFoundStats = () => async (dispatch) => {
  try {
    const [daily, monthly] = await Promise.all([fetchStatsDaily(), fetchStatsMonthly()]);
    dispatch(lostFoundStats({ daily: daily.data, monthly: monthly.data }));
  } catch (error) {
    showErrorDialog(error.message);
  }
};

// Pola umum mutasi: reset flag "selesai", nyalakan flag "proses", panggil API, lalu beri umpan balik.
const runMutation = ({ busy, done, call, message }) => async (dispatch) => {
  dispatch(done(false));
  dispatch(busy(true));
  try {
    await call();
    dispatch(done(true));
    await showSuccessDialog(message);
    return true;
  } catch (error) {
    showErrorDialog(error.message);
    return false;
  } finally {
    dispatch(busy(false));
  }
};

export const asyncAddLostFound = (payload) =>
  runMutation({
    busy: isLostFoundAdd,
    done: isLostFoundAdded,
    call: () => postLostFound(payload),
    message: "Laporan baru berhasil dikirim.",
  });

export const asyncChangeLostFound = (id, payload) =>
  runMutation({
    busy: isLostFoundChange,
    done: isLostFoundChanged,
    call: () => putLostFound(id, payload),
    message: "Laporan berhasil diperbarui.",
  });

export const asyncChangeLostFoundCover = (id, file) =>
  runMutation({
    busy: isLostFoundChangeCover,
    done: isLostFoundChangedCover,
    call: () => postLostFoundCover(id, file),
    message: "Foto cover berhasil diganti.",
  });

export const asyncDeleteLostFound = (id) => async (dispatch) => {
  const agreed = await showConfirmDialog("Laporan ini akan dihapus permanen.");
  if (!agreed) return false;
  return dispatch(
    runMutation({
      busy: isLostFoundDelete,
      done: isLostFoundDeleted,
      call: () => removeLostFound(id),
      message: "Laporan berhasil dihapus.",
    }),
  );
};
