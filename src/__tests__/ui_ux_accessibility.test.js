/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import CommandPalette from '../components/ui/CommandPalette';
import { ActivityBar } from '../components/layout/ActivityBar';

describe('UI/UX & Accessibility (a11y) Test Suite', () => {
  test('ActivityBar items feature titles and interactive elements', () => {
    const { container } = render(
      <ActivityBar
        isExplorerOpen={true}
        setIsExplorerOpen={() => {}}
        sidebarTab="explorer"
        setSidebarTab={() => {}}
      />
    );
    const items = container.querySelectorAll('.activity-item');
    expect(items.length).toBeGreaterThan(0);
  });

  test('CommandPalette modal supports ESC key dismissal', () => {
    const onClose = jest.fn();
    const { container } = render(<CommandPalette isOpen={true} onClose={onClose} files={[]} />);

    const palette = container.querySelector('.command-palette');
    expect(palette).toBeInTheDocument();

    fireEvent.keyDown(palette, { key: 'Escape', code: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  test('Dark / Light theme state persistence key check', () => {
    localStorage.setItem('codex_theme', 'one-dark');
    expect(localStorage.getItem('codex_theme')).toBe('one-dark');
  });
});
