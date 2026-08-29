'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/lib/types';
import { 
  X, 
  Lock, 
  Mail, 
  User as UserIcon, 
  Phone, 
  MapPin, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  UtensilsCrossed, 
  Sparkles,
  Store,
  Bike,
  ShieldCheck
} from 'lucide-react';

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalTab, 
    authPromptMessage, 
    login, 
    register, 
    switchRole,
    availableUsers 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(authModalTab);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('CUSTOMER');

  // Synchronize internal tab when context opens with a specific tab
  React.useEffect(() => {
    setActiveTab(authModalTab);
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [authModalTab, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMessage('Please enter both email and password.');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);

    const result = await login(loginEmail, loginPassword);
    setIsLoading(false);
    if (!result.success) {
      setErrorMessage(result.error || 'Failed to sign in.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    if (regPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const result = await register({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      phone: regPhone.trim() || '+880 1711-000000',
      address: regAddress.trim() || 'Dhaka, Bangladesh',
      role: regRole,
    });

    setIsLoading(false);
    if (!result.success) {
      setErrorMessage(result.error || 'Failed to create account.');
    } else {
      setSuccessMessage('Account created successfully! Welcome to QuickBite.');
    }
  };

  const handleQuickDemoLogin = async (role: UserRole) => {
    const demoUser = availableUsers.find(u => u.role === role);
    if (demoUser) {
      setLoginEmail(demoUser.email);
      setLoginPassword('password123');
      setIsLoading(true);
      setErrorMessage(null);
      const res = await login(demoUser.email, 'password123');
      setIsLoading(false);
      if (!res.success) {
        // Fallback to switchRole
        switchRole(role);
        closeAuthModal();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      
      {/* Modal Box */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Decorative Top Accent */}
        <div className="h-2 bg-gradient-to-r from-brand-500 via-amber-500 to-orange-600" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 sm:p-8">
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-1.5">
                Quick<span className="text-brand-500">Bite</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-100">
                  Account Portal
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {activeTab === 'login' 
                  ? 'Sign in to place orders, track live food deliveries, and save favorite spots.'
                  : 'Join QuickBite to start ordering delicious food delivered fast.'}
              </p>
            </div>
          </div>

          {/* Prompt Notice if Triggered by Checkout / Order Action */}
          {authPromptMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center gap-2.5 shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{authPromptMessage}</span>
            </div>
          )}

          {/* Error & Success Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Tab Selector */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('register'); setErrorMessage(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'register'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create Account (Register)
            </button>
          </div>

          {/* Tab 1: SIGN IN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. customer@quickbite.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <span className="text-[11px] text-brand-600 hover:underline cursor-pointer">Forgot password?</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all"
              >
                {isLoading ? 'Signing In...' : 'Sign In to QuickBite'}
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* 1-Click Fast Demo Login Buttons */}
              <div className="pt-4 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                  Quick 1-Click Persona Test Login
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('CUSTOMER')}
                    className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-800 text-left transition-colors"
                  >
                    <UserIcon className="w-3.5 h-3.5 mb-1 text-emerald-600" />
                    <p className="text-[10px] font-black leading-tight">Customer</p>
                    <p className="text-[9px] text-emerald-600/80">Maknoon</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('RESTAURANT_MANAGER')}
                    className="p-2 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-amber-800 text-left transition-colors"
                  >
                    <Store className="w-3.5 h-3.5 mb-1 text-amber-600" />
                    <p className="text-[10px] font-black leading-tight">Kitchen</p>
                    <p className="text-[9px] text-amber-600/80">Chef Kabir</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('DELIVERY_PERSON')}
                    className="p-2 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-800 text-left transition-colors"
                  >
                    <Bike className="w-3.5 h-3.5 mb-1 text-blue-600" />
                    <p className="text-[10px] font-black leading-tight">Rider</p>
                    <p className="text-[9px] text-blue-600/80">Rakibul</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('ADMIN')}
                    className="p-2 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-purple-800 text-left transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 mb-1 text-purple-600" />
                    <p className="text-[10px] font-black leading-tight">Admin</p>
                    <p className="text-[9px] text-purple-600/80">Dr. Nazia</p>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Tab 2: REGISTER / CREATE ACCOUNT */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 max-h-[65vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. tanvir@example.com"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 4 characters"
                      className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+880 17..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Street Address</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="e.g. Flat 3A, House 15, Dhanmondi, Dhaka"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Register As</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('CUSTOMER')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      regRole === 'CUSTOMER'
                        ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    🍴 Food Customer
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegRole('RESTAURANT_MANAGER')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold text-left transition-all ${
                      regRole === 'RESTAURANT_MANAGER'
                        ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    🏪 Restaurant Partner
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all mt-2"
              >
                {isLoading ? 'Creating Account...' : 'Complete Registration'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
