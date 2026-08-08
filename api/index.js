const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const { z } = require('zod');
const { createClient } = require('@supabase/supabase-js');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const redis = require('redis');

const app = express();

// Caching System (Redis with Local Fallback)
// Note: On Vercel, Local In-Memory cache is not shared across instances.
class LocalCache {
  constructor() {
    this.cache = new Map();
    console.log('CodeX Proxy: Local In-Memory cache initialized');
  }
  async get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }
  async setEx(key, ttlSeconds, value) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttlSeconds * 1000)
    });
  }
  get isReady() { return true; }
}

const localCache = new LocalCache();
let redisClient = null;
let activeCache = localCache;

// Connect to Redis if URL is provided
(async () => {
  if (process.env.REDIS_URL) {
    try {
      const client = redis.createClient({ url: process.env.REDIS_URL });
      client.on('error', (err) => {
        console.log('Redis unavailable, using local cache:', err.message);
        activeCache = localCache;
      });
      await client.connect();
      redisClient = client;
      activeCache = redisClient;
      console.log('CodeX Proxy: Connected to Redis');
    } catch (err) {
      console.log('CodeX Proxy: Redis connection failed, falling back to local cache.', err.message);
      activeCache = localCache;
    }
  }
})();

// Initialize Supabase Client for token verification
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Zod Schemas
const chatSchema = z.object({
  model: z.string().min(1),
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string().min(1)
  })).min(1),
  max_tokens: z.number().optional().default(1024),
  stop: z.union([z.string(), z.array(z.string())]).optional(),
  temperature: z.number().optional().default(0.7)
});

const runSchema = z.object({
  language: z.string().min(1),
  stdin: z.string().optional().default(''),
  files: z.array(z.object({
    name: z.string().min(1),
    content: z.string().default('')
  })).min(1)
});

// Security Audit Logger Helper
const logSecurityEvent = async (action, req, metadata = {}) => {
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const userId = req.user?.id || 'anonymous';

  console.log(`[SECURITY AUDIT] ${new Date().toISOString()} | Action: ${action} | User: ${userId} | IP: ${ip}`);

  if (supabase) {
    try {
      await supabase.from('audit_log').insert([
        {
          user_id: userId !== 'anonymous' ? userId : null,
          action,
          metadata: { ...metadata, ip, userAgent, path: req.originalUrl || req.url },
          created_at: new Date().toISOString()
        }
      ]);
    } catch (err) {
      /* ignore audit DB log failure */
    }
  }
};

// Authentication Middleware
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logSecurityEvent('AUTH_FAILURE_MISSING_TOKEN', req);
    return res.status(401).json({ error: 'Missing or malformed Authorization header.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      logSecurityEvent('AUTH_FAILURE_INVALID_TOKEN', req);
      return res.status(401).json({ error: 'Invalid or expired session token.' });
    }
    req.user = user;
    next();
  } catch (err) {
    logSecurityEvent('AUTH_FAILURE_EXCEPTION', req);
    res.status(401).json({ error: 'Authentication failed.' });
  }
};

const authenticateOptional = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = { id: 'guest', email: 'guest@codex.local' };
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (token === 'guest') {
    req.user = { id: 'guest', email: 'guest@codex.local' };
    return next();
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);
    if (error || !user) {
      req.user = { id: 'guest', email: 'guest@codex.local' };
      return next();
    }
    req.user = user;
    next();
  } catch (err) {
    req.user = { id: 'guest', email: 'guest@codex.local' };
    next();
  }
};

const validateRequest = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid request body.', details: err.errors });
  }
};

app.use(helmet());
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5001', 'http://localhost:8080'];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '1mb' }));

const rateLimitKeyGenerator = (req) => {
  const ip =
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.ip ||
    req.socket?.remoteAddress ||
    '127.0.0.1';
  if (req.user && req.user.id) {
    if (req.user.id === 'guest') return `guest:${ip}`;
    return `user:${req.user.id}`;
  }
  return `ip:${ip}`;
};

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  keyGenerator: rateLimitKeyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 15,
  keyGenerator: rateLimitKeyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI rate limit exceeded. Please wait a minute before sending more prompts.' },
});

const runLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 15,
  keyGenerator: rateLimitKeyGenerator,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Execution rate limit exceeded. Please wait a minute before running code again.',
  },
});

app.use('/api/', authenticateOptional);
app.use('/api/', apiLimiter);

