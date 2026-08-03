import React, { useState } from "react";
import { User } from "../types";
import { getApiUrl } from "../apiConfig";
import { X, LogIn, UserPlus, Shield, KeyRound, Phone, Mail, User as UserIcon, CheckCircle2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User, token: string) => void;
  onShowToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  onShowToast,
}) => {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("admin@test.com");
  const [loginPassword, setLoginPassword] = useState("123456");

  // Register form state
  const [regFname, setRegFname] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(getApiUrl("/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword,
        }),
      });

      const data = await res.json();
      if (data.success && data.token && data.user) {
        onLoginSuccess(data.user, data.token);
        onShowToast(`Welcome back, ${data.user.fname}! (${data.user.role})`, "success");
        onClose();
      } else {
        onShowToast(data.message || "Login failed", "error");
      }
    } catch (err) {
      console.error("Login request error:", err);
      onShowToast("Network error executing login", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regFname.trim() || !regPhone.trim() || !regEmail.trim() || !regPassword) {
      onShowToast("All fields are required", "error");
      return;
    }

    if (regPhone.trim().length !== 10 || !/^\d+$/.test(regPhone.trim())) {
      onShowToast("Phone must be a 10 digit mobile number", "error");
      return;
    }

    if (regPassword.length < 6) {
      onShowToast("Password must be at least 6 characters", "error");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(getApiUrl("/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fname: regFname.trim(),
          phone: regPhone.trim(),
          email: regEmail.trim(),
          password: regPassword,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onShowToast("Registration successful! Logging you in...", "success");
        // Auto login with new user credentials
        setLoginEmail(regEmail.trim());
        setLoginPassword(regPassword);
        
        const loginRes = await fetch(getApiUrl("/auth/login"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: regEmail.trim(),
            password: regPassword,
          }),
        });
        const loginData = await loginRes.json();
        if (loginData.success && loginData.token) {
          onLoginSuccess(loginData.user, loginData.token);
          onClose();
        } else {
          setAuthMode("login");
        }
      } else {
        onShowToast(data.message || "Registration failed", "error");
      }
    } catch (err) {
      console.error("Registration error:", err);
      onShowToast("Server error during registration", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Preset Fast Login
  const handlePresetLogin = (email: string) => {
    setLoginEmail(email);
    setLoginPassword("123456");
    setAuthMode("login");
  };

  return (
    <div id="modal-auth-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div id="modal-auth-card" className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          id="btn-close-auth-modal"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Headers */}
        <div id="auth-mode-tabs" className="flex border-b border-slate-800 mb-6">
          <button
            id="tab-btn-login"
            onClick={() => setAuthMode("login")}
            className={`flex items-center space-x-2 pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
              authMode === "login"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Login</span>
          </button>

          <button
            id="tab-btn-register"
            onClick={() => setAuthMode("register")}
            className={`flex items-center space-x-2 pb-3 px-4 text-sm font-bold border-b-2 transition-all ${
              authMode === "register"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Register</span>
          </button>
        </div>

        {/* LOGIN FORM */}
        {authMode === "login" && (
          <form id="form-auth-login" onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="input-login-email"
                  type="email"
                  required
                  placeholder="admin@test.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 text-white text-xs rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="input-login-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 text-white text-xs rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition active:scale-95"
            >
              {isLoading ? "Authenticating..." : "Login to Account"}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {authMode === "register" && (
          <form id="form-auth-register" onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name (fname)</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="input-register-fname"
                  type="text"
                  required
                  placeholder="e.g. Jane Smith"
                  value={regFname}
                  onChange={(e) => setRegFname(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 text-white text-xs rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone (10 Digits)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="input-register-phone"
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 text-white text-xs rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="input-register-email"
                  type="email"
                  required
                  placeholder="jane@test.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 text-white text-xs rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password (Min 6 chars)</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="input-register-password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 text-white text-xs rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              id="btn-submit-register"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition active:scale-95 mt-2"
            >
              {isLoading ? "Creating Account..." : "Register User"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
