import { useState } from "react";
import { validateLoginForm } from "../utils/validators";

export type UserRole = "Admin" | "Cashier" | "Accountant";

export const useLogin = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>("Cashier");
  const [selectedStore, setSelectedStore] = useState("Main Store");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    // ✅ Form validation
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

    setLoading(true);

    // ✅ FRONTEND-ONLY DUMMY LOGIN (Cashier)
    setTimeout(() => {
      if (email === "admin@test.com" && password === "123456") {
        localStorage.setItem("token", "dummy-token");
        localStorage.setItem("role", "Cashier");
        localStorage.setItem("branch", selectedStore);

        // 🔥 Redirect to EXISTING route
        window.location.href = "/create-party";
      } else {
        setError("Invalid credentials");
      }

      setLoading(false);
    }, 800); // fake API delay
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
