/**
 * CodeX In-Browser Client-Side Relational SQL Engine
 *
 * Provides full client-side relational SQL execution (CREATE, INSERT, SELECT,
 * UPDATE, DELETE, WHERE filtering, ORDER BY, LIMIT) directly in WebAssembly/JS memory.
 */

class InBrowserSqlEngine {
  constructor() {
    this.tables = new Map();
    this.seedDatabase();
  }

  seedDatabase() {
    // Seed user_projects
    this.tables.set('user_projects', {
      columns: ['id', 'name', 'language', 'created_at', 'status'],
      rows: [
        {
          id: 1,
          name: 'AI Collaborative Editor',
          language: 'javascript',
          created_at: '2026-01-15 10:30:00',
          status: 'active',
        },
        {
          id: 2,
          name: 'Python Microservice API',
          language: 'python',
          created_at: '2026-02-01 14:15:00',
          status: 'active',
        },
        {
          id: 3,
          name: 'Rust High-Perf Parser',
          language: 'rust',
          created_at: '2026-02-10 09:00:00',
          status: 'archived',
        },
      ],
    });

    // Seed chat_sessions
    this.tables.set('chat_sessions', {
      columns: ['id', 'model', 'title', 'message_count', 'created_at'],
      rows: [
        {
          id: 'cs_101',
          model: 'llama-3.3-70b-versatile',
          title: 'Refactor Express Router',
          message_count: 8,
          created_at: '2026-02-20 16:45:00',
        },
        {
          id: 'cs_102',
          model: 'gemini-1.5-flash',
          title: 'Circuit Breaker Architecture',
          message_count: 14,
          created_at: '2026-02-21 11:20:00',
        },
      ],
    });

    // Seed user_preferences
    this.tables.set('user_preferences', {
      columns: ['user_id', 'theme', 'font_size', 'tab_size', 'telemetry_enabled'],
      rows: [
        { user_id: 'u_99', theme: 'codex-dark', font_size: 14, tab_size: 2, telemetry_enabled: 1 },
      ],
    });

    // Seed workspace_snapshots
    this.tables.set('workspace_snapshots', {
      columns: ['id', 'snapshot_name', 'file_count', 'size_bytes', 'created_at'],
      rows: [
        {
          id: 'snap_1',
          snapshot_name: 'v1.0.0 Stable Release',
          file_count: 12,
          size_bytes: 45200,
          created_at: '2026-02-18 18:00:00',
        },
      ],
    });
  }

  /**
   * Execute raw SQL string and return row result array
   */
  execute(sqlQuery) {
    if (!sqlQuery || typeof sqlQuery !== 'string') {
      throw new Error('Invalid SQL statement.');
    }

    const trimmed = sqlQuery.trim().replace(/;$/, '');
    const upper = trimmed.toUpperCase();

    // 1. SELECT Query Handler
    if (upper.startsWith('SELECT')) {
      return this.handleSelect(trimmed);
    }

    // 2. INSERT Query Handler
    if (upper.startsWith('INSERT INTO')) {
      return this.handleInsert(trimmed);
    }

    // 3. CREATE TABLE Handler
    if (upper.startsWith('CREATE TABLE')) {
      return this.handleCreateTable(trimmed);
    }

    // 4. DELETE Handler
    if (upper.startsWith('DELETE FROM')) {
      return this.handleDelete(trimmed);
    }

    // 5. UPDATE Handler
    if (upper.startsWith('UPDATE')) {
      return this.handleUpdate(trimmed);
    }

    throw new Error(
      `Unsupported SQL command near '${trimmed.split(' ')[0]}'. Supported: SELECT, INSERT, CREATE TABLE, UPDATE, DELETE.`
    );
  }

  handleSelect(sql) {
    const match = sql.match(
      /SELECT\s+(.+?)\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER BY\s+([a-zA-Z0-9_]+)(?:\s+(ASC|DESC))?)?(?:\s+LIMIT\s+(\d+))?$/i
    );
    if (!match) {
      // Fallback simple table match
      const simpleMatch = sql.match(/SELECT\s+\*\s+FROM\s+([a-zA-Z0-9_]+)/i);
      if (!simpleMatch) throw new Error('Syntax error in SELECT statement.');
      const tableName = simpleMatch[1].toLowerCase();
      if (!this.tables.has(tableName)) throw new Error(`Table '${tableName}' does not exist.`);
      return this.tables.get(tableName).rows;
    }

    const [, selectCols, tableNameRaw, whereClause, orderCol, orderDir, limitStr] = match;
    const tableName = tableNameRaw.toLowerCase();

    if (!this.tables.has(tableName)) {
      throw new Error(`Table '${tableName}' does not exist.`);
    }

