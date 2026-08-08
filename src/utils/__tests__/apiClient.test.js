/* eslint-disable testing-library/no-await-sync-query */
import { apiGet, apiPost, apiPut, apiDelete, projectsApi, chatSessionsApi } from '../apiClient';
import { supabase } from '../../supabaseClient';

jest.mock('../../supabaseClient', () => ({
  __esModule: true,
  supabase: {
    auth: {
      getSession: jest.fn(),
    },
  },
}));

describe('apiClient utility', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: 'mock-jwt-token' } },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('apiGet should send GET request with Bearer authorization', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'success', data: [1, 2, 3] }),
    });

    const data = await apiGet('/api/test');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-jwt-token',
          'Content-Type': 'application/json',
        }),
      })
    );
    expect(data).toEqual({ status: 'success', data: [1, 2, 3] });
  });

  test('apiPost should send POST request with JSON body', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '123' }),
    });

    const data = await apiPost('/api/items', { name: 'New Item' });
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/items',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'New Item' }),
      })
    );
    expect(data).toEqual({ id: '123' });
  });

  test('apiPut should send PUT request and handle response error', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Invalid data' }),
    });

    await expect(apiPut('/api/items/1', { name: '' })).rejects.toThrow('Invalid data');
  });

  test('apiDelete should send DELETE request', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ deleted: true }),
    });

    const res = await apiDelete('/api/items/1');
    expect(res).toEqual({ deleted: true });
  });

  test('projectsApi should invoke CRUD functions', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ projects: [{ id: 'p1' }], project: { id: 'p1' }, success: true }),
    });

    const all = await projectsApi.getAll();
    expect(all).toEqual([{ id: 'p1' }]);

    const single = await projectsApi.getById('p1');
    expect(single).toEqual({ id: 'p1' });

    const created = await projectsApi.create({ name: 'Proj' });
    expect(created).toEqual({ id: 'p1' });

    const updated = await projectsApi.update('p1', { name: 'Updated' });
    expect(updated).toEqual({ id: 'p1' });

    const deleted = await projectsApi.delete('p1');
    expect(deleted).toBeDefined();
  });

  test('chatSessionsApi should retrieve and delete sessions', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ sessions: [{ id: 's1' }], session: { id: 's1' }, success: true }),
    });

    const sessions = await chatSessionsApi.getAll();
    expect(sessions).toEqual([{ id: 's1' }]);

    const session = await chatSessionsApi.getById('s1');
    expect(session).toEqual({ id: 's1' });

    const res = await chatSessionsApi.delete('s1');
    expect(res).toBeDefined();
  });
});
