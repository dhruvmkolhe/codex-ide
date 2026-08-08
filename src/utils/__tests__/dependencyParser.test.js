import { parseDependencies, buildGraph } from '../dependencyParser';

describe('dependencyParser utility', () => {
  test('parseDependencies should extract relative imports from JS code', () => {
    const code = `
      import React from 'react';
      import { helper } from './utils/helper';
      const config = require('./config');
    `;
    const deps = parseDependencies('App.js', code);
    expect(deps).toContain('./utils/helper');
    expect(deps).toContain('./config');
    expect(deps).toContain('react');
  });

  test('parseDependencies should extract C++ headers and Python imports', () => {
    const cppCode = '#include "myheader.h"\n#include <iostream>';
    const cppDeps = parseDependencies('main.cpp', cppCode);
    expect(cppDeps).toContain('myheader.h');
    expect(cppDeps).not.toContain('iostream');

    const pyCode = 'import helper\nfrom utils import data';
    const pyDeps = parseDependencies('main.py', pyCode);
    expect(pyDeps.length).toBeGreaterThan(0);
  });

  test('buildGraph should construct nodes and edges from workspace files', () => {
    const files = [
      { name: 'index.js', content: "import { foo } from './foo.js';" },
      { name: 'foo.js', content: "export const foo = 'bar';" },
    ];

    const graph = buildGraph(files);
    expect(graph.nodes).toHaveLength(2);
    expect(graph.nodes[0]).toEqual({ id: 'index.js', label: 'index.js', ext: 'js' });
    expect(graph.edges).toContainEqual({ source: 'index.js', target: 'foo.js' });
  });
});
