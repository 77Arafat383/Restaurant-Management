'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DEFAULT_UNISEX_AVATAR } from '@/lib/types';
import {
  X,
  User as UserIcon,
  Phone,
  MapPin,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export default function EditProfileModal() {
  const { currentUser, isEditProfileOpen, closeEditProfileModal, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setAddress(currentUser.address || '');
      setAvatar(currentUser.avatar || DEFAULT_UNISEX_AVATAR);
      setCustomUrl('');
      setShowUrlInput(false);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [currentUser, isEditProfileOpen]);

  if (!isEditProfileOpen || !currentUser) return null;

  // Handle local image file upload & convert to base64 Data URL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP, SVG).');
      return;
    }

    // Limit file size to 2MB to keep payload fast and optimal
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 2MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
        setErrorMessage(null);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!customUrl.trim() || !customUrl.startsWith('http')) {
      setErrorMessage('Please enter a valid HTTP/HTTPS image URL.');
      return;
    }
    setAvatar(customUrl.trim());
    setErrorMessage(null);
    setShowUrlInput(false);
  };

  const handleResetAvatar = () => {
    setAvatar(DEFAULT_UNISEX_AVATAR);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Name cannot be empty.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const result = await updateProfile({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      avatar: avatar.trim(),
    });

    setIsLoading(false);

    if (result.success) {
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => {
        closeEditProfileModal();
      }, 1200);
    } else {
      setErrorMessage(result.error || 'Failed to update profile.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={closeEditProfileModal}
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 space-y-0">

        {/* Header */}
        <div className="bg-slate-950 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center ring-1 ring-brand-500/40">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white font-outfit">Edit Profile</h2>
              <p className="text-xs text-slate-400">Update your details and customize your profile picture</p>
            </div>
          </div>
          <button
            onClick={closeEditProfileModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

          {/* Status Notifications */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Profile Picture Upload Section */}
          <div className="flex flex-col items-center justify-center text-center space-y-4 pb-2 border-b border-slate-100">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full ring-4 ring-brand-500/20 shadow-md overflow-hidden bg-slate-100 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatar || DEFAULT_UNISEX_AVATAR}
                  alt={name || 'Profile Avatar'}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Upload Overlay Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-slate-900/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer"
                title="Click to upload new photo"
              >
                <Camera className="w-6 h-6 text-white" />
                <span className="text-[10px] font-bold">Upload</span>
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Upload Controls */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold flex items-center gap-1.5 transition-colors border border-brand-200/60"
              >
                <Upload className="w-3.5 h-3.5" /> Upload File
              </button>

              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <LinkIcon className="w-3.5 h-3.5" /> Image URL
              </button>

              <button
                type="button"
                onClick={handleResetAvatar}
                className="px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
                title="Reset to default gender-neutral avatar"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Image URL Input Form */}
            {showUrlInput && (
              <div className="w-full flex items-center gap-2 pt-2 animate-fade-in">
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 text-slate-800"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
                >
                  Apply
                </button>
              </div>
            )}
          </div>

          {/* User Fields */}
          <div className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1700-000000"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street Address, Upazila, District"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
                />
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={closeEditProfileModal}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-brand-500/25 flex items-center gap-2 transition-all"
            >
              {isLoading ? 'Saving...' : 'Save Profile Changes'}
              <Sparkles className="w-4 h-4" />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
