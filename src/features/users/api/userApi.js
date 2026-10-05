import { callApi } from "../../../helpers/apiHelper";

export const fetchUsers = () => callApi("/users");
export const fetchMe = () => callApi("/users/me");
export const putMe = (payload) => callApi("/users/me", { method: "PUT", body: payload });
export const postMyPhoto = (file) => {
  const form = new FormData();
  form.append("photo", file);
  return callApi("/users/me/photo", { method: "POST", form });
};
export const putMyPassword = (payload) =>
  callApi("/users/me/password", { method: "PUT", body: payload });
