'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, ShieldCheck, GraduationCap, Users, Clock, Sparkles, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { INITIAL_FEEDBACKS } from '@/lib/seed-data';

export default function AboutContact() {
  const { currentUser } = useAuth();
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else if (path.includes('/contact')) {
        const element = document.querySelector('#contact');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    // Delay slightly to ensure component has mounted and rendered fully
    const timer = setTimeout(handleScroll, 150);

    window.addEventListener('hashchange', handleScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', handleScroll);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please enter a message.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: currentUser?.id || 'anonymous',
          customerName: name || 'Anonymous Guest',
          customerAvatar: currentUser?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
          rating: rating,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setComment('');
      } else {
        setError(data.error || 'Failed to submit message.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 pb-24">
      {/* Title Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="px-3.5 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-black tracking-wider uppercase border border-brand-100 animate-pulse">
          Info & Support Hub
        </span>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 font-outfit">
          About Us & <span className="bg-gradient-to-r from-brand-600 to-amber-500 bg-clip-text text-transparent">Contact Support</span>
        </h1>
        <p className="text-slate-500 text-sm sm:text-base leading-relaxed font-semibold font-inter">
          Explore our university Software Engineering project details, verified customer reviews, and get in touch with support.
        </p>
      </div>

      {/* SECTION 1: About Section (Academic Supervision & Project Creators) */}
      <div id="about" className="bg-gradient-to-tr from-slate-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800 scroll-mt-20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start relative z-10">
          
          {/* Left Column: Supervisor */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <GraduationCap className="w-7 h-7 text-brand-400" />
              <h2 className="text-lg font-black font-outfit">Academic Supervisor</h2>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed font-inter">
              This system was conceptualized, designed, and developed under the academic guidance of:
            </p>
            <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/50">
              <p className="text-base font-bold text-white font-outfit">Dr. Nazia Majadi</p>
              <p className="text-xs text-slate-400 mt-0.5">Professor, Dept. of CSTE</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">Noakhali Science & Technology University</p>
            </div>
          </div>

          {/* Right Column: Creators */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Users className="w-7 h-7 text-amber-400" />
              <h2 className="text-lg font-black font-outfit">Project Creators</h2>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed font-inter">
              Designed & implemented by Department of CSTE students:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 text-left">
                <p className="text-xs font-bold text-white">Maknoon Sultana</p>
                <p className="text-[10px] text-slate-400 mt-1">ID: NFH2201007F</p>
              </div>
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50 text-left">
                <p className="text-xs font-bold text-white">Umme Nur Sadia</p>
                <p className="text-[10px] text-slate-400 mt-1">ID: BKH2201020F</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* SECTION 2: Customer Testimonials Section */}
      <section className="bg-slate-50 py-12 px-6 sm:px-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-black text-slate-900 font-outfit">What Foodies Love About QuickBite</h2>
          <p className="text-xs text-slate-500 font-semibold font-inter">
            Verified reviews from happy customers across Dhaka.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {INITIAL_FEEDBACKS.map(fb => (
            <div key={fb.id} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 shrink-0">
                    {fb.customerAvatar && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={fb.customerAvatar} alt={fb.customerName} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">{fb.customerName}</h4>
                    <p className="text-[10px] text-brand-600 font-bold">Reviewed {fb.restaurantName}</p>
                  </div>
                </div>
                <div className="flex text-amber-500">
                  {[...Array(fb.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-600 italic leading-relaxed">
                &ldquo;{fb.comment}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: Contact Section (Form & Hotline Details) */}
      <div id="contact" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start scroll-mt-20">
        
        {/* Left Column: Central Contact Info Details (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-black text-slate-900 text-sm font-outfit">Central Contact Details</h3>
            
            <div className="space-y-3.5 text-xs font-semibold text-slate-600 font-inter">
              <div className="flex items-center gap-3">
                <div className="w-8.5 h-8.5 rounded-lg bg-slate-50 text-blue-500 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-brand-500" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Hotline</p>
                  <p className="text-slate-800 font-bold">+880 1711-223344</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8.5 h-8.5 rounded-lg bg-slate-50 text-blue-500 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-brand-500" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Email Support</p>
                  <p className="text-slate-800 font-bold">support@quickbite.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8.5 h-8.5 rounded-lg bg-slate-50 text-blue-500 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-brand-500" />
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-bold">Address</p>
                  <p className="text-slate-800 font-bold">CSTE Dept, NSTU, Noakhali</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 text-white p-6 rounded-3xl space-y-4 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl" />
            <h3 className="font-black text-white font-outfit flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400 animate-pulse" /> Delivery Hours
            </h3>
            <p className="text-xs text-slate-400 font-semibold font-inter leading-relaxed">
              Our automated kitchen dispatch routing and live rider tracking operate continuously from **8:00 AM to 11:30 PM** every day.
            </p>
          </div>
        </div>

        {/* Right Column: Contact/Feedback Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6 font-outfit">Contact Us by Email</h2>
          
          {success ? (
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl text-center space-y-3">
              <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="font-black text-emerald-800 text-lg font-outfit">Message Logged!</h3>
              <p className="text-xs text-emerald-600 font-semibold font-inter">
                Your message has been submitted to the QuickBite feedback database. Our administrators will review it.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-2 text-xs font-bold text-emerald-700 underline hover:text-emerald-800"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-3.5 rounded-xl text-xs font-bold font-inter">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Maknoon Sultana"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. customer@quickbite.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Rate Experience</label>
                <div className="flex gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`w-9 h-9 rounded-xl font-black text-xs transition-all ${
                        rating >= star
                          ? 'bg-amber-400 text-slate-900 shadow-sm'
                          : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {star} ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Message *</label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ask a question or share feedback..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-brand-500 text-slate-800 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2 transition-all mt-2"
              >
                {loading ? 'Sending...' : 'Send Email Message'}
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
