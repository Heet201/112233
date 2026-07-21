import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Lock, User, Eye, EyeOff, AlertCircle, ArrowLeft, ShieldCheck } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

export default function AdminLogin({ onLoginSuccess, onCancel }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Simulate authenticating against local secure admin credentials
    setTimeout(() => {
      if (email.trim().toLowerCase() === 'admin@trueline.com' && password === 'admin123') {
        setLoginSuccess(true);
        setTimeout(() => {
          onLoginSuccess();
          setIsSubmitting(false);
        }, 800);
      } else {
        setError('Invalid admin credentials. Please double-check your security parameters.');
        setIsSubmitting(false);
      }
    }, 600);
  };

  return (
    <div id="admin-login-screen" className="flex-1 flex items-center justify-center h-full bg-[#f3f2f1] px-4 font-sans text-[#323130]">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md bg-white border border-[#edebe9] shadow-lg rounded-sm overflow-hidden"
      >
        {/* Top Accent Strip */}
        <div className="h-1 bg-[#0078d4] w-full"></div>

        {/* Brand Header */}
        <div className="p-6 pb-4 border-b border-[#f3f2f1] flex items-center justify-between bg-gradient-to-r from-white to-[#fcfcfc]">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#0078d4] text-white p-1.5 rounded-sm">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-[#323130]">Trueline Solutions</h2>
              <p className="text-[10px] text-[#605e5c] font-semibold uppercase tracking-wider">Internal Security Gate</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-[#605e5c] hover:text-[#0078d4] p-1.5 hover:bg-[#f3f2f1] rounded-sm transition-colors cursor-pointer"
            title="Back to Customer Portal"
          >
            <ArrowLeft size={16} />
          </button>
        </div>

        {/* Main Form Area */}
        <div className="p-6 space-y-5">
          {loginSuccess ? (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-12 flex flex-col items-center justify-center text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-[#f1faf1] border border-[#107c10]/20 flex items-center justify-center text-[#107c10]">
                <ShieldCheck size={28} className="animate-bounce" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#107c10]">Access Granted</h3>
                <p className="text-xs text-[#605e5c] mt-1">Booting SLA Compliance CRM Panel...</p>
              </div>
            </motion.div>
          ) : (
            <>
              <div className="text-center space-y-1">
                <h3 className="font-extrabold text-lg text-[#323130]">Support Agent Login</h3>
                <p className="text-xs text-[#605e5c]">Authenticate below to check and reply to customer tickets.</p>
              </div>

              {/* Demo Credentials Alert Banner */}
              <div className="p-3 bg-[#fffdf0] border border-[#d83b01]/10 rounded-sm space-y-1">
                <p className="text-[10px] font-bold text-[#d83b01] uppercase tracking-wider flex items-center gap-1">
                  <AlertCircle size={12} />
                  Demo Admin Credentials
                </p>
                <div className="text-xs text-[#605e5c] font-mono flex flex-col gap-0.5">
                  <p>Email: <span className="font-bold text-[#323130] select-all">admin@trueline.com</span></p>
                  <p>Password: <span className="font-bold text-[#323130] select-all">admin123</span></p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-[#fff1f1] border border-[#d13438]/15 rounded-sm flex items-start gap-2 text-xs text-[#d13438] font-medium"
                  >
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Email Field */}
                <div className="space-y-1">
                  <label htmlFor="admin-email" className="block text-xs font-bold text-[#605e5c]">
                    Admin Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="admin-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g., admin@trueline.com"
                      disabled={isSubmitting}
                      className="w-full bg-white border border-[#edebe9] rounded-sm pl-9 pr-3 py-2 text-xs text-[#323130] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0078d4] focus:border-[#0078d4] transition-all"
                    />
                    <User className="absolute left-3 top-2.5 text-gray-400" size={14} />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label htmlFor="admin-password" className="block text-xs font-bold text-[#605e5c]">
                      Security Password
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={isSubmitting}
                      className="w-full bg-white border border-[#edebe9] rounded-sm pl-9 pr-10 py-2 text-xs text-[#323130] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0078d4] focus:border-[#0078d4] transition-all"
                    />
                    <Lock className="absolute left-3 top-2.5 text-gray-400" size={14} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-[#0078d4] transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#0078d4] hover:bg-[#106ebe] disabled:bg-[#f3f2f1] disabled:text-[#a19f9d] disabled:cursor-not-allowed text-white text-xs font-bold py-2 px-4 rounded-sm shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={13} />
                        <span>Sign In as Admin</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="w-full bg-white hover:bg-[#f3f2f1] border border-[#edebe9] text-[#323130] text-xs font-bold py-2 px-4 rounded-sm transition-colors cursor-pointer"
                  >
                    Cancel / Go to Customer Portal
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
