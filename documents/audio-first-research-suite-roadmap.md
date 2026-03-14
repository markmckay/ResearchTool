# Audio-First Research Suite Roadmap

Date: March 13, 2026

## Purpose

This document turns the current product idea into a practical roadmap for an audio-first research tool suite. The suite is aimed first at a PhD researcher with low-vision and accessibility needs, but the broader product thesis is more ambitious:

Researchers should be able to discover, review, understand, annotate, synthesize, and draft academic work through speech and audio-first interaction, with text acting as support rather than the primary mode.

The near-term goal is not full automation. The goal is to create a trustworthy, efficient workflow where the system handles reading labor and interface burden while the researcher stays in control of scholarly judgment.

## Product Thesis

Most academic tools are built around visually scanning dense interfaces, opening PDFs, and manually moving information between search tools, reading tools, notes, and writing environments.

This suite should instead be built around a different assumption:

- the user may prefer listening over reading
- the user may prefer dictation over typing
- the user may need large targets, low visual clutter, and predictable focus behavior
- the user still needs rigorous citation grounding, traceability, and reusable notes

The core thesis is:

An audio-first research environment can make literature review faster, less fatiguing, and more accessible without reducing rigor.

## Suite Overview

The suite can be understood as four connected products.

### 1. Literature Search and Triage

This is the current wedge product.

Its job is to:

- search across scholarly sources
- present compact, high-signal results
- support very fast keep/reject/defer decisions
- save papers into a persistent research library
- attach statuses, tags, and lightweight notes at the moment of triage

This product should optimize for speed, clarity, and low cognitive load.

### 2. Spoken Reader

This is the deep reading and note capture environment.

Its job is to:

- open a paper and turn it into speech on demand
- navigate the paper structurally through headings, paragraphs, sections, references, tables, and figures when possible
- let the user pause, replay, slow down, skip, or loop
- allow in/out points around specific spans
- support multiple note types tied to exact source locations

This product should optimize for orientation, trust, and durable note capture.

### 3. Research Memory Layer

This is the shared data model across the suite.

Its job is to store:

- paper metadata
- triage states
- tags
- user notes
- anchored excerpts and clips
- chapter or project relevance
- synthesis artifacts
- provenance links back to exact source locations

Without this layer, the suite becomes a set of disconnected tools. With it, the search app, reader, and writer become a coherent workflow.

### 4. Voice-First Writing Tool

This is the synthesis and drafting environment.

Its job is to:

- bring in notes, citations, and excerpts from the research memory layer
- let the user draft with speech
- help organize notes into arguments, sections, and paragraphs
- keep citations attached to generated or transformed text

This product should optimize for flow, structure, and confidence that the writing remains grounded in source material.

## Long-Term Vision

The long-term vision is a speech-driven research agent layer that can operate across all of the above.

That layer would help the user say things like:

- "Find recent papers on accessible AI writing tools."
- "Read me the most relevant results first."
- "Save anything about low-vision workflows and tag it chapter two."
- "Open the third paper in the spoken reader."
- "Create a summary of my notes on methods papers from this month."
- "Draft a literature review paragraph using only the papers I marked foundational."

The key constraint is that the agent should remain evidence-grounded and controllable. It should help orchestrate work, not silently take over scholarly judgment.

## Product Positioning

This suite should not be positioned as a general AI productivity tool.

It should be positioned as:

An audio-first research environment for rigorous literature work.

That is a better category because it differentiates the product from:

- reference managers that focus on citation storage
- AI answer engines that obscure provenance
- accessibility add-ons that retrofit speech onto screen-first products

The strongest framing is:

This is not a reader with text-to-speech. It is a research workflow designed from the ground up for spoken interaction, listening, and source-grounded synthesis.

## Core Design Principles

### Audio-First, Not Audio-Only

Audio should be the primary interaction mode, but text should remain available as confirmation, orientation, and audit trail.

Users often want visible confirmation that the system heard correctly, attached a note in the right place, or cited the right source. Text is a support layer, not the center of gravity.

### User Stays in Intellectual Control

The system can summarize, queue, rank, and structure, but it should not make hidden scholarly decisions.

Users should always be able to inspect:

- where a claim came from
- why a paper was surfaced
- which notes support a synthesis artifact
- whether something is direct source content or AI-generated interpretation

### Minimize Interface Burden

The interface should reduce scanning, clutter, mode switching, and precision clicking.

That means:

- compact high-signal result layouts
- large targets
- predictable focus movement
- strong keyboard support
- command-like voice interactions for common actions

### Every Important Action Needs Provenance

Notes, summaries, extracted claims, and draft text should all link back to source papers and, when possible, source spans.

This is essential for academic trust and later writing.

### Interruptible and Resumable by Default

Audio workflows need excellent state management.

The user should always be able to:

- pause and resume
- go back to the last listened section
- repeat the current chunk
- resume a prior session
- find unfinished papers and unresolved notes

## End-to-End Workflow

The suite should eventually support a full spoken workflow:

1. The user dictates a research question or search request.
2. The search app returns ranked results with compact spoken and visual summaries.
3. The user gives spoken triage commands such as save, reject, defer, tag, or summarize.
4. A selected paper opens in the spoken reader.
5. The user listens section by section, attaches notes, and creates anchored clips.
6. Notes and clips are stored in the research memory layer.
7. The writing tool pulls in those artifacts for synthesis and drafting.
8. The agent layer helps the user query, compare, and reorganize materials through speech.

## Roadmap

## Phase 1: Make Search and Triage Excellent

Primary goal:
Turn the current search app into a durable triage tool that users can rely on daily.

Recommended features:

