# Example Scripts

PromptPilot supports two script formats: the **Copilot format** and **plain text/markdown**.

## Copilot Format (`.copilot`)

The Copilot format uses structured directives to describe a full presentation or tutorial flow. Each line begins with a keyword that tells PromptPilot how to handle it.

```
SAY: Welcome to the demo
ACTION: Open the browser
COMMAND: npm start
SAY: As you can see, the server is running
```

- **SAY** -- Text that appears on the teleprompter for the speaker to read aloud.
- **ACTION** -- A physical action the presenter should perform (shown as a visual cue).
- **COMMAND** -- A terminal command to execute or display.

See `demo-tutorial.copilot` for a complete example.

## Plain Text / Markdown

Any `.md` or `.txt` file is treated as teleprompter content. Each paragraph scrolls on screen as spoken text. No special syntax is required -- just write naturally.

```markdown
# Introduction

Welcome everyone. Today we are going to talk about our new product.

Let me start by showing you the dashboard.
```

See `presentation-intro.md` for a complete example.

## When to Use Which

| Format | Best for |
|--------|----------|
| Copilot (`.copilot`) | Tutorials, live coding demos, multi-step walkthroughs |
| Plain text / Markdown | Keynotes, talks, narration, any speech-first content |
