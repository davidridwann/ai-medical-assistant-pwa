import React from 'react';

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/** Returns HTML string for Telegram-style markdown (*bold*, _italic_, \\n). */
export function parseTelegramMarkdownToHtml(text: string): string {
  let html = escapeHtml(text);
  html = html.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
  html = html.replace(/\n/g, '<br>');
  return html;
}

/** Returns React nodes for Telegram-style markdown (no dangerouslySetInnerHTML). */
export function parseTelegramMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const result: React.ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) result.push(<br key={`br-${lineIdx}`} />);
    
    // Check if line is a header (starts with #)
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const headerText = headerMatch[2];
      const HeaderTag = `h${Math.min(level + 2, 6)}` as keyof JSX.IntrinsicElements;
      result.push(
        <HeaderTag key={`h-${lineIdx}`} style={{ marginTop: lineIdx > 0 ? '1em' : '0', marginBottom: '0.5em', fontWeight: 'bold' }}>
          {parseInlineMarkdown(headerText, `h-${lineIdx}`)}
        </HeaderTag>
      );
      return;
    }

    // Process regular line with inline markdown
    result.push(...parseInlineMarkdown(line, `l${lineIdx}`));
  });
  return result;
}

/** Parse inline markdown (bold, italic) and return React nodes */
function parseInlineMarkdown(text: string, keyPrefix: string): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  // Pattern: **bold**, *italic*, __bold__, _italic_
  const tokenPattern = /\*\*([^*]+)\*\*|\*([^*]+)\*|__([^_]+)__|_([^_]+)_/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  
  while ((match = tokenPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      // **bold**
      result.push(<strong key={`${keyPrefix}-${match.index}`}>{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      // *italic*
      result.push(<em key={`${keyPrefix}-${match.index}`}>{match[2]}</em>);
    } else if (match[3] !== undefined) {
      // __bold__
      result.push(<strong key={`${keyPrefix}-${match.index}`}>{match[3]}</strong>);
    } else if (match[4] !== undefined) {
      // _italic_
      result.push(<em key={`${keyPrefix}-${match.index}`}>{match[4]}</em>);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) result.push(text.slice(lastIndex));
  return result;
}
