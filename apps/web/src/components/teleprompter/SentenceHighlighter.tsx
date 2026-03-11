'use client';

interface SentenceHighlighterProps {
  text: string;
  currentSentenceIndex: number;
  fontSize: number;
  lineSpacing: number;
}

export function SentenceHighlighter({
  text,
  currentSentenceIndex,
  fontSize,
  lineSpacing,
}: SentenceHighlighterProps) {
  // Split text into sentences on period, exclamation, question mark
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