- persistent saved library
- triage statuses such as inbox, skim, read, foundational, maybe, exclude
- optional exclusion reasons
- lightweight tags
- one-line "why this matters" note per paper
- saved filters and smart views
- stronger deduplication and metadata normalization
- source filters, year filters, and sort controls
- reliable keyboard navigation
- spoken feedback for state changes

Why this first:

This is the most immediate value layer and the cleanest bridge to the spoken reader. It also produces the paper state that the rest of the suite will depend on.

Success criteria:

- a user can process a large result set quickly
- triage state is preserved across sessions
- saved papers are easy to revisit by tag, status, or source
- the user can work mostly without precision visual scanning

## Phase 2: Build the Spoken Reader Around Anchored Notes

Primary goal:
Turn listening into a serious scholarly reading workflow.

Recommended features:

- paper import or handoff from search app
- chunked speech generation with buffering
- section-aware navigation
- play, pause, slower, faster, repeat, skip, jump to heading
- note capture at current playback location
- in/out points for clips or excerpts
- multiple note types such as summary note, quote note, critique note, method note, chapter relevance note
- visible and spoken confirmation of note anchoring
- resume where you left off

Why this second:

This is the core product differentiator. If it works well, the suite becomes much more than search plus TTS.

Success criteria:

- a user can get through a paper without opening the original PDF for most tasks
- notes remain anchored and reusable
- the user maintains orientation while listening
- the system feels dependable during long sessions

## Phase 3: Add the Shared Research Memory Layer

Primary goal:
Unify the search app, spoken reader, and future writing tool around one durable model.

Recommended features:

- shared persistent store
- normalized paper identities across sources
- notes and clips linked to papers and source spans
- project or chapter grouping
- timeline of activity
- saved research views such as unread foundational papers or methods papers for chapter three

Why this third:

Once multiple tools exist, data fragmentation becomes the biggest product risk. This layer prevents that.

Success criteria:

- a paper saved in search is immediately available in the reader
- reader notes can be surfaced in the writing environment
- users can recover project context after time away

## Phase 4: Build the Voice-First Writing Workflow

Primary goal:
Let the user transform research notes into structured academic writing through speech.

Recommended features:

- pull notes and clips into a draft workspace
- filter notes by tag, chapter, paper, method, theme, or date
- outline creation by voice
- citation-aware drafting support
- comparison views such as compare findings across tagged papers
- export paths into the writing application

Why this fourth:

The writing experience becomes much more powerful once the suite already captures triage decisions and anchored reading notes.

Success criteria:

- a user can draft a literature review section from their accumulated notes
- citations remain attached to claims
- writing feels faster without losing scholarly confidence

## Phase 5: Add an Evidence-Grounded Voice Agent

Primary goal:
Provide conversational orchestration across the suite.

Recommended features:

- spoken command interpretation
- context-aware actions across search, reader, and writing
- source-grounded summaries and comparisons
- safe automation for repetitive tasks
- clear distinction between retrieved facts, source excerpts, and generated synthesis

Why this last:

Agent behavior is most useful when it has a structured substrate to act on. Without stable paper state, notes, and provenance, the agent risks becoming impressive but unreliable.

Success criteria:

- users can accomplish common research tasks conversationally
- the system remains inspectable and trustworthy
- the agent saves time without creating confusion

## What To Prioritize Immediately

If only a small number of features are added next, the best sequence is:

1. persistent paper state
2. triage statuses
3. tags
4. one-line notes
5. saved filters and smart views
6. strong keyboard and spoken confirmation

This is the minimum platform for all later work.

## Recommended Information Model

At a high level, each paper should support:

- stable id
- title
- authors
- year
- venue
- source
- abstract
- doi or canonical link
- pdf link when available
- triage status
- tags
- short note
- project or chapter association
- read state
- timestamps

Reader-specific records should support:

- source span or playback anchor
- note type
- note body
- clip start and end
- confidence or importance marker if useful

This model is more important than it may seem. Good product behavior later depends on having reliable, reusable paper state now.

## UX Implications

### For Search and Triage

- keep the compact result row as a first-class view
- make status assignment as fast as bookmarking is now
- let the user operate result lists with keyboard or voice commands
- expose only the metadata needed for first-pass judgment
- support quick spoken actions like "save this", "mark maybe", or "read summary"

### For the Spoken Reader

- orient the user constantly: paper, section, chunk, progress
- make transport controls extremely simple
- confirm all note capture with both audio and visible text
- design for long sessions, not demos

### For the Writing Tool

- make note retrieval easy
- keep citations visible and inspectable
- show whether a sentence is based on a direct note, source quote, or generated synthesis

## Risks and Constraints

### Trust Risk

If the system summarizes or synthesizes without clear provenance, academic users will not trust it.

### Orientation Risk

In audio workflows, it is easy for users to lose their place. Structural navigation and resumability are essential.

### Over-Automation Risk

A fully agentic experience may sound attractive but can become opaque. The system should expose its reasoning and actions clearly.

### Fatigue Risk

Listening is powerful, but long sessions can be tiring. Chunking, speed control, repetition, and mixed-modality support matter.

### Data Fragmentation Risk

If search, reading, and writing each maintain separate state, the suite will feel brittle and duplicative.

## Product Strategy Summary

The strongest path is:

- use the current search tool as the wedge
- make triage and organization durable
- build the spoken reader around anchored note capture
- unify everything through a shared research memory layer
- then build the writing and agent layers on top

This sequence creates a strong foundation and avoids chasing a science-fiction interface before the underlying workflow is trustworthy.

## One-Sentence Vision

Help researchers do rigorous literature work through listening, speaking, and source-grounded synthesis rather than visually intensive document handling.

