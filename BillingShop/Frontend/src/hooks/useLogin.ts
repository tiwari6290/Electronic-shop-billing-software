import { useState } from "react";
import { loginApi } from "../services/authService";
import { validateLoginForm } from "../utils/validators";

export type UserRole = "Admin" | "Cashier" | "Accountant";

export const useLogin = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>("Admin");
  const [selectedStore, setSelectedStore] = useState("Main Store");
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

      const data = await loginApi({
        role: selectedRole,
        branch: selectedStore,
        username: email,
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", selectedRole);
      localStorage.setItem("branch", selectedStore);

      if (selectedRole === "Admin") window.location.href = "/admin/dashboard";
      if (selectedRole === "Cashier") window.location.href = "/cashier/dashboard";
      if (selectedRole === "Accountant")
        window.location.href = "/accountant/dashboard";
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
