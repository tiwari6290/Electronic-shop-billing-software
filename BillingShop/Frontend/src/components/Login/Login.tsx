import React, { useState } from 'react';
import { Shield, FileText, Calculator, Eye, EyeOff, Zap } from 'lucide-react';
import { useLogin } from "../../hooks/useLogin";


const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);

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


  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[750px]">
        {/* Header */}
        <div className="text-center mb-[52px]">
          <h1 className="text-[44px] font-bold text-[#212529] mb-[10px] leading-tight tracking-[-0.5px]">
            Welcome Back
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
            <div className="grid grid-cols-3 gap-[18px]">
              {/* Admin Card */}
              <button
                type="button"
                onClick={() => setSelectedRole('Admin')}
                className={`w-full h-full py-[26px] rounded-[18px] border-2 transition-all duration-200 ${
                  selectedRole === 'Admin'
                    ? 'border-[#7c3aed] bg-white shadow-[0_2px_8px_rgba(124,58,237,0.12)]'
                    : 'border-[#e9ecef] bg-[#f8f9fa] hover:bg-white hover:border-[#dee2e6]'
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-[14px]">
                  <div
                    className={`w-[60px] h-[60px] rounded-full flex items-center justify-center transition-all duration-200 ${
                      selectedRole === 'Admin'
                        ? 'bg-[#7c3aed]'
                        : 'bg-[#e9ecef]'
                    }`}
                  >
                    <Shield
                      className={`w-[28px] h-[28px] ${
                        selectedRole === 'Admin' ? 'text-white' : 'text-[#adb5bd]'
                      }`}
                      strokeWidth={2.5}
                    />
                  </div>
                  <span
                    className={`font-semibold text-[15px] ${
                      selectedRole === 'Admin' ? 'text-[#212529]' : 'text-[#6c757d]'
                    }`}
                  >
                    Admin
                  </span>
                </div>
              </button>

              {/* Cashier Card */}
              <button
                type="button"
                onClick={() => setSelectedRole('Cashier')}
                className={`w-full h-full py-[26px] rounded-[18px] border-2 transition-all duration-200 ${
                  selectedRole === 'Cashier'
                    ? 'border-[#7c3aed] bg-white shadow-[0_2px_8px_rgba(124,58,237,0.12)]'
                    : 'border-[#e9ecef] bg-[#f8f9fa] hover:bg-white hover:border-[#dee2e6]'
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-[14px]">
                  <div
                    className={`w-[60px] h-[60px] rounded-full flex items-center justify-center transition-all duration-200 ${
                      selectedRole === 'Cashier'
                        ? 'bg-[#7c3aed]'
                        : 'bg-[#e9ecef]'
                    }`}
                  >
                    <FileText
                      className={`w-[28px] h-[28px] ${
                        selectedRole === 'Cashier' ? 'text-white' : 'text-[#adb5bd]'
                      }`}
                      strokeWidth={2.5}
                    />
                  </div>
                  <span
                    className={`font-semibold text-[15px] ${
                      selectedRole === 'Cashier' ? 'text-[#212529]' : 'text-[#6c757d]'
                    }`}
                  >
                    Cashier
                  </span>
                </div>
              </button>

              {/* Accountant Card */}
              <button
                type="button"
                onClick={() => setSelectedRole('Accountant')}
                className={`w-full h-full py-[26px] rounded-[18px] border-2 transition-all duration-200 ${
                  selectedRole === 'Accountant'
                    ? 'border-[#7c3aed] bg-white shadow-[0_2px_8px_rgba(124,58,237,0.12)]'
                    : 'border-[#e9ecef] bg-[#f8f9fa] hover:bg-white hover:border-[#dee2e6]'
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-[14px]">
                  <div
                    className={`w-[60px] h-[60px] rounded-full flex items-center justify-center transition-all duration-200 ${
                      selectedRole === 'Accountant'
                        ? 'bg-[#7c3aed]'
                        : 'bg-[#e9ecef]'
                    }`}
                  >
                    <Calculator
                      className={`w-[28px] h-[28px] ${
                        selectedRole === 'Accountant' ? 'text-white' : 'text-[#adb5bd]'
                      }`}
                      strokeWidth={2.5}
                    />
                  </div>
                  <span
                    className={`font-semibold text-[15px] ${
                      selectedRole === 'Accountant' ? 'text-[#212529]' : 'text-[#6c757d]'
                    }`}
                  >
                    Accountant
                  </span>
                </div>
              </button>
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
                <option>Main Store</option>
                <option>Branch Store 1</option>
                <option>Branch Store 2</option>
                <option>Warehouse</option>
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