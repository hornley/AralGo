'use client';

import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

function renderLatex(content: string, displayMode: boolean): string {
  try {
    return katex.renderToString(content, {
      throwOnError: false,
      displayMode,
      output: 'html',
    });
  } catch {
    return content;
  }
}

function parseAndRender(text: string): (string | { html: string; display: boolean })[] {
  const parts: (string | { html: string; display: boolean })[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    const displayMatch = remaining.match(/^\$\$([\s\S]+?)\$\$/);
    if (displayMatch) {
      const html = renderLatex(displayMatch[1], true);
      parts.push({ html, display: true });
      remaining = remaining.slice(displayMatch[0].length);
      continue;
    }

    const inlineMatch = remaining.match(/^\$(.+?)\$/);
    if (inlineMatch) {
      const html = renderLatex(inlineMatch[1], false);
      parts.push({ html, display: false });
      remaining = remaining.slice(inlineMatch[0].length);
      continue;
    }

    const idx = remaining.search(/[$\\]/);
    if (idx === 0) {
      parts.push(remaining[0]);
      remaining = remaining.slice(1);
    } else if (idx > 0) {
      parts.push(remaining.slice(0, idx));
      remaining = remaining.slice(idx);
    } else {
      parts.push(remaining);
      remaining = '';
    }
  }

  return parts;
}

export default function MathRenderer({ text }: { text: string }) {
  const parts = useMemo(() => parseAndRender(text), [text]);

  return (
    <>
      {parts.map((part, i) => {
        if (typeof part === 'string') return <span key={i}>{part}</span>;
        if (part.display) {
          return (
            <div key={i} className="math-display" dangerouslySetInnerHTML={{ __html: part.html }} />
          );
        }
        return (
          <span key={i} className="math-inline" dangerouslySetInnerHTML={{ __html: part.html }} />
        );
      })}
    </>
  );
}
