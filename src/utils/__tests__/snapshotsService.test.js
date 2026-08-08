import {
  saveUserPreferences,
  getUserPreferences,
  createWorkspaceSnapshot,
  getWorkspaceSnapshots,
} from '../snapshotsService';
import { supabase } from '../../supabaseClient';

jest.mock('../../supabaseClient', () => ({
  __esModule: true,
  supabase: {
    from: jest.fn(),
  },
}));

describe('snapshotsService utility', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('saveUserPreferences should call upsert on user_preferences', async () => {
    const mockUpsert = jest.fn(() => Promise.resolve({ data: { success: true }, error: null }));
    supabase.from.mockReturnValue({ upsert: mockUpsert });

    await saveUserPreferences('user-1', { theme: 'dark', fontSize: 14 });
    expect(supabase.from).toHaveBeenCalledWith('user_preferences');
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        settings: { theme: 'dark', fontSize: 14 },
      })
    );
  });

  test('getUserPreferences should return user settings', async () => {
    const mockMaybeSingle = jest.fn(() =>
      Promise.resolve({ data: { settings: { theme: 'dracula' } }, error: null })
    );
    const mockEq = jest.fn(() => ({ maybeSingle: mockMaybeSingle }));
    const mockSelect = jest.fn(() => ({ eq: mockEq }));
    supabase.from.mockReturnValue({ select: mockSelect });

    const settings = await getUserPreferences('user-1');
    expect(settings).toEqual({ theme: 'dracula' });
  });

  test('createWorkspaceSnapshot should insert file snapshot into Supabase', async () => {
    const mockSelect = jest.fn(() => Promise.resolve({ data: [{ id: 'snap-1' }], error: null }));
    const mockInsert = jest.fn(() => ({ select: mockSelect }));
    supabase.from.mockReturnValue({ insert: mockInsert });

    const snap = await createWorkspaceSnapshot(
      'user-1',
      [{ name: 'index.js', content: 'code' }],
      'manual',
      'proj-1'
    );
    expect(supabase.from).toHaveBeenCalledWith('workspace_snapshots');
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-1',
        project_id: 'proj-1',
        tag: 'manual',
      })
    );
    expect(snap).toEqual({ id: 'snap-1' });
  });

  test('getWorkspaceSnapshots should fetch ordered snapshots list', async () => {
    const mockLimit = jest.fn(() =>
      Promise.resolve({ data: [{ id: 'snap-1' }, { id: 'snap-2' }], error: null })
    );
    const mockOrder = jest.fn(() => ({ limit: mockLimit }));
    const mockEq = jest.fn(() => ({ order: mockOrder }));
    const mockSelect = jest.fn(() => ({ eq: mockEq }));
    supabase.from.mockReturnValue({ select: mockSelect });

    const snapshots = await getWorkspaceSnapshots('user-1', 10);
    expect(snapshots).toHaveLength(2);
  });
});
