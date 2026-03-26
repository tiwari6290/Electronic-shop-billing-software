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
export const forgotPasswordApi = async (username: string) => {
  const res = await api.post("/auth/forgot-password", { username });
  return res.data;
};

export const resetPasswordApi = async (payload: {
  username: string;
  otp: string;
  newPassword: string;
}) => {
  const res = await api.post("/auth/reset-password", payload);
  return res.data;
};