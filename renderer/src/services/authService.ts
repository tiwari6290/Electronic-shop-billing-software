import axios from "axios";

export const loginApi = async (payload: {
  role: string;
  branch: string;
  username: string;
  password: string;
}) => {
  const res = await axios.post("/api/auth/login", payload);
  return res.data;
};
