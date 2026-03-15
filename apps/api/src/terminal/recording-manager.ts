import type { RecordingEvent, RecordingData, RecordingEventType } from '@promptpilot/types';

const OUTPUT_BATCH_WINDOW_MS = 100;

export class RecordingManager {
  private recording = false;
  private startTime = 0;
  private events: RecordingEvent[] = [];
  private outputBuffer = '';
  private outputTimer: ReturnType<typeof setTimeout> | null = null;
  private scriptId = '';
  private scriptTitle = '';
  private blocks: unknown[] = [];

  start(scriptId: string, scriptTitle: string, blocks: unknown[]) {
    this.recording = true;
    this.startTime = Date.now();
    this.events = [];
    this.outputBuffer = '';
    this.scriptId = scriptId;
    this.scriptTitle = scriptTitle;
    this.blocks = blocks;
    console.log(`[recording] Started for script ${scriptId}`);
  }

  stop(): RecordingData | null {
    if (!this.recording) return null;

    this.flushOutputBuffer();
    this.recording = false;
    const duration = Date.now() - this.startTime;

    const data: RecordingData = {
      version: 1,
      scriptId: this.scriptId,
      scriptTitle: this.scriptTitle,
      blocks: this.blocks,
      startedAt: new Date(this.startTime).toISOString(),
      duration,
      events: this.events,
    };

    console.log(`[recording] Stopped. Duration: ${duration}ms, Events: ${this.events.length}`);
    this.events = [];
    return data;
  }

  addEvent(type: RecordingEventType, data: string, blockIndex?: number, exitCode?: number) {
    if (!this.recording) return;

    if (type === 'output') {
      // Batch output events into 100ms windows
      this.outputBuffer += data;
      if (!this.outputTimer) {
        this.outputTimer = setTimeout(() => this.flushOutputBuffer(), OUTPUT_BATCH_WINDOW_MS);
      }
      return;
    }

    this.flushOutputBuffer();
    this.events.push({
      timestamp: Date.now() - this.startTime,
      type,
      data,
      blockIndex,
      exitCode,
    });
  }

  get isRecording(): boolean {
    return this.recording;
  }

  private flushOutputBuffer() {
    if (this.outputTimer) {
      clearTimeout(this.outputTimer);
      this.outputTimer = null;
    }
    if (this.outputBuffer) {
      this.events.push({
        timestamp: Date.now() - this.startTime,
        type: 'output',
        data: this.outputBuffer,
      });
      this.outputBuffer = '';
    }
  }
}
