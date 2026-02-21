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
  const tokenPattern = /\*([^*]+)\*|_([^_]+)_/g;

  lines.forEach((line, lineIdx) => {
    if (lineIdx > 0) result.push(<br key={`br-${lineIdx}`} />);
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const keyPrefix = `l${lineIdx}-`;
    while ((match = tokenPattern.exec(line)) !== null) {
      if (match.index > lastIndex) {
        result.push(line.slice(lastIndex, match.index));
      }
      if (match[1] !== undefined) {
        result.push(<strong key={`${keyPrefix}${match.index}`}>{match[1]}</strong>);
      } else if (match[2] !== undefined) {
        result.push(<em key={`${keyPrefix}${match.index}`}>{match[2]}</em>);
      }
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < line.length) result.push(line.slice(lastIndex));
  });
  return result;
}
