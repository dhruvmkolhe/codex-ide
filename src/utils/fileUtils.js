/**
 * Transforms flat files into a tree structure for the sidebar explorer.
 */
export const buildFileTree = (files) => {
  const root = { name: 'PROJECT', type: 'folder', children: {}, path: 'PROJECT' };
  files.forEach((file, index) => {
    const parts = file.name.split('/');
    let current = root;
    parts.forEach((part, i) => {
      if (i === parts.length - 1) {
        current.children[part] = { name: part, type: 'file', index, path: file.name };
      } else {
        if (!current.children[part]) {
          current.children[part] = {
            name: part,
            type: 'folder',
            children: {},
            path: parts.slice(0, i + 1).join('/'),
          };
        }
        current = current.children[part];
      }
    });
  });
  return root;
};
