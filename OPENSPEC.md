# OpenSpec cheat sheet

How this repo uses OpenSpec for spec-driven development with Claude Code.

## The idea in one paragraph

Every feature or fix is a **change**: a folder of markdown files that describes what will be built before any code is written. You review the plan, the agent builds it, and the plan's spec updates are merged into the main specs. The agent (Claude Code) does all the work. The `openspec` terminal command only manages and checks the files; it never writes code.

## The loop

```text
explore (optional) -> propose -> review -> apply -> archive -> git commit
```

| Step | You type in the Claude Code chat | Result |
|---|---|---|
| Brainstorm | `/opsx:explore <idea>` | Discussion only, no files or code |
| Plan | `/opsx:propose "<what you want>"` | New folder in `openspec/changes/<name>/` |
| Review | Nothing; read the files, ask for edits | A plan you agree with |
| Build | `/opsx:apply` | Code written, tasks ticked off |
| Finish | `/opsx:archive` | Specs updated, change moved to the archive |

Tip: start a new conversation between Plan and Build. The plan lives in files, so nothing is lost, and shorter conversations use less of your usage limit.

## Chat commands (Claude Code panel)

| Command | Use it when |
|---|---|
| `/opsx:explore <idea>` | You want to think something through before committing to it |
| `/opsx:propose "<description>"` | You know what you want; creates proposal, spec delta, design and tasks |
| `/opsx:update` | The plan needs revising and you want all its files kept consistent |
| `/opsx:apply` | The plan is approved; implements the tasks |
| `/opsx:sync` | You want the spec delta merged into the main specs without archiving yet |
| `/opsx:archive` | The work is done; merges the spec delta and archives the change |

If several changes are open, add the name: `/opsx:apply fix-key-notes-enharmonic-answer`.

Plain language works too, for example "apply it" or "remove the rule about B# from the proposal".

## Terminal commands (`openspec`)

Mostly for looking at things. The agent runs the rest for you.

| Command | What it shows or does |
|---|---|
| `openspec list` | Open changes |
| `openspec list --specs` | Current specs and their requirement counts |
| `openspec list --archived` | Finished changes |
| `openspec view` | Interactive dashboard of specs and changes |
| `openspec show <name>` | Print one change or spec |
| `openspec show <change> --diff` | What a change alters in the specs |
| `openspec status --change <name>` | Which plan files exist for a change |
| `openspec validate --all --strict` | Check every spec and change for format errors |
| `openspec validate <name> --strict` | Check one change or spec |
| `openspec archive <name>` | Archive from the terminal (same as `/opsx:archive`) |
| `openspec update` | Refresh the `/opsx:*` commands in `.claude/` after upgrading OpenSpec |
| `openspec config profile` | Turn on extra workflows (new, continue, ff, verify, bulk-archive, onboard); run `openspec update` afterwards |
| `openspec --version` | Installed version |

Install or upgrade: `npm install -g @fission-ai/openspec@latest`

Turn off anonymous telemetry: add `export OPENSPEC_TELEMETRY=0` to `~/.bashrc`.

## Where things live

```text
openspec/
  config.yaml              Project rules every plan must respect
  specs/<capability>/spec.md   Source of truth: what the app does today
  changes/<name>/          One open change
    proposal.md            Why and what, plus what is out of scope
    specs/.../spec.md      The delta: requirements added, modified or removed
    design.md              How it will be built
    tasks.md               Checklist the agent follows
  changes/archive/         Finished changes
.claude/                   The /opsx:* commands and skills
docs/plan1.md, plan2.md    Historical prompts the app was first built from
```

## What to check when reviewing a plan

- `proposal.md`: is the scope right, and is anything missing from "out of scope"?
- Spec delta: does each requirement describe behaviour you actually want? This text becomes the permanent spec.
- `design.md`: any decision you disagree with?
- `tasks.md`: are the steps small, and does each say how it is verified?

## Spec format rules

`openspec validate` rejects files that break these.

- Requirements start with `### Requirement: <name>` and use SHALL or MUST.
- Every requirement has at least one `#### Scenario: <name>` (exactly four `#`).
- Scenarios use `- **WHEN** ...` and `- **THEN** ...` lines.
- Delta files group requirements under `## ADDED Requirements`, `## MODIFIED Requirements` or `## REMOVED Requirements`.
- A MODIFIED requirement must contain the full new text, not just the changed part.
