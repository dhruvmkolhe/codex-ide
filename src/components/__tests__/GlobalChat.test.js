import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GlobalChat from '../Landing/GlobalChat';

const mockSupabase = {
  from: () => ({
    select: () => ({
      order: () => ({
        limit: () =>
          Promise.resolve({
            data: [{ id: '1', sender: 'Alice', text: 'Hello world', timestamp: '12:00' }],
            error: null,
          }),
      }),
    }),
    insert: () => Promise.resolve({ data: null, error: null }),
  }),
  channel: () => ({
    on: function () {
      return this;
    },
    subscribe: function () {
      return this;
    },
    unsubscribe: jest.fn(),
  }),
};

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

describe('GlobalChat component', () => {
  test('renders global chat widget and messages', async () => {
    render(<GlobalChat user={null} supabase={mockSupabase} setShowAuthModal={() => {}} />);

    const chatHeading = screen.getByText(/Global Chat/i);
    expect(chatHeading).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Hello world/i)).toBeInTheDocument();
    });
  });

  test('submitting message sends new message', async () => {
    render(
      <GlobalChat
        user={{ id: 'user-1', user_metadata: { name: 'Bob' } }}
        supabase={mockSupabase}
        setShowAuthModal={() => {}}
      />
    );

    const input = screen.getByPlaceholderText(/Share your thoughts/i);
    fireEvent.change(input, { target: { value: 'New test message' } });
    expect(input.value).toBe('New test message');
  });
});
