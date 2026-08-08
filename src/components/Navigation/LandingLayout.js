import React from 'react';
import LandingNavbar from './LandingNavbar';

const LandingLayout = ({ children, user, setShowAuthModal }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNavbar user={user} setShowAuthModal={setShowAuthModal} />
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default LandingLayout;
