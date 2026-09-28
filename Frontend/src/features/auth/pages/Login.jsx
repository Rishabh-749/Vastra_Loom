import React, { useState } from 'react';
import ShinyText from '../../../components/ShinyText';
import WarpText from '../../../components/WarpText';
import 'remixicon/fonts/remixicon.css';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router';
import SocialAuth from '../components/SocialAuth';
import SEO from '../../../components/SEO';
import ThemeSwitcher from '../../../components/ThemeSwitcher';

// ── Eye toggle ────────────────────────────────────────────────────────────────
const EyeToggle = ({ show, onToggle }) => (
  <button
    type="button"
    tabIndex={-1}
    onClick={onToggle}
    className="absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors cursor-pointer"
    style={{ color: 'var(--text-muted)' }}
  >
    <i className={`${show ? 'ri-eye-off-line' : 'ri-eye-line'} text-sm`}></i>
  </button>
);

// ── Reusable field ────────────────────────────────────────────────────────────
const Field = ({ icon, ...props }) => (
  <div className="relative group">
    <div
      className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-200"
      style={{ color: 'var(--text-muted)' }}
    >
      <i className={`${icon} text-[15px]`}></i>
    </div>
    <input
      {...props}
      className="w-full pl-10 pr-4 py-3.5 rounded-xl text-base outline-none transition-all duration-200 border focus:border-[var(--accent-gold)]"
      style={{
        backgroundColor: 'var(--bg-card-subtle)',
        borderColor: 'var(--border-card)',
        color: 'var(--text-primary)',
      }}
    />
  </div>
);

