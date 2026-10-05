import { fetchMe, fetchUsers, postMyPhoto, putMe, putMyPassword } from "../api/userApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
import {
  isChangeProfile,
  isChangeProfilePassword,
  isChangeProfilePhoto,
  isProfile,
  profile,
  users,
} from "./reducer";

export const asyncGetUsers = () => async (dispatch) => {
  try {
    const { data } = await fetchUsers();
    dispatch(users(data.users));
  } catch (error) {
    showErrorDialog(error.message);
  }
};

export const asyncGetProfile = () => async (dispatch) => {
  dispatch(isProfile(true));
  try {
    const { data } = await fetchMe();
    dispatch(profile(data.user));
    return true;
  } catch {
    return false;
  } finally {
    dispatch(isProfile(false));
  }
};

// Pola umum mutasi profil: nyalakan flag, panggil API, segarkan profil, tampilkan dialog.
const mutateProfile = (flag, call, successMessage) => async (dispatch) => {
  dispatch(flag(true));
  try {
    await call();
    await dispatch(asyncGetProfile());
    showSuccessDialog(successMessage);
    return true;
  } catch (error) {
    showErrorDialog(error.message);
    return false;
  } finally {
    dispatch(flag(false));
  }
};

export const asyncChangeProfile = (payload) =>
  mutateProfile(isChangeProfile, () => putMe(payload), "Profil berhasil diperbarui.");

export const asyncChangeProfilePhoto = (file) =>
  mutateProfile(isChangeProfilePhoto, () => postMyPhoto(file), "Foto profil berhasil diganti.");

export const asyncChangeProfilePassword = (payload) =>
  mutateProfile(isChangeProfilePassword, () => putMyPassword(payload), "Kata sandi berhasil diubah.");
