import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AnimatedLogo from '../AnimatedLogo';

const LandingNavbar = ({ user, setShowAuthModal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header
        className={`bg-surface/80 dark:bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'h-14 py-2' : 'h-16 py-md'}`}
      >
        <nav className="flex items-center px-lg max-w-7xl mx-auto h-full w-full">
          {/* Mobile Menu Button */}
          <div className="flex md:hidden flex-none items-center">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-on-surface p-sm rounded-lg hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>

          {/* Left Side: Logo */}
          <div className="flex-1 flex items-center justify-start cursor-pointer">
            <Link to="/" className="flex items-center">
              <AnimatedLogo size="md" className="hidden sm:inline-flex" />
              {/* Compact Logo for tiny screens */}
              <div className="sm:hidden">
                <svg
                  viewBox="0 0 45 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-10 h-10"
                >
                  <g className="mascot-wholesome">
                    <path
                      d="M5 25 C5 10, 35 10, 35 25 L35 32 C35 35, 30 38, 20 38 C10 38, 5 35, 5 32 Z"
                      fill="url(#grad-white-header)"
                    />
                    <ellipse
                      cx="14"
                      cy="22"
                      rx="2.5"
                      ry="3.5"
                      fill="#1A1F2E"
                      className="mascot-eye"
                    />
                    <ellipse
                      cx="26"
                      cy="22"
                      rx="2.5"
                      ry="3.5"
                      fill="#1A1F2E"
                      className="mascot-eye"
                    />
                  </g>
                  <defs>
                    <linearGradient id="grad-white-header" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="100%" stopColor="#E2E8F0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </Link>
          </div>

          {/* Center: Nav Links */}
          <div className="hidden md:flex flex-none items-center justify-center gap-xl h-full">
            <Link
              className={`transition-colors font-body-md text-body-md ${isActive('/') ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
              to="/"
            >
              Product
            </Link>
            <Link
              className={`transition-colors font-body-md text-body-md ${isActive('/docs') ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
              to="/docs"
            >
              Docs
            </Link>
            <Link
              className={`transition-colors font-body-md text-body-md ${isActive('/community') ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
              to="/community"
            >
              Community
            </Link>
            <Link
              className={`transition-colors font-body-md text-body-md ${isActive('/blog') ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
              to="/blog"
            >
              Blog
            </Link>
          </div>

          {/* Right: Buttons */}
          <div className="flex-1 flex items-center justify-end gap-md">
            {user ? (
              <button
                onClick={() => (window.location.href = '/ide')}
                className="bg-primary-container text-on-primary-container px-md sm:px-lg py-sm rounded-lg font-bold hover:brightness-110 active:scale-95 transition-all shadow-md font-body-md text-body-sm sm:text-body-md"
              >
                Go to IDE
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-primary-container text-on-primary-container px-md sm:px-lg py-sm rounded-lg font-bold hover:brightness-110 active:scale-95 transition-all shadow-md font-body-md text-body-sm sm:text-body-md"
              >
                Sign In / Create Account
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed inset-0 z-[60] bg-background/95 backdrop-blur-xl transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}
      >
        <div className="flex flex-col h-full p-xl">
          <div className="flex justify-between items-center mb-2xl">
            <AnimatedLogo size="md" />
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-on-surface">
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
          </div>
          <div className="flex flex-col gap-xl mb-auto">
            <Link
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-bold text-on-surface-variant hover:text-primary transition-colors"
              to="/"
            >
              Product
            </Link>
            <Link
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-bold text-on-surface-variant hover:text-primary transition-colors"
              to="/docs"
            >
              Docs
            </Link>
            <Link
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-bold text-on-surface-variant hover:text-primary transition-colors"
              to="/community"
            >
              Community
            </Link>
            <Link
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-bold text-on-surface-variant hover:text-primary transition-colors"
              to="/blog"
            >
              Blog
            </Link>
          </div>
          <div className="pt-xl border-t border-outline-variant/30 flex flex-col gap-lg">
            <button
              onClick={() => {
                if (user) {
                  window.location.href = '/ide';
                } else {
                  setShowAuthModal(true);
                }
                setIsMobileMenuOpen(false);
              }}
              className="w-full bg-primary-container text-on-primary-container py-lg rounded-xl font-bold shadow-xl"
            >
              {user ? 'Go to IDE' : 'Sign In / Create Account'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingNavbar;
