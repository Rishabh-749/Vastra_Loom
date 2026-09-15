import React, { useState } from 'react';
import ShinyText from '../../../components/ShinyText';
import LightPillar from '../../../components/LightPillar';
import WarpText from '../../../components/WarpText';
import 'remixicon/fonts/remixicon.css';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router';
import SocialAuth from '../components/SocialAuth';

// ── Eye toggle ────────────────────────────────────────────────────────────────
const EyeToggle = ({ show, onToggle }) => (
  <button
    type="button"
    tabIndex={-1}
    onClick={onToggle}
    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#4a4641] hover:text-[#C6A87C] transition-colors cursor-pointer"
  >
    <i className={`${show ? 'ri-eye-off-line' : 'ri-eye-line'} text-sm`}></i>
  </button>
);

// ── Reusable field ────────────────────────────────────────────────────────────
const Field = ({ icon, ...props }) => (
  <div className="relative group">
    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4a4641] group-focus-within:text-[#C6A87C] transition-colors duration-200">
      <i className={`${icon} text-[15px]`}></i>
    </div>
    <input
      {...props}
      className="w-full pl-10 pr-4 py-3 bg-[#0d0c0b] border border-[#2a2520] rounded-lg text-sm sm:text-base text-gray-100 placeholder-[#4a4641] focus:outline-none focus:border-[#C6A87C]/60 transition-all duration-200"
    />
  </div>
);

