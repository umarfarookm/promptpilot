'use client';

interface SentenceHighlighterProps {
  text: string;
  currentSentenceIndex: number;
  fontSize: number;
  lineSpacing: number;
  activeWordIndex?: number;
}

export function SentenceHighlighter({
  text,
  currentSentenceIndex,
  fontSize,
  lineSpacing,
  activeWordIndex,
}: SentenceHighlighterProps) {
  // If word-level highlighting is active, render word by word
  if (activeWordIndex !== undefined) {
    const words = text.split(/(\s+)/);
    let wordCount = 0;

    return (
      <p
        className="teleprompter-text"
        style={{ fontSize: `${fontSize}px`, lineHeight: lineSpacing }}
      >
        {words.map((segment, i) => {
          // Whitespace segments
          if (/^\s+$/.test(segment)) {
            return <span key={i}>{segment}</span>;
          }

          const isSpoken = wordCount <= activeWordIndex;
          wordCount++;

          return (
            <span
              key={i}
              className={
                isSpoken
                  ? 'teleprompter-highlight transition-colors duration-150'
                  : 'text-white/40 transition-colors duration-150'
              }
            >
              {segment}
            </span>
          );
        })}
      </p>
    );
  }

  // Sentence-level highlighting (original behavior)
  const sentences = text.match(/[^.!?]+[.!?]+\s*/g) || [text];

  return (
    <p
      className="teleprompter-text"
      style={{ fontSize: `${fontSize}px`, lineHeight: lineSpacing }}
    >
      {sentences.map((sentence, index) => (
        <span
          key={index}
          className={
            index === currentSentenceIndex
              ? 'teleprompter-highlight'
              : 'text-white/80'
          }
        >
          {sentence}
        </span>
      ))}
    </p>
  );
}
