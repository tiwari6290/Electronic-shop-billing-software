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

      // ✅ Correctly read role from backend response
      const userRole = response.user.role;
      const userBranch = response.user.branch;

      // ✅ Store in localStorage
      localStorage.setItem("token", response.token);
      localStorage.setItem("role", userRole);
      localStorage.setItem("branch", userBranch);

      // ✅ Role-based redirect
      if (userRole === "Admin") {
        navigate("/admin/dashboard");
      } else if (userRole === "Cashier") {
        navigate("/cashier/create-party");
      } else if (userRole === "Accountant") {
        navigate("/accountant/dashboard");
      }

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