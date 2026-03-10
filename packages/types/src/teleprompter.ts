export interface TeleprompterSettings {
  fontSize: number; // 16-72
  scrollSpeed: number; // 0-100
  mirrorMode: boolean;
  highlightCurrent: boolean;
  cameraPosition: "top" | "bottom" | "left" | "right";
  theme: "dark" | "light";
  lineSpacing: number;
  marginPercent: number;
}

export interface TeleprompterState {
  isPlaying: boolean;
  currentBlockIndex: number;
  currentSentenceIndex: number;
  elapsedTime: number;
}
