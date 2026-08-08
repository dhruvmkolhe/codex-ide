import React from 'react';
import { render, screen } from '@testing-library/react';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { ErrorBoundary } from '../ErrorBoundary';
import RemoteCursor from '../collaboration/RemoteCursor';

describe('AI Chat & Collaboration Components', () => {
  test('MarkdownRenderer parses code blocks and text formatting', () => {
    const content = '### Markdown Title\n```js\nconst x = 10;\n```';
    render(<MarkdownRenderer content={content} />);

    expect(screen.getByText(/Markdown Title/i)).toBeInTheDocument();
    expect(screen.getByText(/const x = 10;/i)).toBeInTheDocument();
  });

  test('RemoteCursor renders peer user label with assigned color tag', () => {
    render(<RemoteCursor name="Alice" color="#ff0000" x={100} y={200} />);

    const label = screen.getByText('Alice');
    expect(label).toBeInTheDocument();
  });

  test('ErrorBoundary catches React component crashes and shows recovery button', () => {
    const ProblemChild = () => {
      throw new Error('Test Component Crash');
    };

    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/Reload App/i)).toBeInTheDocument();

    spy.mockRestore();
  });
});
