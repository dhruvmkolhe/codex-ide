import React, { useState } from 'react';

export function MarkdownRenderer({ text, content }) {
  const markdownText = text || content || '';
  if (!markdownText) return null;

  const parts = markdownText.split(/(```[\s\S]*?```)/g);

  return (
    <div className="markdown-body">
      {parts.map((part, index) => {
        if (part.startsWith('```')) {
          const lines = part.split('\n');
          let language = '';
          let codeContent = '';

          if (lines.length > 0) {
            const firstLine = lines[0];
            language = firstLine.replace('```', '').trim().toLowerCase();
            codeContent = lines.slice(1, -1).join('\n');
            if (part.endsWith('```') && lines.length === 1) {
              codeContent = firstLine.replace('```', '');
            }
          }

          return <CodeBlock key={index} language={language} code={codeContent} />;
        } else {
          return <TextSection key={index} text={part} />;
        }
      })}
    </div>
  );
}

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="markdown-code-block-container">
      <div className="markdown-code-block-header">
        <span className="markdown-code-lang">{language || 'code'}</span>
        <button onClick={handleCopy} className="markdown-copy-btn">
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="markdown-code-pre">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
}

function renderInlineFormatting(text) {
  const linkParts = text.split(/(\[[^\]]+\]\([^)]+\))/g);

  const parsedParts = linkParts.map((part, partIdx) => {
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a
          key={`link-${partIdx}`}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="markdown-link"
        >
          {linkMatch[1]}
        </a>
      );
    }

    const codeParts = part.split(/(`[^`]+`)/g);

    return codeParts.map((codePart, codeIdx) => {
      const key = `${partIdx}-${codeIdx}`;
      if (codePart.startsWith('`') && codePart.endsWith('`')) {
        const codeVal = codePart.slice(1, -1);
        return (
          <code key={key} className="markdown-inline-code">
            {codeVal}
          </code>
        );
      }
      return parseBoldAndItalics(codePart, key);
    });
  });

  return parsedParts;
}

function parseBoldAndItalics(text, baseKey) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, idx) => {
    const key = `${baseKey}-${idx}`;
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldVal = part.slice(2, -2);
      return (
        <strong key={key} className="markdown-bold">
          {boldVal}
        </strong>
      );
    }

    const subParts = part.split(/(\*[^*]+\*)/g);
    return subParts.map((subPart, subIdx) => {
      const subKey = `${key}-${subIdx}`;
      if (subPart.startsWith('*') && subPart.endsWith('*')) {
        const italicVal = subPart.slice(1, -1);
        return (
          <em key={subKey} className="markdown-italic">
            {italicVal}
          </em>
        );
      }
      return subPart;
    });
  });
}

function renderList(list, key) {
  const Tag = list.type === 'ul' ? 'ul' : 'ol';
  return (
    <Tag key={`list-${key}`} className={`markdown-${list.type}`}>
      {list.items.map((item, idx) => (
        <li key={idx} className="markdown-li">
          {renderInlineFormatting(item)}
        </li>
      ))}
    </Tag>
  );
}

function TextSection({ text }) {
  const blocks = text.split(/\n\n+/);

  return (
    <>
      {blocks.map((block, blockIdx) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        if (trimmed.startsWith('#')) {
          const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
          if (match) {
            const level = match[1].length;
            const HeadingTag = `h${level}`;
            return (
              <HeadingTag key={blockIdx} className={`markdown-h${level}`}>
                {renderInlineFormatting(match[2])}
              </HeadingTag>
            );
          }
        }

        const lines = block.split('\n');
        const renderedElements = [];
        let currentList = null;

        const pushCurrentList = (key) => {
          if (currentList) {
            renderedElements.push(renderList(currentList, key));
            currentList = null;
          }
        };

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const ulMatch = line.match(/^\s*[-*+]\s+(.*)$/);
          const olMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);

          if (ulMatch) {
            if (currentList && currentList.type !== 'ul') pushCurrentList(`list-tr-${i}`);
            if (!currentList) currentList = { type: 'ul', items: [] };
            currentList.items.push(ulMatch[1]);
          } else if (olMatch) {
            if (currentList && currentList.type !== 'ol') pushCurrentList(`list-tr-${i}`);
            if (!currentList) currentList = { type: 'ol', items: [] };
            currentList.items.push(olMatch[2]);
          } else {
            pushCurrentList(`list-end-${i}`);
            if (line.trim() !== '') {
              renderedElements.push(
                <span key={`line-${i}`} className="markdown-line">
                  {renderInlineFormatting(line)}
                  {i < lines.length - 1 && <br />}
                </span>
              );
            }
          }
        }
        pushCurrentList(`list-final`);

        return (
          <p key={blockIdx} className="markdown-p">
            {renderedElements}
          </p>
        );
      })}
    </>
  );
}
