import { useState } from "react";
import { validateLoginForm } from "../utils/validators";
import { loginApi } from "../services/authService";

export type UserRole = "Admin" | "Cashier" | "Accountant";

export const useLogin = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>("Admin");
  const [selectedStore, setSelectedStore] = useState("01");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    // ✅ Keep your existing validation
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

      // ✅ REAL BACKEND CALL
      const response = await loginApi({
        role: selectedRole,
        branch: selectedStore,
        username: email,
        password,
      });

      // ✅ Store backend response
      localStorage.setItem("token", response.token);
      localStorage.setItem("role", response.role);
      localStorage.setItem("branch", selectedStore);

      // ✅ Redirect (same as before)
      window.location.href = "/create-party";

    } catch (err: any) {
      setError(
        err.response?.data?.message || "Invalid credentials"
      );
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
