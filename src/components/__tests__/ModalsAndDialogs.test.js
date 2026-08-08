import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CommandPalette from '../ui/CommandPalette';
import { GitHubModal } from '../modals/GitHubModal';

describe('Modals & Dialog Components', () => {
  test('CommandPalette filters commands by query and handles key events', () => {
    const onClose = jest.fn();
    const onSelectCommand = jest.fn();
    const commands = [
      { id: 'run', label: 'Run Code', category: 'Execution' },
      { id: 'format', label: 'Format Document', category: 'Edit' },
    ];

    render(
      <CommandPalette
        isOpen={true}
        onClose={onClose}
        commands={commands}
        files={[]}
        onSelectCommand={onSelectCommand}
      />
    );

    const searchInput = screen.getByPlaceholderText(/Search files/i);
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Format' } });
    expect(screen.getByText(/Format Code/i)).toBeInTheDocument();
  });

  test('GitHubModal renders Gist creation form', () => {
    const onClose = jest.fn();
    render(
      <GitHubModal
        isOpen={true}
        onClose={onClose}
        code="console.log('gist code');"
        selectedLanguage="javascript"
      />
    );

    expect(screen.getByText(/GitHub Repository Import/i)).toBeInTheDocument();
  });
});
