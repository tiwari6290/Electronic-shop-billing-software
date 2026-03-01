import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000", // your backend port
  headers: {
    "Content-Type": "application/json",
  },
});

export const loginApi = async (payload: {
  role: string;
  branch: string;
  username: string;
  password: string;
}) => {
  const res = await API.post("/api/auth/login", payload);
  return res.data;
};
