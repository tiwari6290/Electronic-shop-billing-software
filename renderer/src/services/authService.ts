import api from "../lib/axios";

export const loginApi = async (payload: {
  role: string;
  branch: string;
  username: string;
  password: string;
}) => {
  const res = await api.post("/auth/login", payload);
  return res.data;
};