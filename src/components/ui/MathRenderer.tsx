import React from 'react';
import katex from 'katex';

interface MathRendererProps {
  content?: string;
  className?: string;
}

/**
 * MathRenderer: Parses markdown-like strings containing LaTeX math notation
 * Supports:
 * - Display Math: $$ ... $$ or \[ ... \]
 * - Inline Math: $ ... $ or \( ... \)
 * Falls back to raw text safely if KaTeX fails to parse.
 */
export const MathRenderer: React.FC<MathRendererProps> = ({ content = '', className = '' }) => {
  if (!content) return null;

  // Split by $$ ... $$ or $ ... $ or \( ... \) or \[ ... \]
  // Using tokenization regex
  const parts: React.ReactNode[] = [];
  const regex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^$\n]+?\$|\\\([^\n]+?\\\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    // Push regular text before match
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index));
    }

    const token = match[0];
    let isBlock = false;
    let mathExpr = '';

    if (token.startsWith('$$') && token.endsWith('$$')) {
      isBlock = true;
      mathExpr = token.slice(2, -2).trim();
    } else if (token.startsWith('\\[') && token.endsWith('\\]')) {
      isBlock = true;
      mathExpr = token.slice(2, -2).trim();
    } else if (token.startsWith('\\(') && token.endsWith('\\)')) {
      isBlock = false;
      mathExpr = token.slice(2, -2).trim();
    } else if (token.startsWith('$') && token.endsWith('$')) {
      isBlock = false;
      mathExpr = token.slice(1, -1).trim();
    }

    try {
      const html = katex.renderToString(mathExpr, {
        displayMode: isBlock,
        throwOnError: false,
      });

      parts.push(
        <span
          key={match.index}
          className={isBlock ? 'block my-2 text-center overflow-x-auto' : 'inline-block mx-0.5'}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch {
      // Fallback to raw formula if rendering error
      parts.push(<span key={match.index}>{token}</span>);
    }

    lastIndex = regex.lastIndex;
  }

  // Push remainder text
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return <span className={className}>{parts}</span>;
};
