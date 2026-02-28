# PLAN.md

## Intro
First step is configuring the project and installing dependencies and getting it to run locally, so i can code comfortably without config or package versions issues that might come up later


## Setup Errors
Fixed local Windows build issues (Unix commands in clean scripts, postinstall turbo resolution), not included in PR as they're environment-specific.

## Project Bugs
Bug 1 : Restored proper Supabase auth middleware (was redirecting everything to "/")

Bug 2 : Wrapped home page with required context providers (was throwing Error: useGraphContext must be used within a GraphProvider).


## Timing
Spent 1 hour configuring project, fixing environment bugs, fixing project bugs.
2 hours left, i need to focus on the most impactful tasks that covers the most users


## TODO and TO QUEUE
Todo : Building shareable artifact links (view-only, version-pinned) a tabbed multi-file artifact UI on top of Open Canvas.

Skipping : suggest/review mode (too complex) and fork-to-workspace links (builds on view-only, not enough time).



## Ai assistance steps

1 - Conversation with Claude Sonnet 4.6 on web for project understanding

2 - Using Kiro with Claude Sonnet 4.5 for bug fixing (Much faster than Claude code but less technically capable, and we need speed for this step)

3 - Generating a CLAUDE.md file containing the Task to do + a initialization PROMPT from Claude Web

4 - Using Claude Code with Opus to actually run the Task

5 - Manual review to each change + Quick manual testing


## Tradeoffs

Sharing links : Used the existing key-value store instead of a dedicated shares table to avoid needing database migration access, simpler to ship but less queryable and harder to manage at scale.

Multi files : Used Regex post-processor fallback because i have had issues with a Prompt-only approach (not reliable enough)

Multi files : Used a files table "files[]" for the multi files system along with the code field, replacing the old solo "code" field