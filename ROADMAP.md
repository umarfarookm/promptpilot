# Roadmap

PromptPilot development is organized into five phases. Each phase builds on the previous one.

## Phase 1 -- Teleprompter Core

The foundation: a working teleprompter that speakers can rely on.

- Script editor with syntax highlighting for `.copilot` format
- Full-screen teleprompter display with smooth auto-scroll
- Adjustable scroll speed and font size
- Script management (create, edit, delete, organize into projects)
- Keyboard and remote control support for play, pause, and navigation
- Markdown and plain-text script import

## Phase 2 -- Speech Sync

Hands-free scrolling driven by the speaker's voice.

- Real-time speech recognition via Web Speech API
- Automatic scroll advancement based on spoken words
- Visual progress indicator showing current position in the script
- Confidence scoring and fallback to manual scroll on low confidence
- Calibration wizard for microphone setup and speech model tuning
- Support for multiple languages

## Phase 3 -- AI Script Assistant

Intelligent tools that help speakers write better scripts.

- AI-powered script generation from a topic or outline
- Script rewriting for tone, length, and audience level
- Timing estimator based on word count and pacing preferences
- Transition and filler suggestions between sections
- Script templates for common formats (keynote, tutorial, product demo)
- Grammar and clarity review

## Phase 4 -- Demo Copilot

Turn tutorials and live coding sessions into guided experiences.

- Terminal integration for auto-executing `COMMAND` blocks
- Step-by-step mode with manual advance between blocks
- Live preview pane showing terminal output alongside teleprompter text
- Error detection and suggested recovery steps during live demos
- Recording mode that captures terminal output synced with script timing
- Exportable demo playback files

## Phase 5 -- Presentation Analytics

Post-presentation insights to help speakers improve over time.

- Session recording with timestamped script position tracking
- Speaking pace analysis (words per minute over time)
- Pause and filler word detection
- Audience engagement proxy via session duration and section timing
- Comparison across sessions to track improvement
- Exportable reports (PDF and JSON)
