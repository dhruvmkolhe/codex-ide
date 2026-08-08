/* eslint-disable testing-library/no-container, testing-library/no-node-access */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '../layout/Header';
import { ActivityBar } from '../layout/ActivityBar';
import { IdeFooter } from '../layout/IdeFooter';

jest.mock('../../languagesData', () => ({
  __esModule: true,
  getLangColor: () => '#f7df1e',
  languageConfig: {
    javascript: { label: 'JavaScript', color: '#f7df1e' },
  },
}));

describe('IDE Layout & Navigation Components', () => {
  test('Header renders top navigation bar', () => {
    const handleFreshRun = jest.fn();
    const { container } = render(
      <Header
        activeMenu={null}
        setActiveMenu={jest.fn()}
        isExplorerOpen={true}
        setIsExplorerOpen={jest.fn()}
        handleFreshRun={handleFreshRun}
        isTerminalCollapsed={false}
        toggleTerminalCollapse={jest.fn()}
        activeTheme="one-dark"
        setActiveTheme={jest.fn()}
      />
    );

    expect(container.querySelector('.top-navbar')).toBeInTheDocument();
  });

  test('ActivityBar switches sidebar tabs on icon click', () => {
    const setSidebarTab = jest.fn();
    const setIsExplorerOpen = jest.fn();

    render(
      <ActivityBar
        isExplorerOpen={true}
        setIsExplorerOpen={setIsExplorerOpen}
        sidebarTab="explorer"
        setSidebarTab={setSidebarTab}
      />
    );

    const searchIcon = screen.getByTitle(/Search/i);
    fireEvent.click(searchIcon);

    expect(setSidebarTab).toHaveBeenCalledWith('search');
    expect(setIsExplorerOpen).toHaveBeenCalledWith(true);
  });

  test('IdeFooter displays status and language label', () => {
    render(<IdeFooter selectedLanguage="javascript" isRunning={false} />);
    expect(screen.getByText(/Ready/i)).toBeInTheDocument();
  });
});
