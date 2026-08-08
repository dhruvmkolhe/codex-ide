/**
 * Parses import/require statements from file content.
 * Returns an array of imported file names (relative paths only).
 */
export function parseDependencies(fileName, content) {
  const deps = [];
  if (!content) return deps;

  const patterns = [
    // ES6/TypeScript: import ... from './foo' or import './foo'
    /import\s+(?:[\w\s{},*]+\s+from\s+)?['"]([^'"]+)['"]/g,
    // CommonJS: require('./foo')
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    // ES Dynamic Import: import('./foo')
    /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    // PHP: include 'foo.php', require_once('bar.php'), use App\Foo (mapped to file if possible)
    /(?:include|require)(?:_once)?\s*(?:\(\s*)?['"]([^'"]+)['"](?:\s*\))?/g,
    // Python: import foo, from foo import bar
    /^\s*(?:import|from)\s+([.\w]+)/gm,
    // C/C++: #include "foo.h"
    /#include\s+["']([^"']+)["']/g,
    // Java/Kotlin/Scala/C#: import com.foo.Bar, using System.Foo
    /^\s*(?:import|using)\s+([.\w]+)/gm,
    // Go: import "foo/bar"
    /import\s+['"]([^'"]+)['"]/g,
    // Ruby: require 'foo', require_relative 'bar'
    /require(?:_relative)?\s+['"]([^'"]+)['"]/g,
    // Rust: mod foo; use bar::baz;
    /^\s*(?:mod|use)\s+([\w:]+)/gm,
    // HTML: <link href="style.css">, <script src="app.js">
    /<(?:link|script)[^>]+(?:href|src)=['"]([^'"]+)['"]/g,
    // CSS: @import "other.css"
    /@import\s+['"]([^'"]+)['"]/g,
  ];

  for (const regex of patterns) {
    let match;
    while ((match = regex.exec(content)) !== null) {
      let path = match[1];
      if (!path) continue;

      // Handle Python/Java/Rust style dots/colons
      if (
        regex.source.includes('import|from') ||
        regex.source.includes('import|using') ||
        regex.source.includes('mod|use')
      ) {
        path = path.replace(/::/g, '/').replace(/\./g, '/');
      }

      // Check if it's likely a project file (starts with . or doesn't have a protocol)
      if (path.startsWith('.') || (!path.includes('://') && !path.startsWith('//'))) {
        deps.push(path);
      }
    }
  }

  return [...new Set(deps)];
}

/**
 * Builds a graph from workspace files.
 * Returns { nodes: [{id, label, ext}], edges: [{source, target}] }
 */
export function buildGraph(files) {
  const nodes = files.map((f) => ({
    id: f.name,
    label: f.name,
    ext: f.name.split('.').pop()?.toLowerCase() || '',
  }));

  const fileNames = new Set(files.map((f) => f.name));
  const edges = [];
  const edgeSet = new Set();

  files.forEach((file) => {
    const deps = parseDependencies(file.name, file.content);
    deps.forEach((dep) => {
      // Try to resolve the imported path to a file in the workspace
      const resolved = resolveImport(file.name, dep, fileNames);
      if (resolved && resolved !== file.name) {
        const edgeKey = `${file.name}->${resolved}`;
        if (!edgeSet.has(edgeKey)) {
          edges.push({ source: file.name, target: resolved });
          edgeSet.add(edgeKey);
        }
      }
    });
  });

  return { nodes, edges };
}

function resolveImport(fromFile, importPath, fileNames) {
  // 1. Absolute project path (starts with / or is just the name)
  if (fileNames.has(importPath)) return importPath;

  // 2. Relative path resolution
  const fromDir = fromFile.includes('/') ? fromFile.substring(0, fromFile.lastIndexOf('/')) : '';

  let candidate = importPath;
  if (importPath.startsWith('./')) {
    candidate = fromDir ? `${fromDir}/${importPath.substring(2)}` : importPath.substring(2);
  } else if (importPath.startsWith('../')) {
    let currentDirParts = fromDir ? fromDir.split('/') : [];
    let pathParts = importPath.split('/');
    while (pathParts[0] === '..') {
      pathParts.shift();
      currentDirParts.pop();
    }
    candidate = [...currentDirParts, ...pathParts].join('/');
  } else if (!importPath.includes('/')) {
    // Top level file or in same dir
    candidate = fromDir ? `${fromDir}/${importPath}` : importPath;
  }

  // Clean double slashes
  candidate = candidate.replace(/\/+/g, '/');

  // Check exact match
  if (fileNames.has(candidate)) return candidate;

  // Try with common extensions
  const exts = [
    'js',
    'jsx',
    'ts',
    'tsx',
    'css',
    'php',
    'py',
    'java',
    'kt',
    'scala',
    'cs',
    'go',
    'rs',
    'rb',
    'sql',
    'html',
    'json',
  ];
  for (const ext of exts) {
    if (fileNames.has(`${candidate}.${ext}`)) return `${candidate}.${ext}`;
    // If candidate already has an extension but it's nested
    if (candidate.endsWith(`.${ext}`) && fileNames.has(candidate)) return candidate;
  }

  // Try matching just the filename if it's a "module" style import
  const fileNameOnly = importPath.split('/').pop();
  for (const name of fileNames) {
    if (name === fileNameOnly || name.startsWith(fileNameOnly + '.')) {
      return name;
    }
  }

  return null;
}
