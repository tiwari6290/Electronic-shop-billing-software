import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateLoginForm } from "../utils/validators";

export type UserRole = "Admin" | "Cashier" | "Accountant";

export const useLogin = () => {
  const navigate = useNavigate();
  
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

    // ✅ FRONTEND-ONLY DUMMY LOGIN
    setTimeout(() => {
      if (email === "admin@test.com" && password === "123456") {
        localStorage.setItem("token", "dummy-token");
        localStorage.setItem("role", selectedRole);
        localStorage.setItem("branch", selectedStore);

        // 🔥 Role-based navigation
        if (selectedRole === "Admin") {
          navigate("/admin/dashboard");
        } else if (selectedRole === "Cashier") {
          navigate("/cashier/create-party");
        } else {
          // Accountant - coming soon
          setError("Accountant login coming soon!");
          setLoading(false);
          return;
        }
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


