import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import 'remixicon/fonts/remixicon.css';

export const ThemeSwitcher = ({ compact = false, className = '' }) => {
  const { theme, themeConfig, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Theme Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Current theme: ${themeConfig.name}. Click to change theme.`}
        title={`Atelier Palette: ${themeConfig.name}`}
        className={`group flex items-center gap-2 rounded-xl border transition-all duration-300 cursor-pointer select-none ${
          compact
            ? 'px-2.5 py-1.5 text-xs'
            : 'px-3 py-1.5 text-xs'
        } bg-[var(--bg-card)] border-[var(--border-card)] hover:border-[var(--accent-gold)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-sm`}
      >
        {/* Color preview indicator */}
        <span
          className="w-2.5 h-2.5 rounded-full border border-[var(--border-card)] shadow-xs transition-transform group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${themeConfig.accentColor} 0%, ${themeConfig.canvasColor} 100%)`,
          }}
        />

        <i className={`${themeConfig.icon} text-xs text-[var(--accent-gold)]`} />

        {!compact && (
          <span className="font-semibold text-[11px] uppercase tracking-wider hidden sm:inline">
            {themeConfig.pillText}
          </span>
        )}

        <i
          className={`ri-arrow-down-s-line text-xs text-[var(--text-muted)] transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[var(--accent-gold)]' : ''
          }`}
        />
      </button>

      {/* Luxury Theme Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-[0_15px_45px_rgba(0,0,0,0.45)] backdrop-blur-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
          <div className="px-2.5 py-1.5 border-b border-[var(--border-subtle)] mb-1">
            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[var(--accent-gold)] block">
              Atelier Theme Aura
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">
              Choose your couture aesthetic
            </span>
          </div>

          {themes.map((t) => {
            const isActive = t.id === theme;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTheme(t.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--bg-card-subtle)] text-[var(--text-primary)] font-bold border border-[var(--accent-gold)]/40 shadow-xs'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0 shadow-xs"
                    style={{
                      background: `linear-gradient(135deg, ${t.accentColor} 30%, ${t.canvasColor} 100%)`,
                    }}
                  />
                  <div>
                    <span className="block text-xs font-semibold leading-tight">
                      {t.name}
                    </span>
                    <span className="block text-[9px] text-[var(--text-muted)] leading-tight">
                      {t.subtitle}
                    </span>
                  </div>
                </div>

                {isActive && (
                  <i className="ri-check-line text-[var(--accent-gold)] text-sm font-bold" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
