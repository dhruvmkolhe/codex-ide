import { StateEffect, StateField } from '@codemirror/state';
import { EditorView, Decoration, WidgetType } from '@codemirror/view';
import { RangeSet } from '@codemirror/state';
import { languageDictionaries } from './ideConstants';

let symbolCacheKey = '';
let symbolCacheResult = [];

/**
 * Fallback to find symbols in the document when a proper LSP is not available.
 * Cached by document text to guarantee 0ms overhead during typing.
 */
export function getDocumentSymbolsFallback(state) {
  const text = state.doc.toString();
  if (text === symbolCacheKey) {
    return symbolCacheResult;
  }

  const wordRegex = /\b[a-zA-Z_]\w*\b/g;
  const symbols = [];
  const seen = new Set();

  const funcRegex = /\b([a-zA-Z_]\w*)\s*\(/g;
  let match;
  while ((match = funcRegex.exec(text)) !== null) {
    const name = match[1];
    if (name.length > 2 && !seen.has(name)) {
      seen.add(name);
      symbols.push({ label: name, type: 'function' });
    }
  }

  wordRegex.lastIndex = 0;
  while ((match = wordRegex.exec(text)) !== null) {
    const name = match[0];
    if (name.length > 2 && !seen.has(name)) {
      seen.add(name);
      let type = 'variable';
      if (/^[A-Z]/.test(name)) {
        type = 'class';
      }
      symbols.push({ label: name, type });
    }
  }

  symbolCacheKey = text;
  symbolCacheResult = symbols;
  return symbols;
}

/**
 * Custom completion source for IntelliSense.
 */
export const customCompletionSource = (selectedLanguage) => {
  return (context) => {
    const word = context.matchBefore(/\w*/);
    if (!word || (word.from === word.to && !context.explicit)) return null;

    const prefix = word.text.toLowerCase();
    const langKey =
      {
        javascript: 'javascript',
        typescript: 'javascript',
        nodejs: 'javascript',
        python: 'python',
        python2: 'python',
        tkinter: 'python',
        matplotlib: 'python',
        c: 'cpp',
        cpp: 'cpp',
        java: 'java',
        javaswing: 'java',
        javafx: 'java',
      }[selectedLanguage] || null;

    const dict = langKey ? languageDictionaries[langKey] : [];
    const docSymbols = getDocumentSymbolsFallback(context.state);

    const dictMap = new Map();
    const seen = new Set();
    const options = [];

    for (const item of dict) {
      dictMap.set(item.label, item);
      if (item.label.toLowerCase().startsWith(prefix)) {
        seen.add(item.label);
        options.push(item);
      }
    }

    for (const item of docSymbols) {
      if (item.label.toLowerCase().startsWith(prefix) && !seen.has(item.label)) {
        const dictItem = dictMap.get(item.label);
        const type = dictItem ? dictItem.type : item.type;
        seen.add(item.label);
        options.push({ label: item.label, type });
      }
    }

    return {
      from: word.from,
      options: options,
    };
  };
};

// ── Collaborative Editing Remote Cursors ──

export const setRemoteCursorsEffect = StateEffect.define();

export class RemoteCursorWidget extends WidgetType {
  constructor(name, color) {
    super();
    this.name = name;
    this.color = color;
  }

  toDOM() {
    const cursor = document.createElement('span');
    cursor.className = 'cm-remote-cursor';
    cursor.style.borderLeft = `2px solid ${this.color}`;
    cursor.style.position = 'relative';
    cursor.style.marginLeft = '-1px';
    cursor.style.marginRight = '-1px';
    cursor.style.display = 'inline';

    const label = document.createElement('span');
    label.className = 'cm-remote-cursor-label';
    label.style.backgroundColor = this.color;
    label.textContent = this.name;
    cursor.appendChild(label);

    return cursor;
  }

  eq(other) {
    return other.name === this.name && other.color === this.color;
  }
}

export const remoteCursorsField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    decorations = decorations.map(tr.changes);
    for (const e of tr.effects) {
      if (e.is(setRemoteCursorsEffect)) {
        const ranges = [];
        const sorted = [...e.value].sort((a, b) => a.pos - b.pos);
        for (const cur of sorted) {
          const pos = Math.min(Math.max(0, cur.pos), tr.newDoc.length);
          ranges.push(
            Decoration.widget({
              widget: new RemoteCursorWidget(cur.name, cur.color),
              side: 1,
            }).range(pos)
          );
        }
        decorations = RangeSet.of(ranges);
      }
    }
    return decorations;
  },
  provide: (f) => EditorView.decorations.from(f),
});

// ── Inline Autocomplete Ghost Text ──

export const setGhostTextEffect = StateEffect.define();

class GhostTextWidget extends WidgetType {
  constructor(text) {
    super();
    this.text = text;
  }

  toDOM() {
    const span = document.createElement('span');
    span.className = 'cm-ghost-text';
    span.textContent = this.text;
    span.style.color = '#888';
    span.style.opacity = '0.6';
    span.style.fontStyle = 'italic';
    span.style.pointerEvents = 'none';
    span.style.userSelect = 'none';
    return span;
  }

  eq(other) {
    return other.text === this.text;
  }
}

export const ghostTextField = StateField.define({
  create() {
    return { text: '', pos: null };
  },
  update(value, tr) {
    if (tr.docChanged) return { text: '', pos: null };
    for (const e of tr.effects) {
      if (e.is(setGhostTextEffect)) {
        return e.value;
      }
    }
    return value;
  },
  provide: (f) =>
    EditorView.decorations.from(f, (val) => {
      if (!val.text || val.pos === null) return Decoration.none;
      return Decoration.set([
        Decoration.widget({
          widget: new GhostTextWidget(val.text),
          side: 1,
        }).range(val.pos),
      ]);
    }),
});

export const acceptGhostText = (view) => {
  const { text, pos } = view.state.field(ghostTextField);
  if (!text || pos === null) return false;
  view.dispatch({
    changes: { from: pos, insert: text },
    effects: setGhostTextEffect.of({ text: '', pos: null }),
    selection: { anchor: pos + text.length },
  });
  return true;
};
