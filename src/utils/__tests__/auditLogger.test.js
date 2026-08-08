import { auditLog } from '../auditLogger';
import { supabase } from '../../supabaseClient';

jest.mock('../../supabaseClient', () => ({
  __esModule: true,
  supabase: {
    from: jest.fn(() => ({
      insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
  },
}));

describe('auditLogger utility', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('auditLog should insert record into audit_log table', async () => {
    const mockInsert = jest.fn(() => Promise.resolve({ data: null, error: null }));
    supabase.from.mockReturnValue({ insert: mockInsert });

    await auditLog('login', 'user-123', { ip: '127.0.0.1' });

    expect(supabase.from).toHaveBeenCalledWith('audit_log');
    expect(mockInsert).toHaveBeenCalledWith([
      expect.objectContaining({
        user_id: 'user-123',
        action: 'login',
        metadata: expect.objectContaining({
          ip: '127.0.0.1',
          userAgent: expect.any(String),
          timestamp: expect.any(String),
        }),
      }),
    ]);
  });

  test('auditLog should return early if userId is missing', async () => {
    await auditLog('login', null);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  test('auditLog should catch errors silently and not throw', async () => {
    supabase.from.mockImplementationOnce(() => {
      throw new Error('Database connection offline');
    });

    await expect(auditLog('delete_file', 'user-123')).resolves.not.toThrow();
  });
});
