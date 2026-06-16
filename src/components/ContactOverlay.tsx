import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Mail, Instagram, Globe, Check, Copy } from 'lucide-react';

interface ContactOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}

export const ContactOverlay: React.FC<ContactOverlayProps> = ({ isOpen, onClose, theme }) => {
  const [copied, setCopied] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', service: '3D Design', message: '' });

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('bon2262@naver.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ name: '', email: '', service: '3D Design', message: '' });
      onClose();
    }, 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-end bg-black/85 backdrop-blur-md p-4 sm:p-6"
        >
          {/* Backdrop click closer */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* Core Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.8 }}
            transition={{ type: 'spring', damping: 26, stiffness: 180 }}
            className={`relative w-full max-w-xl h-[92vh] sm:h-full rounded-md border flex flex-col justify-between overflow-y-auto p-8 sm:p-12 z-10 shadow-2xl ${
              theme === 'dark' 
                ? 'bg-neutral-950 border-neutral-800 text-white' 
                : 'bg-brand-paper border-neutral-300 text-brand-black'
            }`}
          >
            {/* Close Button Floating */}
            <button
              onClick={onClose}
              className={`absolute top-6 right-6 p-2 rounded-full border transition-all ${
                theme === 'dark'
                  ? 'border-white/10 hover:border-white hover:bg-white/10 text-white'
                  : 'border-black/10 hover:border-black hover:bg-black/10 text-brand-black'
              }`}
              title="Close System Overlay"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Area */}
            <div className="space-y-4">
              <div className="font-mono text-[9px] tracking-widest text-brand-bronze uppercase">
                // CONTACT
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight">
                Get In Touch
              </h2>
              <p className={`font-sans text-xs sm:text-sm leading-relaxed ${
                theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
              }`}>
                Do you need 3D graphics or artwork for your brand? Please write down the design you need and send it to me.
              </p>
            </div>

            {/* Core Action Zone (Email Copy or Contact Form) */}
            <div className="my-8 space-y-6">
              
              {/* Direct Mail Row */}
              <div className={`p-4 rounded-sm border flex items-center justify-between ${
                theme === 'dark' ? 'bg-neutral-900/50 border-white/5' : 'bg-white/40 border-black/5'
              }`}>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-brand-bronze" />
                  <div>
                    <span className="font-mono text-[9px] block text-brand-muted uppercase">E-mail</span>
                    <span className="font-mono text-xs sm:text-sm font-semibold select-all">bon2262@naver.com</span>
                  </div>
                </div>
                <button
                  onClick={handleCopyEmail}
                  className="p-2 rounded-sm hover:bg-brand-bronze/10 text-brand-bronze transition-all"
                  title="Copy Email Coordinates"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              {/* Form implementation */}
              {formSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 text-center space-y-4 border border-brand-bronze/30 bg-brand-bronze/5 rounded-sm"
                >
                  <div className="w-12 h-12 rounded-full border border-brand-bronze flex items-center justify-center mx-auto text-brand-bronze animate-pulse">
                    <Send className="w-5 h-5" />
                  </div>
                  <h4 className="font-display font-semibold uppercase text-brand-bronze">TRANSMISSION SECURED</h4>
                  <p className="font-sans text-xs text-neutral-400">
                    Your visual project specs have been registered. Bonwoong Gu portfolio response node will align coordinates within 24 standard cycles.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-brand-muted uppercase">Brand Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full font-sans text-xs p-3 border rounded-sm outline-none transition-all ${
                          theme === 'dark'
                            ? 'border-zinc-800 bg-neutral-900 focus:border-brand-bronze text-white'
                            : 'border-zinc-300 bg-white focus:border-brand-bronze text-brand-black'
                        }`}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-mono text-[9px] text-brand-muted uppercase">EMAIL</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full font-sans text-xs p-3 border rounded-sm outline-none transition-all ${
                          theme === 'dark'
                            ? 'border-zinc-800 bg-neutral-900 focus:border-brand-bronze text-white'
                            : 'border-zinc-300 bg-white focus:border-brand-bronze text-brand-black'
                        }`}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[9px] text-brand-muted uppercase">Category</label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className={`w-full font-mono text-[11px] p-3 border rounded-sm outline-none transition-all ${
                        theme === 'dark'
                          ? 'border-zinc-800 bg-neutral-900 focus:border-brand-bronze text-white'
                          : 'border-zinc-300 bg-white focus:border-brand-bronze text-brand-black'
                      }`}
                    >
                      <option value="3D Design">3D Design & Modeling</option>
                      <option value="Graphic Design">Graphic Design</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[9px] text-brand-muted uppercase">PROJECT DETAILS BRIEF</label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={3}
                      className={`w-full font-sans text-xs p-3 border rounded-sm outline-none resize-none transition-all ${
                        theme === 'dark'
                          ? 'border-zinc-800 bg-neutral-900 focus:border-brand-bronze text-white'
                          : 'border-zinc-300 bg-white focus:border-brand-bronze text-brand-black'
                      }`}
                      placeholder="goals and design requirements..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 border border-brand-bronze bg-brand-bronze text-brand-black hover:bg-transparent hover:text-brand-bronze transition-all px-6 py-2.5 text-xs font-mono font-bold uppercase rounded-sm"
                  >
                    <span>SECURE TRANSMIT MESSAGE</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}

            </div>

            {/* Footer SNS channels */}
            <div className={`pt-6 border-t font-mono text-[10px] space-y-3 ${
              theme === 'dark' ? 'border-neutral-900' : 'border-neutral-200'
            }`}>
              <div className="text-zinc-500 uppercase">BONWOONG GU SOCIAL METRICS</div>
              <div className="flex flex-wrap gap-4 items-center">
                <a
                  href="https://instagram.com/weakfdtion"
                  target="_blank"
                  rel="no-referrer"
                  className="flex items-center gap-1.5 text-brand-muted hover:text-brand-bronze transition-all"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>INSTAGRAM</span>
                </a>
                <span className="text-zinc-600">|</span>
                <a
                  href="https://behance.net/bonwoong_gu"
                  target="_blank"
                  rel="no-referrer"
                  className="flex items-center gap-1.5 text-brand-muted hover:text-brand-bronze transition-all"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>BEHANCE_WORKS</span>
                </a>
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
