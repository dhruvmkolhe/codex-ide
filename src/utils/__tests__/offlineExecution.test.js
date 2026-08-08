import {
  checkOnlineStatus,
  executeJsLocally,
  executePythonLocally,
  executeSqlLocally,
  executeCodeOfflineFallback,
} from '../offlineExecution';

describe('offlineExecution utility', () => {
  test('checkOnlineStatus should return boolean', () => {
    expect(typeof checkOnlineStatus()).toBe('boolean');
  });

  test('executeJsLocally should capture console output and return result', async () => {
    const res = await executeJsLocally('console.log("Hello from offline JS");');
    expect(res.success).toBe(true);
    expect(res.output).toContain('Hello from offline JS');
    expect(res.isOffline).toBe(true);
  });

  test('executeJsLocally should catch runtime evaluation errors', async () => {
    const res = await executeJsLocally('throw new Error("Syntax Crash");');
    expect(res.success).toBe(false);
    expect(res.output).toContain('Runtime Error: Syntax Crash');
  });

  test('executePythonLocally should parse print statements with lightweight evaluator fallback', async () => {
    const res = await executePythonLocally('print("Hello Python")');
    expect(res.success).toBe(true);
    expect(res.output).toContain('Hello Python');
  });

  test('executeSqlLocally should execute SQL queries and return table output', async () => {
    const res = await executeSqlLocally('SELECT * FROM user_projects WHERE id = 1;');
    expect(res.success).toBe(true);
    expect(res.output).toContain('AI Collaborative Editor');
  });

  test('executeCodeOfflineFallback should route language execution correctly', async () => {
    const jsRes = await executeCodeOfflineFallback('console.log("JS")', 'javascript');
    expect(jsRes.success).toBe(true);

    const pyRes = await executeCodeOfflineFallback('print("Py")', 'python');
    expect(pyRes.success).toBe(true);

    const sqlRes = await executeCodeOfflineFallback('SELECT * FROM user_projects;', 'sql');
    expect(sqlRes.success).toBe(true);
    expect(sqlRes.output).toContain('AI Collaborative Editor');

    const cppRes = await executeCodeOfflineFallback('int main() {}', 'cpp');
    expect(cppRes.success).toBe(false);
    expect(cppRes.output).toContain('Remote execution required for cpp');
  });
});
