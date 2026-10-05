import { callApi } from "../../../helpers/apiHelper";

export const postRegister = (payload) => callApi("/auth/register", { method: "POST", body: payload });
export const postLogin = (payload) => callApi("/auth/login", { method: "POST", body: payload });