// AI Chat Proxy
app.post(
  '/api/ai/chat',
  authenticate,
  aiLimiter,
  validateRequest(chatSchema),
  async (req, res) => {
  const { model, messages, max_tokens, stop, temperature } = req.body;
  
  const groqApiKey = req.headers['x-groq-api-key'] || process.env.GROQ_API_KEY;
  const openrouterApiKey = req.headers['x-openrouter-api-key'] || process.env.OPENROUTER_API_KEY;
  const geminiApiKey = req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY;

  if (!groqApiKey && !openrouterApiKey && !geminiApiKey) {
    return res.status(500).json({ error: 'AI service configuration error.' });
  }

  try {
    let apiUrl = '';
    let apiKey = '';
    let payload = { model, messages, max_tokens, stop, temperature };
    let headers = { 'Content-Type': 'application/json' };

    if (model.startsWith('gemini') || model.startsWith('gemma')) {
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiApiKey}`;
      const contents = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));
      const systemMessage = messages.find(m => m.role === 'system');
      payload = { contents };
      if (systemMessage) {
        payload.systemInstruction = { parts: [{ text: systemMessage.content }] };
      }
      const response = await axios.post(apiUrl, payload, { headers });
      const parts = response.data?.candidates?.[0]?.content?.parts || [];
      const replyText = parts.filter(p => !p.thought).map(p => p.text).join('') || (parts[0]?.text || '');
      return res.json({ choices: [{ message: { role: 'assistant', content: replyText } }] });
    } else if (model.includes('/') || model.includes(':')) {
      apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
      apiKey = openrouterApiKey;
    } else {
      apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
      apiKey = groqApiKey;
    }

    headers['Authorization'] = `Bearer ${apiKey}`;
    const response = await axios.post(apiUrl, payload, { headers });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: 'AI request failed.' });
  }
});

// Code Execution Validation Middleware
const validateCodeExecution = (req, res, next) => {
  const { files, stdin, language } = req.body;
  
  if (!files || !Array.isArray(files)) {
    return res.status(400).json({ error: 'Invalid files array' });
  }
  
  if (files.length === 0) {
    return res.status(400).json({ error: 'At least one file is required' });
  }
  
  if (files.length > 10) {
    logSecurityEvent('CODE_EXECUTION_FILE_LIMIT_EXCEEDED', req, { fileCount: files.length });
    return res.status(400).json({ error: 'Maximum 10 files allowed per execution' });
  }
  
  let totalSize = 0;
  for (const file of files) {
    if (!file.name || typeof file.name !== 'string') {
      return res.status(400).json({ error: 'Each file must have a valid name' });
    }
    
    if (file.name.length > 255) {
      return res.status(400).json({ error: 'File name too long (max 255 characters)' });
    }
    
    if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
      logSecurityEvent('CODE_EXECUTION_PATH_TRAVERSAL_ATTEMPT', req, { fileName: file.name });
      return res.status(400).json({ error: 'Invalid file name: path traversal detected' });
    }
    
    const content = file.content || '';
    totalSize += content.length;
  }
  
  const stdinContent = stdin || '';
  totalSize += stdinContent.length;
  
  const MAX_PAYLOAD_SIZE = 1024 * 1024;
  if (totalSize > MAX_PAYLOAD_SIZE) {
    logSecurityEvent('CODE_EXECUTION_SIZE_LIMIT_EXCEEDED', req, { 
      totalSize, 
      maxSize: MAX_PAYLOAD_SIZE,
      language 
    });
    return res.status(413).json({ 
      error: `Payload too large. Maximum ${MAX_PAYLOAD_SIZE} bytes allowed, got ${totalSize} bytes` 
    });
  }
  
  const dangerousPatterns = [
    { pattern: /while\s*\(\s*true\s*\)/gi, description: 'infinite while loop' },
    { pattern: /while\s+true\b/gi, description: 'infinite while loop' },
    { pattern: /while\s*\(\s*1\s*\)/gi, description: 'infinite while(1) loop' },
    { pattern: /while\s+1\b/gi, description: 'infinite while 1 loop' },
    { pattern: /for\s*\(\s*;\s*;\s*\)/gi, description: 'infinite for loop' },
    { pattern: /fork\s*\(/gi, description: 'fork() system call' },
    { pattern: /exec\s*\(/gi, description: 'exec() system call' },
    { pattern: /system\s*\(/gi, description: 'system() call' },
    { pattern: /eval\s*\(/gi, description: 'eval() function' },
  ];
  
  for (const file of files) {
    const content = file.content || '';
    for (const { pattern, description } of dangerousPatterns) {
      if (pattern.test(content)) {
        logSecurityEvent('CODE_EXECUTION_DANGEROUS_PATTERN', req, { 
          fileName: file.name,
          pattern: description,
          language 
        });
        return res.status(400).json({ 
          error: `Potentially dangerous code detected: ${description}`,
          hint: 'Please remove infinite loops or dangerous system calls'
        });
      }
    }
  }
  
  const allowedLanguages = [
    'javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'go', 'rust',
    'php', 'ruby', 'swift', 'kotlin', 'typescript', 'r', 'scala', 'perl',
    'bash', 'html', 'css', 'sql', 'mongodb', 'mysql', 'postgresql'
  ];
  
  if (language && !allowedLanguages.includes(language.toLowerCase())) {
    logSecurityEvent('CODE_EXECUTION_INVALID_LANGUAGE', req, { language });
    return res.status(400).json({ 
      error: `Unsupported language: ${language}`,
      allowedLanguages 
    });
  }
  
  next();
};

// Code Execution Proxy
app.post('/api/run', authenticate, runLimiter, validateRequest(runSchema), validateCodeExecution, async (req, res) => {
  const compilerApiKey = req.headers['x-onecompiler-api-key'] || process.env.ONECOMPILER_API_KEY;

  if (!compilerApiKey) {
    return res.status(500).json({ error: 'Execution service configuration error.' });
  }

  try {
    let cacheKey = null;
    let isCacheReady = activeCache && (activeCache.isReady || activeCache === localCache);

    if (isCacheReady) {
      cacheKey = 'run:' + crypto.createHash('sha256').update(JSON.stringify(req.body)).digest('hex');
      try {
        const cachedResponse = await activeCache.get(cacheKey);
        if (cachedResponse) return res.json(JSON.parse(cachedResponse));
      } catch (err) {
        console.error('Cache read error:', err.message);
      }
    }

    const isDirectKey = compilerApiKey.startsWith('oc_');
    const url = isDirectKey ? 'https://api.onecompiler.com/v1/run' : 'https://onecompiler-apis.p.rapidapi.com/api/v1/run';
    const headers = isDirectKey
      ? { 'X-API-Key': compilerApiKey, 'Content-Type': 'application/json' }
      : { 'X-RapidAPI-Key': compilerApiKey, 'X-RapidAPI-Host': 'onecompiler-apis.p.rapidapi.com', 'Content-Type': 'application/json' };

    const response = await axios.post(url, req.body, { headers });
    
    if (isCacheReady && cacheKey && response.data) {
      try {
        await activeCache.setEx(cacheKey, 86400, JSON.stringify(response.data));
      } catch(err) {
        console.error('Cache write error:', err.message);
      }
    }

    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Execution failed.' });
  }
});

// ═══════════════════════════════════════════════════════════════
// PROJECT MANAGEMENT ENDPOINTS (IDOR Prevention)
// ═══════════════════════════════════════════════════════════════

app.get('/api/projects', authenticate, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('user_projects')
      .select('id, name, language, updated_at')
      .eq('user_id', req.user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Fetch projects error:', error);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }

    logSecurityEvent('PROJECTS_FETCHED', req, { count: data?.length || 0 });
    res.json({ projects: data || [] });
  } catch (err) {
    console.error('Projects fetch exception:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/projects/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('user_projects')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !data) {
      logSecurityEvent('PROJECT_ACCESS_DENIED', req, { projectId: id });
      return res.status(404).json({ error: 'Project not found' });
    }

    logSecurityEvent('PROJECT_ACCESSED', req, { projectId: id });
    res.json({ project: data });
  } catch (err) {
    console.error('Project fetch exception:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/projects', authenticate, async (req, res) => {
  const { name, content, language } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ error: 'Project name is required' });
  }
  if (name.length > 255) {
    return res.status(400).json({ error: 'Project name too long (max 255 characters)' });
  }
  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'Project content is required' });
  }
  if (content.length > 10 * 1024 * 1024) {
    return res.status(413).json({ error: 'Project content too large (max 10MB)' });
  }
  if (!language || typeof language !== 'string') {
    return res.status(400).json({ error: 'Language is required' });
  }

  try {
    const { data, error } = await supabase
      .from('user_projects')
      .insert([{
        user_id: req.user.id,
        name: name.trim(),
        content,
        language,
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Project creation error:', error);
      return res.status(500).json({ error: 'Failed to create project' });
    }

    logSecurityEvent('PROJECT_CREATED', req, { projectId: data.id, name: data.name });
    res.status(201).json({ project: data });
  } catch (err) {
    console.error('Project creation exception:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/projects/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { name, content, language } = req.body;

  try {
    const { data: existing } = await supabase
      .from('user_projects')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== req.user.id) {
      logSecurityEvent('PROJECT_UPDATE_DENIED', req, { projectId: id });
      return res.status(404).json({ error: 'Project not found' });
    }

    const updates = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = name.trim();
    if (content !== undefined) updates.content = content;
    if (language !== undefined) updates.language = language;

    const { data, error } = await supabase
      .from('user_projects')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Project update error:', error);
      return res.status(500).json({ error: 'Failed to update project' });
    }

    logSecurityEvent('PROJECT_UPDATED', req, { projectId: id });
    res.json({ project: data });
  } catch (err) {
    console.error('Project update exception:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/projects/:id', authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const { data: existing } = await supabase
      .from('user_projects')
      .select('user_id, name')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== req.user.id) {
      logSecurityEvent('PROJECT_DELETE_DENIED', req, { projectId: id });
      return res.status(404).json({ error: 'Project not found' });
    }

    const { error } = await supabase
      .from('user_projects')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Project deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete project' });
    }

    logSecurityEvent('PROJECT_DELETED', req, { projectId: id, name: existing.name });
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Project deletion exception:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Centralized Error Handling Middleware (Prevents stack trace leaks - VULN-024)
app.use((err, req, res, next) => {
  console.error('Unhandled API error:', err);
  if (typeof logSecurityEvent === 'function') {
    logSecurityEvent('UNHANDLED_API_ERROR', req, { message: err.message });
  }
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    error: isProduction ? 'Internal server error' : (err.message || 'Server error')
  });
});

// Export for Vercel
module.exports = app;