const Login = () => {
  const { handleLogin } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loggedUser = await handleLogin({
        email: formData.email,
        password: formData.password,
      });
      if (loggedUser?.role === 'seller') {
        navigate("/seller/dashboard");
      } else {
        navigate("/");
      }
    } catch {
      // Error managed in useAuth / redux
    }
  };

  return (
    // Mobile: scrollable. Desktop: viewport-locked, no scroll.
    <div
      className="min-h-screen lg:h-screen w-full flex flex-col lg:flex-row font-sans lg:overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)' }}
    >
      <SEO
        title="Patron Authentication | VASTRA LOOM"
        description="Sign in to your bespoke VASTRA LOOM patron account to access private collections, bespoke orders, and reservation portfolio."
      />

      {/* ════════════════════════════════════════════
          MOBILE TOP BAR — only visible below lg
      ════════════════════════════════════════════ */}
      <div
        className="lg:hidden flex items-center justify-between px-5 py-4 border-b z-20 sticky top-0 backdrop-blur-md"
        style={{
          backgroundColor: 'var(--bg-header)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <Link to="/" className="flex items-center gap-2" style={{ color: 'var(--accent-gold)' }}>
          <i className="ri-shopping-bag-3-line text-lg"></i>
          <span className="text-base font-bold tracking-[0.15em] uppercase">VASTRA LOOM</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeSwitcher compact />
          <Link
            to="/register"
            className="text-xs font-semibold px-3 py-1 rounded-full transition-colors border"
            style={{
              borderColor: 'var(--accent-gold)',
              color: 'var(--accent-gold)',
            }}
          >
            Register
          </Link>
        </div>
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
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-canvas)] via-[var(--bg-canvas)]/60 to-transparent" />
        <div className="absolute bottom-0 left-0 p-5">
          <p
            className="text-[11px] font-medium tracking-widest uppercase mb-1"
            style={{ color: 'var(--accent-gold)' }}
          >
            Premium Shopping Experience
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
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
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-canvas)] via-[var(--bg-canvas)]/40 to-transparent z-10" />

        {/* Seamless right-edge blend — merges into form panel */}
        <div className="absolute inset-y-0 right-0 w-[35%] bg-gradient-to-r from-transparent to-[var(--bg-canvas)] z-10" />

        {/* Soft top dark strip for nav readability */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[var(--bg-canvas)]/80 to-transparent z-10" />       

        {/* ── Top bar: Logo + Nav ── */}
        <div className="relative z-20 flex items-center justify-between px-10 pt-7">
          {/* VASTRA LOOM Logo */}
          <Link to="/" className="flex items-center gap-2" style={{ color: 'var(--accent-gold)' }}>
            <i className="ri-shopping-bag-3-line text-xl"></i>
            <span className="text-lg font-bold tracking-[0.18em] uppercase">VASTRA LOOM</span>
          </Link>
          {/* Auth direction & Theme switcher */}
          <div className="flex items-center gap-3 text-xs">
            <ThemeSwitcher compact />
            <span style={{ color: 'var(--text-muted)' }}>Don't have an account?</span>
            <Link
              to="/register"
              className="px-3 py-1 rounded-full border font-semibold transition-colors"
              style={{
                borderColor: 'var(--accent-gold)',
                color: 'var(--accent-gold)',
              }}
            >
              Register
            </Link>
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
              fontWeight={500}
              align="left"
              highlightWord="Royal"
              highlightColor="var(--accent-gold)"
              className="w-full h-full -ml-[7%]"
            />
          </div>
          <p
            className="-mt-4 px-2 text-lg font-light max-w-md leading-relaxed"
            style={{ color: 'var(--accent-gold)' }}
          >
            Premium products. Exclusive deals. Seamless shopping.
          </p>
        </div>
      </div>

      {/* ════════════════════════════════════════════
          RIGHT 38% — Form Panel
      ════════════════════════════════════════════ */}
      <div
        className="w-full lg:w-[38%] h-full flex items-start lg:items-center justify-center p-4 sm:p-6 relative overflow-y-auto lg:overflow-hidden"
        style={{ backgroundColor: 'var(--bg-canvas)' }}
      >
        {/* Form card */}
        <div
          className="w-full max-w-[420px] lg:max-w-[400px] p-5 sm:p-6 rounded-2xl backdrop-blur-2xl shadow-2xl relative z-10 my-4 lg:my-0 border"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-card)',
          }}
        >

          {/* Heading */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-1 leading-tight">
              Welcome Back to{' '}
              <ShinyText text="VASTRA LOOM" color="var(--accent-gold)" shineColor="#fff8e7" speed={3} className="font-semibold" />
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Sign in to continue your premium shopping experience.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            <Field icon="ri-mail-line" type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />

            {/* Password */}
            <div className="relative group">
              <div
                className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors duration-200"
                style={{ color: 'var(--text-muted)' }}
              >
                <i className="ri-lock-line text-[15px]"></i>
              </div>
              <input
                type={showPw ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-10 py-3.5 rounded-xl text-base outline-none transition-all duration-200 border focus:border-[var(--accent-gold)]"
                style={{
                  backgroundColor: 'var(--bg-card-subtle)',
                  borderColor: 'var(--border-card)',
                  color: 'var(--text-primary)',
                }}
              />
              <EyeToggle show={showPw} onToggle={() => setShowPw(p => !p)} />
            </div>
            
            <div className="flex justify-end !mt-2">
              <a
                href="#"
                className="text-[11px] hover:underline underline-offset-4"
                style={{ color: 'var(--accent-gold)' }}
              >
                Forgot Password?
              </a>
            </div>

            {/* CTA */}
            <button
              type="submit"
              className="w-full py-3.5 mt-2 rounded-xl text-xs font-bold uppercase tracking-widest shadow-[0_4px_25px_var(--accent-glow)] hover:shadow-[0_6px_30px_var(--accent-glow)] hover:scale-[1.01] active:scale-98 transition-all duration-300 cursor-pointer"
              style={{
                background: 'var(--accent-gradient)',
                color: 'var(--text-on-accent)',
              }}
            >
              Sign In
            </button>

            {/* OR divider */}
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-subtle)' }} />
              <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                OR
              </span>
              <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-subtle)' }} />
            </div>

            {/* Social buttons */}
            <SocialAuth />

            {/* Terms */}
            <p className="text-center text-[11px] pb-1 pt-2" style={{ color: 'var(--text-muted)' }}>
              By logging in, you agree to our{' '}
              <a href="#" className="hover:underline underline-offset-4" style={{ color: 'var(--accent-gold)' }}>
                Terms & Conditions
              </a>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;