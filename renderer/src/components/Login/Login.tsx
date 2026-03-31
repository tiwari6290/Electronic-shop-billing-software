import React, { useState } from 'react';
import { Shield, FileText, Calculator, Eye, EyeOff, Zap, X, Mail, KeyRound, Lock } from 'lucide-react';
import { useLogin } from "../../hooks/useLogin";
import { forgotPasswordApi, resetPasswordApi } from "../../services/authService";


// ================= FORGOT PASSWORD MODAL =================
type ForgotStep = "email" | "otp";

const ForgotPasswordModal: React.FC<{ email: string; onClose: () => void }> = ({ email, onClose }) => {
  const [step, setStep] = useState<ForgotStep>("email");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendOtp = async () => {
    setError("");
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email in the login form first.");
      return;
    }
    try {
      setLoading(true);
      await forgotPasswordApi(email);
      setStep("otp");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    if (!otp || otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    try {
      setLoading(true);
      await resetPasswordApi({ username: email, otp, newPassword });
      setSuccess("Password reset successful! You can now log in.");
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative bg-white w-full max-w-[440px] rounded-[16px] overflow-hidden"
      style={{ boxShadow: "0 4px 32px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)" }}
    >
      {/* Top accent bar */}
      <div className="h-[4px] w-full bg-gradient-to-r from-[#4169e1] to-[#7c3aed]" />

      <div className="p-[36px]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-[20px] right-[20px] w-[34px] h-[34px] flex items-center justify-center rounded-full bg-[#f1f3f5] hover:bg-[#e9ecef] transition-colors text-[#6c757d] hover:text-[#212529]"
        >
          <X className="w-[15px] h-[15px]" strokeWidth={2.5} />
        </button>

        {/* Icon + Title */}
        <div className="flex flex-col items-center mb-[28px]">
          <div
            className="w-[60px] h-[60px] rounded-full flex items-center justify-center mb-[16px]"
            style={{ background: "linear-gradient(135deg, #eef2ff 0%, #ede9fe 100%)" }}
          >
            {step === "email" ? (
              <Mail className="w-[26px] h-[26px] text-[#4169e1]" strokeWidth={2} />
            ) : (
              <KeyRound className="w-[26px] h-[26px] text-[#7c3aed]" strokeWidth={2} />
            )}
          </div>
          <h2 className="text-[20px] font-bold text-[#212529] mb-[6px]">
            {step === "email" ? "Forgot Password?" : "Reset Password"}
          </h2>
          <p className="text-[#6c757d] text-[13.5px] text-center leading-relaxed max-w-[300px]">
            {step === "email"
              ? "We'll send a 6-digit OTP to your registered email"
              : `Enter the OTP sent to ${email}`}
          </p>
        </div>

        {/* Divider */}
        <div className="h-[1px] bg-[#f1f3f5] mb-[24px]" />

        {/* Error */}
        {error && (
          <div className="flex items-center gap-[8px] bg-red-50 border border-red-100 rounded-[8px] px-[14px] py-[10px] mb-[18px]">
            <div className="w-[6px] h-[6px] rounded-full bg-red-500 flex-shrink-0" />
            <p className="text-red-600 text-[13px] font-medium">{error}</p>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="flex items-center gap-[8px] bg-green-50 border border-green-100 rounded-[8px] px-[14px] py-[10px] mb-[18px]">
            <div className="w-[6px] h-[6px] rounded-full bg-green-500 flex-shrink-0" />
            <p className="text-green-700 text-[13px] font-semibold">{success}</p>
          </div>
        )}

        {step === "email" ? (
          <>
            <div className="mb-[22px]">
              <label className="block text-[#495057] font-semibold mb-[10px] text-[13.5px] uppercase tracking-[0.5px]">
                Email Address
              </label>
              <input
                type="text"
                value={email}
                readOnly
                className="w-full h-[50px] px-[16px] bg-[#f8f9fa] border-2 border-[#e9ecef] rounded-[10px] text-[#495057] text-[14.5px] cursor-not-allowed"
              />
            </div>

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading}
              className={`w-full h-[52px] text-white font-semibold rounded-[10px] transition-all duration-200 text-[15px] flex items-center justify-center gap-[8px] ${loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"}`}
              style={{ background: "linear-gradient(135deg, #4169e1 0%, #7c3aed 100%)", boxShadow: "0 4px 14px rgba(65,105,225,0.35)" }}
            >
              {loading ? "Sending OTP..." : "Send OTP →"}
            </button>
          </>
        ) : (
          <>
            <div className="mb-[18px]">
              <label className="block text-[#495057] font-semibold mb-[10px] text-[13.5px] uppercase tracking-[0.5px]">
                OTP Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="• • • • • •"
                maxLength={6}
                className="w-full h-[52px] px-[16px] bg-white border-2 border-[#dee2e6] rounded-[10px] text-[#212529] text-[22px] tracking-[10px] font-bold text-center placeholder-[#ced4da] placeholder:tracking-[6px] placeholder:text-[18px] focus:outline-none focus:border-[#4169e1] transition-all"
              />
            </div>

            <div className="mb-[24px]">
              <label className="block text-[#495057] font-semibold mb-[10px] text-[13.5px] uppercase tracking-[0.5px]">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full h-[50px] px-[16px] pr-[48px] bg-white border-2 border-[#dee2e6] rounded-[10px] text-[#212529] text-[14px] placeholder-[#adb5bd] focus:outline-none focus:border-[#4169e1] transition-all"
                  style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute top-1/2 right-[14px] -translate-y-1/2 text-[#adb5bd] hover:text-[#6c757d] transition-colors focus:outline-none"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-[18px] h-[18px]" strokeWidth={2} />
                  ) : (
                    <Eye className="w-[18px] h-[18px]" strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetPassword}
              disabled={loading}
              className={`w-full h-[52px] text-white font-semibold rounded-[10px] transition-all duration-200 text-[15px] flex items-center justify-center gap-[8px] ${loading ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"}`}
              style={{ background: "linear-gradient(135deg, #4169e1 0%, #7c3aed 100%)", boxShadow: "0 4px 14px rgba(65,105,225,0.35)" }}
            >
              <Lock className="w-[15px] h-[15px]" strokeWidth={2.5} />
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            <p className="text-center text-[13px] text-[#6c757d] mt-[18px]">
              Didn't receive OTP?{" "}
              <button
                type="button"
                onClick={() => { setStep("email"); setOtp(""); setError(""); }}
                className="text-[#4169e1] font-semibold hover:text-[#2347d1] transition-colors"
              >
                Resend
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};


// ================= MAIN LOGIN COMPONENT =================
const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const {
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
  } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  // ✅ Forgot Password open — full clean white screen, login page completely unmounted
  if (showForgotModal) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <ForgotPasswordModal
          email={email}
          onClose={() => setShowForgotModal(false)}
        />
      </div>
    );
  }

  // ✅ Normal login page
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[750px]">
        {/* Header */}
        <div className="text-center mb-[52px]">
          <h1 className="text-[44px] font-bold text-[#212529] mb-[10px] leading-tight tracking-[-0.5px]">
            Mondal Electronics Concern
          </h1>
          <p className="text-[#6c757d] text-[16.5px] font-normal leading-relaxed">
            Sign in to access your dashboard
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-[28px]">
          {/* Login As Section */}
          <div>
            <label className="block text-[#212529] font-semibold mb-[18px] text-[15px]">
              Login As
            </label>

            {/* ✅ FIXED GRID */}
            <div className="grid grid-cols-1 gap-[18px] justify-items-center">

              {/* Admin Card */}
              {/*
              <button
                type="button"
                onClick={() => setSelectedRole('Admin')}
                className={`w-full py-[26px] rounded-[18px] border-2 ${
                  selectedRole === 'Admin'
                    ? 'border-[#7c3aed] bg-white'
                    : 'border-[#e9ecef] bg-[#f8f9fa]'
                }`}
              >
                Admin
              </button>
              */}

              {/* Cashier Card */}
              <button
                type="button"
                onClick={() => setSelectedRole('Cashier')}
                className={`w-full max-w-[240px] py-[26px] rounded-[18px] border-2 transition-all duration-200 ${
                  selectedRole === 'Cashier'
                    ? 'border-[#7c3aed] bg-white shadow-[0_2px_8px_rgba(124,58,237,0.12)]'
                    : 'border-[#e9ecef] bg-[#f8f9fa] hover:bg-white hover:border-[#dee2e6]'
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-[14px]">
                  <div
                    className={`w-[60px] h-[60px] rounded-full flex items-center justify-center ${
                      selectedRole === 'Cashier'
                        ? 'bg-[#7c3aed]'
                        : 'bg-[#e9ecef]'
                    }`}
                  >
                    <FileText
                      className={`w-[28px] h-[28px] ${
                        selectedRole === 'Cashier'
                          ? 'text-white'
                          : 'text-[#adb5bd]'
                      }`}
                    />
                  </div>

                  <span
                    className={`font-semibold text-[15px] ${
                      selectedRole === 'Cashier'
                        ? 'text-[#212529]'
                        : 'text-[#6c757d]'
                    }`}
                  >
                    Cashier
                  </span>
                </div>
              </button>

              {/* Accountant Card */}
              {/*
              <button
                type="button"
                onClick={() => setSelectedRole('Accountant')}
                className={`w-full py-[26px] rounded-[18px] border-2 ${
                  selectedRole === 'Accountant'
                    ? 'border-[#7c3aed] bg-white'
                    : 'border-[#e9ecef] bg-[#f8f9fa]'
                }`}
              >
                Accountant
              </button>
              */}
            </div>
          </div>

          {/* Branch / Store Dropdown */}
          <div>
            <label className="block text-[#212529] font-semibold mb-[14px] text-[15px]">
              Branch / Store
            </label>
            <div className="relative">
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full h-[52px] px-[18px] bg-white border-2 border-[#dee2e6] rounded-[12px] text-[#212529] text-[15px] appearance-none focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-[#7c3aed] cursor-pointer transition-all"
                style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' }}
              >
                <option value="01">Main Store</option>
                <option value="02">Branch Store 1</option>
                <option value="03">Branch Store 2</option>
                <option value="04">Warehouse</option>
              </select>
              <div className="absolute top-1/2 right-[18px] -translate-y-1/2 pointer-events-none">
                <svg
                  className="w-[18px] h-[18px] text-[#adb5bd]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Email / Mobile / Username */}
          <div>
            <label className="block text-[#212529] font-semibold mb-[14px] text-[15px]">
              Email / Mobile / Username
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email or mobile"
              className="w-full h-[52px] px-[18px] bg-white border-2 border-[#dee2e6] rounded-[12px] text-[#212529] text-[15px] placeholder-[#adb5bd] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-[#7c3aed] transition-all"
              style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' }}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium">
              {error}
            </p>
          )}

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-[14px]">
              <label className="block text-[#212529] font-semibold text-[15px]">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[#4169e1] text-[13.5px] font-medium hover:text-[#2347d1] transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full h-[52px] px-[18px] pr-[52px] bg-white border-2 border-[#dee2e6] rounded-[12px] text-[#212529] text-[15px] placeholder-[#adb5bd] focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:border-[#7c3aed] transition-all"
                style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-[16px] -translate-y-1/2 flex items-center justify-center text-[#adb5bd] hover:text-[#6c757d] transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-[20px] h-[20px]" strokeWidth={2} />
                ) : (
                  <Eye className="w-[20px] h-[20px]" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full h-[56px] bg-[#4169e1] hover:bg-[#2347d1] text-white 
            font-semibold rounded-[12px] transition-all duration-200 
            flex items-center justify-center space-x-[10px] 
            shadow-[0_4px_12px_rgba(65,105,225,0.35)] text-[16px] mt-[32px]
            ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            <Zap className="w-[20px] h-[20px]" fill="white" strokeWidth={0} />
            <span>{loading ? "Signing in..." : `Sign In as ${selectedRole}`}</span>
          </button>

        </form>
      </div>
    </div>
  );
};

export default Login;