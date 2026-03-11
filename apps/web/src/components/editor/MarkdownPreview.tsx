'use client';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

/**
 * Simple markdown-ish preview for MVP.
 * Handles **bold**, *italic*, # headings, and line breaks.
 */
export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  const renderLine = (line: string, index: number) => {
    // Headings
    const h3Match = line.match(/^###\s+(.*)/);
    if (h3Match) {
      return (
        <h3 key={index} className="mb-2 text-lg font-semibold text-white">
          {renderInline(h3Match[1])}
        </h3>
      );
    }

    const h2Match = line.match(/^##\s+(.*)/);
    if (h2Match) {
      return (
        <h2 key={index} className="mb-2 text-xl font-bold text-white">
          {renderInline(h2Match[1])}
        </h2>
      );
    }

    const h1Match = line.match(/^#\s+(.*)/);
    if (h1Match) {
      return (
        <h1 key={index} className="mb-3 text-2xl font-bold text-white">
          {renderInline(h1Match[1])}
        </h1>
      );
    }

    // Empty line
    if (line.trim() === '') {
      return <br key={index} />;
    }

    // Normal paragraph
    return (
      <p key={index} className="mb-1 text-gray-300">
        {renderInline(line)}
      </p>
    );
  };

  const renderInline = (text: string): React.ReactNode => {
    // Process **bold** and *italic* with basic regex
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Bold
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      if (boldMatch && boldMatch.index !== undefined) {
        if (boldMatch.index > 0) {
          parts.push(remaining.slice(0, boldMatch.index));
        }
        parts.push(
          <strong key={key++} className="font-bold text-white">
            {boldMatch[1]}
          </strong>,
        );
        remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
        continue;
      }

      // Italic
      const italicMatch = remaining.match(/\*(.+?)\*/);
      if (italicMatch && italicMatch.index !== undefined) {
        if (italicMatch.index > 0) {
          parts.push(remaining.slice(0, italicMatch.index));
        }
        parts.push(
          <em key={key++} className="italic text-gray-200">
            {italicMatch[1]}
          </em>,
        );
        remaining = remaining.slice(italicMatch.index + italicMatch[0].length);
        continue;
      }

      // No more matches - push the rest
      parts.push(remaining);
      break;
    }

    return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts;
  };

  const lines = content.split('\n');

  return (
    <div className={className}>
      {lines.map((line, index) => renderLine(line, index))}
    </div>
  );
}
