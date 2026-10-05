import { callApi } from "../../../helpers/apiHelper";

const BASE = "/lost-founds";

// params: { status: "lost"|"found", is_completed: 1|0, is_me: 1 }
export const fetchLostFounds = (params) => callApi(BASE, { params });
export const fetchLostFound = (id) => callApi(`${BASE}/${id}`);
export const postLostFound = (payload) => callApi(BASE, { method: "POST", body: payload });
export const putLostFound = (id, payload) =>
  callApi(`${BASE}/${id}`, { method: "PUT", body: payload });
export const postLostFoundCover = (id, file) => {
  const form = new FormData();
  form.append("cover", file);
  return callApi(`${BASE}/${id}/cover`, { method: "POST", form });
};
export const removeLostFound = (id) => callApi(`${BASE}/${id}`, { method: "DELETE" });
export const fetchStatsDaily = () => callApi(`${BASE}/stats/daily`);
export const fetchStatsMonthly = () => callApi(`${BASE}/stats/monthly`);
