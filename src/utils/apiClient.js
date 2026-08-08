/**
 * apiClient.js
 * Secure API client for making authenticated requests to backend
 * All requests include proper authentication headers
 */

import { supabase } from '../supabaseClient';

/**
 * Get current auth token
 * @returns {Promise<string|null>} JWT token or null
 */
async function getAuthToken() {
  if (!supabase) return null;

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token || null;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
}

/**
 * Make authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/api/projects')
 * @param {object} options - Fetch options
 * @returns {Promise<Response>}
 */
async function apiRequest(endpoint, options = {}) {
  const token = await getAuthToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  return response;
}

/**
 * GET request
 */
export async function apiGet(endpoint) {
  const response = await apiRequest(endpoint, { method: 'GET' });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * POST request
 */
export async function apiPost(endpoint, data) {
  const response = await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * PUT request
 */
export async function apiPut(endpoint, data) {
  const response = await apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * DELETE request
 */
export async function apiDelete(endpoint) {
  const response = await apiRequest(endpoint, { method: 'DELETE' });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ═══════════════════════════════════════════════════════════════
// PROJECT MANAGEMENT API
// ═══════════════════════════════════════════════════════════════

export const projectsApi = {
  /**
   * Get all projects for current user
   */
  async getAll() {
    const data = await apiGet('/api/projects');
    return data.projects || [];
  },

  /**
   * Get project by ID
   */
  async getById(id) {
    const data = await apiGet(`/api/projects/${id}`);
    return data.project;
  },

  /**
   * Create new project
   */
  async create(project) {
    const data = await apiPost('/api/projects', project);
    return data.project;
  },

  /**
   * Update existing project
   */
  async update(id, updates) {
    const data = await apiPut(`/api/projects/${id}`, updates);
    return data.project;
  },

  /**
   * Delete project
   */
  async delete(id) {
    return await apiDelete(`/api/projects/${id}`);
  },
};

// ═══════════════════════════════════════════════════════════════
// CHAT SESSION API
// ═══════════════════════════════════════════════════════════════

export const chatSessionsApi = {
  /**
   * Get all chat sessions for current user
   */
  async getAll() {
    const data = await apiGet('/api/chat-sessions');
    return data.sessions || [];
  },

  /**
   * Get chat session by ID
   */
  async getById(id) {
    const data = await apiGet(`/api/chat-sessions/${id}`);
    return data.session;
  },

  /**
   * Delete chat session
   */
  async delete(id) {
    return await apiDelete(`/api/chat-sessions/${id}`);
  },
};
