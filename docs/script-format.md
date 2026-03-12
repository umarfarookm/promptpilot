# Script Format Specification

PromptPilot scripts define what a speaker says, does, and runs during a presentation or tutorial. This document is the complete reference for the `.copilot` script format.

## Overview

A `.copilot` file is a plain-text file where each line is either a **directive** (prefixed with a keyword) or a **blank line** used for visual separation. The parser reads the file top-to-bottom and produces an ordered list of blocks.

## Block Types

### SAY

Spoken text that appears on the teleprompter.

```
SAY: Welcome to the presentation
SAY: Today we will cover three topics
```

**Rules:**
- The text after `SAY:` is trimmed of leading and trailing whitespace.
- Consecutive `SAY` lines are grouped into a single teleprompter segment.
- The speaker reads these lines aloud; they are never executed.

### ACTION

A physical action the presenter needs to perform. Actions appear as visual cues (highlighted cards) on the teleprompter display.

```
ACTION: Open the browser and navigate to the dashboard
ACTION: Switch to the terminal window
```

**Rules:**
- The text after `ACTION:` is trimmed of leading and trailing whitespace.
- Actions are informational -- they tell the speaker what to do but are not automated.
- Each `ACTION` line produces one action block.

### COMMAND

A terminal command to display or execute.

```
COMMAND: npm install express
COMMAND: docker-compose up -d
```

**Rules:**
- The text after `COMMAND:` is trimmed of leading and trailing whitespace.
- Commands are displayed in a monospace code block on the teleprompter.
- In Demo Copilot mode, commands can be auto-executed in a connected terminal session.
- Each `COMMAND` line produces one command block.
- Multi-line commands use `&&` or `\` continuation on a single line.

## Plain Text Mode

Files with `.md` or `.txt` extensions are treated as plain teleprompter text. No directive parsing is applied. Each paragraph (separated by one or more blank lines) becomes a single teleprompter segment.

```
Welcome everyone.

Today I want to talk about our roadmap for the next quarter.

Let me start with a quick recap of where we are.
```

## Formatting Rules

1. **One directive per line.** Each `SAY`, `ACTION`, or `COMMAND` must occupy exactly one line.
2. **Colon and space.** The keyword must be followed by a colon and at least one space (`SAY: text`, not `SAY:text`).
3. **Case sensitive.** Keywords must be uppercase: `SAY`, `ACTION`, `COMMAND`.
4. **Blank lines are ignored** by the parser but encouraged for readability.
5. **Comments** are not supported. Any line that does not match a known directive and is not blank will produce a parse warning.
6. **Encoding.** Files must be UTF-8 encoded.

## Example

```
SAY: Welcome to the live coding session
SAY: We are going to build a CLI tool from scratch

ACTION: Open the terminal

COMMAND: mkdir my-cli && cd my-cli
COMMAND: npm init -y

SAY: Now let's add our first dependency

COMMAND: npm install commander

ACTION: Open index.js in your editor

SAY: We will start by importing commander and defining our first command
```

## Parsed Output

The script engine parses each file into an array of block objects:

```
[
  { type: "say",     text: "Welcome to the live coding session" },
  { type: "say",     text: "We are going to build a CLI tool from scratch" },
  { type: "action",  text: "Open the terminal" },
  { type: "command", text: "mkdir my-cli && cd my-cli" },
  { type: "command", text: "npm init -y" },
  { type: "say",     text: "Now let's add our first dependency" },
  { type: "command", text: "npm install commander" },
  { type: "action",  text: "Open index.js in your editor" },
  { type: "say",     text: "We will start by importing commander and defining our first command" }
]
```

This array drives the teleprompter UI, the Demo Copilot executor, and future features like speech-sync timing.
