import { getDocumentSymbolsFallback, RemoteCursorWidget, acceptGhostText } from '../editorUtils';

jest.mock('@codemirror/state', () => ({
  __esModule: true,
  StateEffect: { define: jest.fn(() => ({ of: jest.fn() })) },
  StateField: { define: jest.fn(() => ({})) },
  RangeSet: { of: jest.fn(() => ({ map: jest.fn() })) },
}));

jest.mock('@codemirror/view', () => ({
  __esModule: true,
  EditorView: { decorations: { from: jest.fn() } },
  Decoration: { none: {}, widget: jest.fn(() => ({ range: jest.fn() })) },
  WidgetType: class WidgetType {},
}));

describe('editorUtils utility', () => {
  test('getDocumentSymbolsFallback should extract functions and variables', () => {
    const mockState = {
      doc: {
        toString: () =>
          'function calculateSum(a, b) { const totalValue = a + b; return totalValue; }',
      },
    };

    const symbols = getDocumentSymbolsFallback(mockState);
    expect(symbols.some((s) => s.label === 'calculateSum' && s.type === 'function')).toBe(true);
    expect(symbols.some((s) => s.label === 'totalValue')).toBe(true);
  });

  test('RemoteCursorWidget should render DOM element with label and color', () => {
    const widget = new RemoteCursorWidget('Alice', '#ff0000');
    const dom = widget.toDOM();

    expect(dom.className).toBe('cm-remote-cursor');
    expect(dom.style.borderLeft).toContain('#ff0000');
    expect(dom.querySelector('.cm-remote-cursor-label').textContent).toBe('Alice');
  });

  test('acceptGhostText should return false if view has no ghost text', () => {
    const mockView = {
      state: {
        field: jest.fn(() => ({ text: '', pos: null })),
      },
      dispatch: jest.fn(),
    };

    const accepted = acceptGhostText(mockView);
    expect(accepted).toBe(false);
  });
});
