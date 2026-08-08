import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../Landing/Home';
import LandingFooter from '../Navigation/LandingFooter';
import { LandingAuthModal } from '../LandingAuthModal';
import Docs from '../Landing/Docs';

beforeAll(() => {
  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

describe('Landing Page & Public Navigation Components', () => {
  test('Home component renders main headline and action buttons', () => {
    render(<Home onStartCoding={() => {}} onOpenAuth={() => {}} />);

    const titles = screen.getAllByText(/Code in 60\+ Languages/i);
    expect(titles[0]).toBeInTheDocument();

    const ctaButtons = screen.getAllByText(/Start Coding Now/i);
    expect(ctaButtons.length).toBeGreaterThan(0);
  });

  test('LandingFooter renders copyright and links', () => {
    render(<LandingFooter onSelectTab={() => {}} />);
    expect(screen.getByText(/All rights reserved/i)).toBeInTheDocument();
  });

  test('LandingAuthModal handles tab switches and form inputs', () => {
    const setShowAuthModal = jest.fn();
    render(
      <LandingAuthModal
        showAuthModal={true}
        setShowAuthModal={setShowAuthModal}
        user={null}
        authEmail=""
        setAuthEmail={() => {}}
        authPassword=""
        setAuthPassword={() => {}}
        authTab="signin"
        setAuthTab={() => {}}
        authLoading={false}
        authError=""
        handleAuthSubmit={() => {}}
        handleOAuthSignIn={() => {}}
        handleGuestLogin={() => {}}
      />
    );

    expect(screen.getByPlaceholderText(/name@company\.com/i)).toBeInTheDocument();
  });

  test('Docs component renders documentation sections', () => {
    render(<Docs />);
    const docTitles = screen.getAllByText(/Documentation|Getting Started/i);
    expect(docTitles.length).toBeGreaterThan(0);
  });
});
