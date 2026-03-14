import { Router, Request, Response } from "express";
import type { ApiResponse, ScriptTemplate, TemplateId } from "@promptpilot/types";

const router = Router();

const TEMPLATES: ScriptTemplate[] = [
  {
    id: "keynote",
    name: "Keynote Presentation",
    description: "Classic keynote structure with opening hook, key points, and closing CTA.",
    skeleton: `[SAY] Good morning everyone! Today I want to talk about something that will change how you think about [TOPIC].

[ACTION] Pause for audience attention

[SAY] Let me start with a question — have you ever [HOOK QUESTION]?

[SAY] Here's the first thing you need to know: [KEY POINT 1]. This matters because [REASON].

[ACTION] Advance to next slide

[SAY] The second insight is [KEY POINT 2]. Let me show you what I mean.

[ACTION] Advance to next slide

[SAY] And finally, [KEY POINT 3]. This is the piece that ties everything together.

[SAY] So here's my ask — [CALL TO ACTION]. Thank you!

[ACTION] Open floor for questions`,
  },
  {
    id: "tutorial",
    name: "Technical Tutorial",
    description: "Step-by-step tutorial with prerequisites, live coding, and recap.",
    skeleton: `[SAY] Welcome to this tutorial on [TOPIC]. By the end, you'll be able to [LEARNING OUTCOME].

[SAY] Before we begin, make sure you have [PREREQUISITE 1] and [PREREQUISITE 2] installed.

[ACTION] Switch to terminal

[SAY] Let's start by setting up our project.

[COMMAND] mkdir my-project && cd my-project

[SAY] Now let's install the dependencies we need.

[COMMAND] npm init -y

[SAY] Great. Let's write our first piece of code.

[ACTION] Open editor

[SAY] Here's what this code does: [EXPLANATION].

[SAY] Let's run it and see the result.

[COMMAND] npm start

[SAY] As you can see, [RESULT EXPLANATION].

[SAY] To recap — today we learned [SUMMARY]. Check the description for links and resources. See you next time!`,
  },
  {
    id: "product-demo",
    name: "Product Demo",
    description: "Problem-solution demo flow with live walkthrough and pricing.",
    skeleton: `[SAY] Thanks for joining today's demo. I'm going to show you how [PRODUCT] solves [PROBLEM].

[SAY] First, let me set the scene. Right now, most teams spend [PAIN POINT]. It doesn't have to be that way.

[ACTION] Open the application

[SAY] Let me walk you through the workflow. Step one: [FEATURE 1].

[ACTION] Demonstrate feature 1

[SAY] Notice how [BENEFIT]. This alone saves teams [VALUE].

[SAY] Next, let's look at [FEATURE 2].

[ACTION] Demonstrate feature 2

[SAY] And the best part — [KEY DIFFERENTIATOR].

[SAY] Here's what our pricing looks like: [PRICING DETAILS].

[SAY] Want to try it yourself? [CTA — sign up, free trial, etc.]. Happy to answer any questions!`,
  },
  {
    id: "meeting",
    name: "Meeting / Standup",
    description: "Structured meeting with agenda, discussion points, and action items.",
    skeleton: `[SAY] Alright, let's get started. Here's what we're covering today.

[SAY] Agenda item one: [TOPIC 1]. [SPEAKER], can you give us a quick update?

[ACTION] Wait for update

[SAY] Thanks. Any blockers on that front?

[SAY] Moving on — agenda item two: [TOPIC 2].

[SAY] Here's what we know so far: [CONTEXT]. The decision we need to make is [DECISION].

[ACTION] Open for discussion

[SAY] Let's lock in the action items. [PERSON 1] will [TASK 1] by [DATE]. [PERSON 2] will [TASK 2].

[SAY] Anything else before we wrap? Great — thanks everyone. See you [NEXT MEETING].`,
  },
  {
    id: "workshop",
    name: "Workshop / Training",
    description: "Interactive workshop with learning objectives, exercises, and Q&A.",
    skeleton: `[SAY] Welcome to today's workshop on [TOPIC]. I'm [NAME], and I'll be guiding you through the next [DURATION].

[SAY] By the end of this session, you'll be able to: one, [OBJECTIVE 1]; two, [OBJECTIVE 2]; and three, [OBJECTIVE 3].

[SAY] Let's start with some context. [BACKGROUND EXPLANATION].

[ACTION] Show first exercise slide

[SAY] Time for our first exercise. I'd like you to [EXERCISE 1 INSTRUCTIONS]. You have [TIME] minutes. Go!

[ACTION] Start timer

[SAY] Alright, let's regroup. What did you find? [DEBRIEF].

[SAY] Now let's build on that. [CONCEPT 2 EXPLANATION].

[ACTION] Show second exercise slide

[SAY] Exercise two: [EXERCISE 2 INSTRUCTIONS].

[ACTION] Start timer

[SAY] Great work. Let's discuss what you learned.

[SAY] To wrap up — the key takeaways are [TAKEAWAY 1], [TAKEAWAY 2], and [TAKEAWAY 3].

[SAY] Any questions? I'll be here for the next few minutes if you want to chat.`,
  },
];

// GET /api/templates - list all templates
router.get("/api/templates", (_req: Request, res: Response) => {
  const response: ApiResponse<ScriptTemplate[]> = {
    success: true,
    data: TEMPLATES,
  };
  res.json(response);
});

// GET /api/templates/:id - get a single template
router.get("/api/templates/:id", (req: Request, res: Response) => {
  const template = TEMPLATES.find((t) => t.id === req.params.id);

  if (!template) {
    const response: ApiResponse<null> = {
      success: false,
      error: "Template not found",
    };
    res.status(404).json(response);
    return;
  }

  const response: ApiResponse<ScriptTemplate> = {
    success: true,
    data: template,
  };
  res.json(response);
});

export default router;
