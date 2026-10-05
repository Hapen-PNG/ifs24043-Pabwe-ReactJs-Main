// Pembungkus fetch untuk REST API Delcom + penyimpanan token di localStorage.
const TOKEN_SLOT = "temubalik.token";

export const getAccessToken = () => localStorage.getItem(TOKEN_SLOT);
export const putAccessToken = (token) => localStorage.setItem(TOKEN_SLOT, token);
export const removeAccessToken = () => localStorage.removeItem(TOKEN_SLOT);

export const buildUrl = (path, params = {}) => {
  // Argumen kedua dibutuhkan agar base URL relatif (mis. "/api-proxy") valid.
  const url = new URL(`${DELCOM_BASEURL}${path}`, window.location.origin);
  Object.entries(params)
    .filter(([, value]) => `${value ?? ""}` !== "")
    .forEach(([key, value]) => url.searchParams.append(key, value));
  return url.toString();
};

export async function callApi(path, { method = "GET", body, form, params } = {}) {
  const headers = { Accept: "application/json" };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (form) {
    payload = form;
  } else if (body) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path, params), { method, headers, body: payload });
  const json = await response.json().catch(() => ({}));

  if (!response.ok || json.success === false) {
    throw new Error(json.message || `Permintaan gagal (${response.status})`);
  }
  return json;
}