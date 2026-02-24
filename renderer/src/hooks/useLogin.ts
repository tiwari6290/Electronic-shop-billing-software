import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateLoginForm } from "../utils/validators";
import { loginApi } from "../services/authService";

export type UserRole = "Admin" | "Cashier" | "Accountant";

export const useLogin = () => {
  const navigate = useNavigate();

  const [selectedRole, setSelectedRole] = useState<UserRole>("Cashier");
  const [selectedStore, setSelectedStore] = useState("01");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    const errorMsg = validateLoginForm({
      role: selectedRole,
      branch: selectedStore,
      username: email,
      password,
    });

    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    try {
      setLoading(true);

      const response = await loginApi({
        role: selectedRole,
        branch: selectedStore,
        username: email,
        password,
      });

      localStorage.setItem("token", response.token);
      localStorage.setItem("role", response.role);
      localStorage.setItem("branch", selectedStore);

      // ✅ Role-based navigation
      if (response.role === "Admin") {
        navigate("/admin/dashboard");
      } else if (response.role === "Cashier") {
        navigate("/cashier/dashboard");
      } else if (response.role === "Accountant") {
        navigate("/accountant/dashboard");
      } else {
        navigate("/");
      }

    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return {
    selectedRole,
    setSelectedRole,
    selectedStore,
    setSelectedStore,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    handleLogin,
  };
};