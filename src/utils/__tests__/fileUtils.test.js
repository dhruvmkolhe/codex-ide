import { buildFileTree } from '../fileUtils';

describe('fileUtils utility', () => {
  test('buildFileTree should transform flat files array into nested directory tree', () => {
    const files = [
      { name: 'src/index.js', content: 'console.log("hi");' },
      { name: 'src/components/Header.js', content: 'export default () => {};' },
      { name: 'README.md', content: '# Readme' },
    ];

    const tree = buildFileTree(files);
    expect(tree.name).toBe('PROJECT');
    expect(tree.type).toBe('folder');
    expect(tree.children['README.md']).toEqual({
      name: 'README.md',
      type: 'file',
      index: 2,
      path: 'README.md',
    });

    expect(tree.children['src'].type).toBe('folder');
    expect(tree.children['src'].children['index.js'].type).toBe('file');
    expect(tree.children['src'].children['components'].children['Header.js'].path).toBe(
      'src/components/Header.js'
    );
  });
});