const Register = () => {
  const { handleRegister, loading, error: authError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    contactNum: '',
    password: '',
    confirmPassword: '',
    isSeller: false,
  });
  const [formError, setFormError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (formError) setFormError('');

    if (name === 'contactNum') {
      // Allow only numbers, max 10 digits
      const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, contactNum: digitsOnly }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.fullname.trim() || formData.fullname.trim().length < 3) {
      setFormError("Full name must be at least 3 characters long");
      return;
    }

    if (!formData.contactNum || formData.contactNum.length !== 10) {
      setFormError(`Contact number must be exactly 10 digits (currently ${formData.contactNum.length} digits)`);
      return;
    }

    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match. Please verify your password.");
      return;
    }

    try {
      const user = await handleRegister({
        fullname: formData.fullname.trim(),
        email: formData.email.trim(),
        contact: formData.contactNum,
        password: formData.password,
        isSeller: formData.isSeller,
      });

      if (user?.role === 'seller' || formData.isSeller) {
        navigate("/seller/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (err) {
      setFormError(err.message || "Registration failed. Please check your information.");
    }
  };

  const contactLen = formData.contactNum.length;

  return (
    // Mobile: scrollable. Desktop: viewport-locked, no scroll.
    <div className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row bg-[#080806] font-sans text-gray-100 lg:overflow-hidden">

      {/* ════════════════════════════════════════════
          MOBILE TOP BAR — only visible below lg
      ════════════════════════════════════════════ */}
      <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-[#2a2520] bg-[#0a0906] z-20 sticky top-0">
        <div className="flex items-center gap-2 text-[#C6A87C]">
          <i className="ri-shopping-bag-3-line text-lg"></i>
          <span className="text-base font-bold tracking-[0.15em] uppercase">VASTRA LOOM</span>
        </div>
        <a href="/login" className="text-xs text-[#C6A87C] font-semibold border border-[#C6A87C]/30 px-3 py-1 rounded-full hover:bg-[#C6A87C]/10 transition-colors">
          Login
        </a>
      </div>

      {/* ════════════════════════════════════════════
          MOBILE HERO BANNER — only visible below lg
      ════════════════════════════════════════════ */}
      <div className="lg:hidden relative h-[220px] sm:h-[260px] overflow-hidden">
        <img
          src="/Auth.png"
          alt="Luxury fashion"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080806] via-[#080806]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 p-5">
          <p className="text-[#C6A87C] text-[11px] font-medium tracking-widest uppercase mb-1">Premium Shopping Experience</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight tracking-tight">
            The Royal <br />Experience
          </h2>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          LEFT 62% — Image Panel (Desktop only)
      ════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[62%] h-full relative flex-col overflow-hidden">

        <img
          src="/Auth.png"
          alt="Luxury fashion"
          className="absolute inset-0 w-full h-full object-cover object-center"
        />

        {/* Bottom dark fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080806] via-[#080806]/50 to-transparent z-10" />

        {/* Seamless right-edge blend — merges into form panel */}
        <div className="absolute inset-y-0 right-0 w-[35%] bg-gradient-to-r from-transparent to-[#080806] z-10" />

        {/* Soft top dark strip for nav readability */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#080806]/70 to-transparent z-10" />       

        {/* ── Top bar: Logo + Nav ── */}
        <div className="relative z-20 flex items-center justify-between px-10 pt-7">
          {/* VASTRA LOOM Logo */}
          <div className="flex items-center gap-2 text-[#C6A87C]">
            <i className="ri-shopping-bag-3-line text-xl"></i>
            <span className="text-lg font-bold tracking-[0.18em] uppercase">VASTRA LOOM</span>
          </div>
          {/* Auth direction */}
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>Have an account?</span>
            <a
              href="/login"
              className="ml-1.5 px-3 py-1 rounded-full border border-[#C6A87C]/40 text-[#C6A87C] font-semibold hover:bg-[#C6A87C]/10 transition-colors"
            >
              Login
            </a>
          </div>
        </div>

        {/* Hero copy — pinned to bottom */}
        <div className="relative z-20 mt-auto px-10 pb-12 w-full max-w-3xl flex flex-col justify-end">
          <div className="h-[180px] w-full">
            <WarpText
              text={"Discover\nThe Royal Experience"}
              color="#ffffff"
              warpStrength={0.04}
              speed={0.4}
              fontSize="clamp(3rem, 4.2vw, 4.2rem)"
              fontWeight={700}
              align="left"
              highlightWord="Royal"
              highlightColor="#C6A87C"
              className="w-full h-full -ml-[7%]"
            />
          </div>
          <p className="-mt-4 px-2 text-[#9a8060] text-lg font-light max-w-md leading-relaxed">
            Premium products. Exclusive deals. Seamless shopping.
          </p>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          RIGHT 38% — Form Panel
      ════════════════════════════════════════════ */}
      <div className="w-full lg:w-[38%] h-full flex items-start lg:items-center justify-center p-4 sm:p-6 relative overflow-y-auto lg:overflow-hidden bg-[#080806]">

        {/* LightPillar ambient glow — desktop only for perf */}
        <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none opacity-[0.35]">
          <LightPillar
            topColor="#C6A87C"
            bottomColor="#3d2a10"
            intensity={1.2}
            interactive={false}
            pillarWidth={3.5}
            rotationSpeed={0.08}
            glowAmount={0.004}
            noiseIntensity={0.4}
          />
        </div>

        {/* Form card */}
        <div className="w-full max-w-[420px] lg:max-w-[400px] p-5 sm:p-6 rounded-2xl bg-[#100f0d]/95 backdrop-blur-2xl border border-[#2a2520] shadow-[0_20px_70px_rgba(0,0,0,0.6)] relative z-10 my-4 lg:my-0">

          {/* Heading */}
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-1 leading-tight">
              Create Your{' '}
              <ShinyText text="Account" color="#C6A87C" shineColor="#fff8e7" speed={3} className="font-semibold" />
            </h2>
            <p className="text-xs text-[#5a5651]">
              Join VASTRA LOOM and unlock a world of premium shopping.
            </p>
          </div>

          {/* Error Banner */}
          {(formError || authError) && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-red-200 text-xs flex items-center gap-2 mb-3 animate-in fade-in duration-200">
              <i className="ri-error-warning-line text-red-400 text-base shrink-0" />
              <span className="leading-snug">{formError || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5">

            <Field
              icon="ri-user-line"
              type="text"
              name="fullname"
              placeholder="Full Name"
              value={formData.fullname}
              onChange={handleChange}
              required
            />

            <Field
              icon="ri-mail-line"
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />

            {/* Contact Number with 10-digit helper */}
            <div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4a4641] group-focus-within:text-[#C6A87C] transition-colors duration-200">
                  <i className="ri-phone-line text-[15px]"></i>
                </div>
                <input
                  type="tel"
                  name="contactNum"
                  placeholder="Contact Number (10 digits)"
                  value={formData.contactNum}
                  onChange={handleChange}
                  maxLength={10}
                  required
                  className="w-full pl-10 pr-14 py-3 bg-[#0d0c0b] border border-[#2a2520] rounded-lg text-sm sm:text-base text-gray-100 placeholder-[#4a4641] focus:outline-none focus:border-[#C6A87C]/60 transition-all duration-200"
                />
                <span className={`absolute inset-y-0 right-0 pr-3 flex items-center text-[11px] font-mono ${contactLen === 10 ? 'text-emerald-400' : 'text-[#6e675f]'}`}>
                  {contactLen}/10
                </span>
              </div>
              {contactLen > 0 && contactLen < 10 && (
                <p className="text-[10px] text-amber-400 mt-1 ml-1 font-mono">
                  {10 - contactLen} more digit{10 - contactLen > 1 ? 's' : ''} required
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4a4641] group-focus-within:text-[#C6A87C] transition-colors duration-200">
                <i className="ri-lock-line text-[15px]"></i>
              </div>
              <input
                type={showPw ? 'text' : 'password'}
                name="password"
                placeholder="Password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-10 py-3 bg-[#0d0c0b] border border-[#2a2520] rounded-lg text-sm sm:text-base text-gray-100 placeholder-[#4a4641] focus:outline-none focus:border-[#C6A87C]/60 transition-all duration-200"
              />
              <EyeToggle show={showPw} onToggle={() => setShowPw(p => !p)} />
            </div>

            {/* Confirm Password */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#4a4641] group-focus-within:text-[#C6A87C] transition-colors duration-200">
                <i className="ri-lock-line text-[15px]"></i>
              </div>
              <input
                type={showCpw ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-10 py-3 bg-[#0d0c0b] border border-[#2a2520] rounded-lg text-sm sm:text-base text-gray-100 placeholder-[#4a4641] focus:outline-none focus:border-[#C6A87C]/60 transition-all duration-200"
              />
              <EyeToggle show={showCpw} onToggle={() => setShowCpw(p => !p)} />
            </div>

            {/* isSeller toggle */}
            <div
              onClick={() => setFormData(prev => ({ ...prev, isSeller: !prev.isSeller }))}
              className="flex items-center justify-between p-3 rounded-lg border border-[#2a2520] bg-[#0d0c0b] cursor-pointer hover:border-[#3a3530] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-[#1a1612] flex items-center justify-center text-[#C6A87C] flex-shrink-0">
                  <i className="ri-store-2-line text-sm"></i>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-200">Register as Seller</div>
                  <div className="text-[11px] text-[#4a4641]">Start selling your creations on VASTRA LOOM</div>
                </div>
              </div>
              <div className={`w-9 h-5 rounded-full px-0.5 flex items-center flex-shrink-0 transition-colors duration-300 ${formData.isSeller ? 'bg-[#C6A87C]' : 'bg-[#2a2520]'}`}>
                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${formData.isSeller ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </div>

            {/* CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-1 rounded-lg bg-gradient-to-r from-[#C6A87C] via-[#e8d5aa] to-[#C6A87C] text-[#0e0c09] text-sm font-bold tracking-wide hover:shadow-[0_0_24px_rgba(198,168,124,0.3)] active:scale-[0.99] transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-base" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>

            {/* OR divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#2a2520]" />
              <span className="text-[11px] text-[#4a4641] font-medium">OR</span>
              <div className="flex-1 h-px bg-[#2a2520]" />
            </div>

            {/* Social buttons */}
            <SocialAuth />

            {/* Terms */}
            <p className="text-center text-[11px] text-[#4a4641] pb-1">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-[#C6A87C] hover:underline underline-offset-4">Terms & Conditions</a>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;