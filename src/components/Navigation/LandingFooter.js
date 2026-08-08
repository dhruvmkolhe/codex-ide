import React from 'react';
import { Link } from 'react-router-dom';
import AnimatedLogo from '../AnimatedLogo';

const LandingFooter = () => {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant py-2xl">
      <div className="max-w-7xl mx-auto px-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2xl mb-2xl">
          <div className="col-span-1 md:col-span-2 space-y-lg">
            <AnimatedLogo size="md" />
            <p className="font-body-md text-on-surface-variant max-w-sm">
              The world's most versatile cloud-based coding playground. Build, run, and share code
              in 60+ languages with built-in AI assistance.
            </p>
            <div className="flex gap-md">
              {['facebook', 'twitter', 'github', 'discord'].map((icon) => (
                <button
                  key={icon}
                  className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all"
                >
                  <i className={`fab fa-${icon}`}></i>
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-label-caps text-label-caps text-on-surface mb-xl uppercase tracking-widest">
              Platform
            </h4>
            <ul className="space-y-md text-body-sm text-on-surface-variant">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/ide" className="hover:text-primary transition-colors">
                  Cloud IDE
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-primary transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-primary transition-colors">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-label-caps text-label-caps text-on-surface mb-xl uppercase tracking-widest">
              Connect
            </h4>
            <ul className="space-y-md text-body-sm text-on-surface-variant">
              <li>
                <Link to="/community" className="hover:text-primary transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-primary transition-colors">
                  Discord / Community
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-primary transition-colors">
                  Support & Help
                </Link>
              </li>
              <li>
                <Link to="/docs" className="hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-xl border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center gap-lg">
          <p className="text-xs text-on-surface-variant">
            © 2026 CodeX Cloud IDE. All rights reserved.
          </p>
          <div className="flex gap-xl text-xs text-on-surface-variant">
            <Link to="/docs" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link to="/docs" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
