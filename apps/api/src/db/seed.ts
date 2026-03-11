import pool from "./pool";

const SEEDS = [
  {
    title: "Welcome Script",
    description: "A simple introductory script for new presenters.",
    rawContent: `Hello and welcome to today's presentation.

We're going to cover the key highlights of our quarterly results.

Thank you for joining us, and let's get started.`,
  },
  {
    title: "Product Demo Script",
    description:
      "A structured demo script with SAY, ACTION, and COMMAND blocks.",
    rawContent: `[SAY]
Welcome everyone to the product demo. Today I'll be walking you through our latest features.
[/SAY]

[ACTION]
Open the application dashboard and navigate to the settings page.
[/ACTION]

[SAY]
As you can see, we've completely redesigned the settings interface for better usability.
[/SAY]

[COMMAND]
Switch to slide 2 - Feature Overview
[/COMMAND]

[SAY]
Let me now walk you through each feature in detail. Notice how the navigation has been simplified.
[/SAY]

[ACTION]
Click on the "New Feature" button and demonstrate the workflow.
[/ACTION]

[SAY]
That concludes our demo. Are there any questions?
[/SAY]`,
  },
];

async function seed(): Promise<void> {
  console.log("Seeding database...");

  for (const script of SEEDS) {
    const result = await pool.query(
      `INSERT INTO scripts (title, description, raw_content)
       VALUES ($1, $2, $3)
       RETURNING id, title`,
      [script.title, script.description, script.rawContent]
    );
    console.log(`  Created script: ${result.rows[0].title} (${result.rows[0].id})`);
  }

  console.log("Seeding complete.");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