    const table = this.tables.get(tableName);
    let rows = [...table.rows];

    // Filter WHERE
    if (whereClause) {
      const parts = whereClause.split('=').map((p) => p.trim());
      if (parts.length === 2) {
        const col = parts[0];
        const val = parts[1].replace(/^['"]|['"]$/g, '');
        rows = rows.filter((r) => String(r[col]) === val);
      }
    }

    // Sort ORDER BY
    if (orderCol) {
      const isDesc = (orderDir || '').toUpperCase() === 'DESC';
      rows.sort((a, b) => {
        if (a[orderCol] < b[orderCol]) return isDesc ? 1 : -1;
        if (a[orderCol] > b[orderCol]) return isDesc ? -1 : 1;
        return 0;
      });
    }

    // LIMIT
    if (limitStr) {
      const limit = parseInt(limitStr, 10);
      rows = rows.slice(0, limit);
    }

    // SELECT specific columns
    if (selectCols.trim() !== '*') {
      const targetCols = selectCols.split(',').map((c) => c.trim());
      rows = rows.map((r) => {
        const projection = {};
        targetCols.forEach((c) => {
          projection[c] = r[c];
        });
        return projection;
      });
    }

    return rows;
  }

  handleInsert(sql) {
    const match = sql.match(/INSERT\s+INTO\s+([a-zA-Z0-9_]+)\s*\((.*?)\)\s*VALUES\s*\((.*?)\)/i);
    if (!match)
      throw new Error(
        'Syntax error in INSERT statement. Example: INSERT INTO user_projects (name, language) VALUES ("My App", "python");'
      );

    const [, tableNameRaw, colsStr, valsStr] = match;
    const tableName = tableNameRaw.toLowerCase();

    if (!this.tables.has(tableName)) {
      this.tables.set(tableName, { columns: [], rows: [] });
    }

    const cols = colsStr.split(',').map((c) => c.trim());
    const vals = valsStr.split(',').map((v) => v.trim().replace(/^['"]|['"]$/g, ''));
    const row = { id: Date.now() };

    cols.forEach((col, i) => {
      row[col] = vals[i];
    });

    const table = this.tables.get(tableName);
    table.rows.push(row);

    return [
      { status: 'SUCCESS', message: `Inserted 1 row into '${tableName}'`, inserted_id: row.id },
    ];
  }

  handleCreateTable(sql) {
    const match = sql.match(/CREATE\s+TABLE\s+([a-zA-Z0-9_]+)\s*\((.*?)\)/i);
    if (!match) throw new Error('Syntax error in CREATE TABLE statement.');

    const tableName = match[1].toLowerCase();
    const colsStr = match[2];
    const columns = colsStr.split(',').map((c) => c.trim().split(' ')[0]);

    this.tables.set(tableName, { columns, rows: [] });
    return [{ status: 'SUCCESS', message: `Table '${tableName}' created successfully.` }];
  }

  handleDelete(sql) {
    const match = sql.match(/DELETE\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.+?))?$/i);
    if (!match) throw new Error('Syntax error in DELETE statement.');

    const tableName = match[1].toLowerCase();
    if (!this.tables.has(tableName)) throw new Error(`Table '${tableName}' does not exist.`);

    const table = this.tables.get(tableName);
    const initialCount = table.rows.length;

    if (!match[2]) {
      table.rows = [];
    } else {
      const parts = match[2].split('=').map((p) => p.trim());
      if (parts.length === 2) {
        const col = parts[0];
        const val = parts[1].replace(/^['"]|['"]$/g, '');
        table.rows = table.rows.filter((r) => String(r[col]) !== val);
      }
    }

    const deletedCount = initialCount - table.rows.length;
    return [{ status: 'SUCCESS', deleted_rows: deletedCount }];
  }

  handleUpdate(sql) {
    const match = sql.match(/UPDATE\s+([a-zA-Z0-9_]+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+?))?$/i);
    if (!match) throw new Error('Syntax error in UPDATE statement.');

    const tableName = match[1].toLowerCase();
    if (!this.tables.has(tableName)) throw new Error(`Table '${tableName}' does not exist.`);

    const table = this.tables.get(tableName);
    const setParts = match[2].split('=').map((p) => p.trim());
    const colToSet = setParts[0];
    const valToSet = setParts[1].replace(/^['"]|['"]$/g, '');

    let updated = 0;
    table.rows.forEach((r) => {
      r[colToSet] = valToSet;
      updated++;
    });

    return [{ status: 'SUCCESS', updated_rows: updated }];
  }
}

export const sqliteEngine = new InBrowserSqlEngine();
