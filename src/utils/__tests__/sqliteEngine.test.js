import { sqliteEngine } from '../sqliteEngine';

describe('In-Browser SQLite Relational Engine', () => {
  test('should execute SELECT on seeded tables', () => {
    const rows = sqliteEngine.execute('SELECT * FROM user_projects LIMIT 2;');
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(2);
    expect(rows[0]).toHaveProperty('name');
  });

  test('should execute CREATE TABLE and INSERT INTO', () => {
    sqliteEngine.execute('CREATE TABLE test_items (id, title);');
    const insertRes = sqliteEngine.execute('INSERT INTO test_items (title) VALUES ("Item 1");');
    expect(insertRes[0].status).toBe('SUCCESS');

    const selectRes = sqliteEngine.execute('SELECT * FROM test_items;');
    expect(selectRes.length).toBe(1);
    expect(selectRes[0].title).toBe('Item 1');
  });

  test('should execute DELETE statements', () => {
    sqliteEngine.execute('CREATE TABLE delete_test (id, status);');
    sqliteEngine.execute('INSERT INTO delete_test (id, status) VALUES ("10", "inactive");');
    const delRes = sqliteEngine.execute('DELETE FROM delete_test WHERE id = 10;');
    expect(delRes[0].deleted_rows).toBe(1);
  });
});
