import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConsoleSection } from '../terminal/ConsoleSection';

describe('Editor & Terminal Components', () => {
  test('ConsoleSection renders execution logs and clear button', () => {
    const consoleOutput = 'Program Output Line 1\nError warning line';
    const onClear = jest.fn();

    render(
      <ConsoleSection
        consoleOutput={consoleOutput}
        handleClearConsole={onClear}
        isRunning={false}
      />
    );

    expect(screen.getByText(/Program Output Line 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Error warning line/i)).toBeInTheDocument();

    const clearBtn = screen.getByRole('button', { name: /Clear/i });
    fireEvent.click(clearBtn);
    expect(onClear).toHaveBeenCalled();
  });
});
