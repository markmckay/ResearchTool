# Shared Data Model and Sync Strategy

Date: March 13, 2026

## Why This Document Exists

The suite is starting to take shape as multiple apps:

- a literature search and triage tool
- Spoken Text Reader on iOS
- Spoken Text Writer on macOS
- a lightweight notes surface on iOS

If these products evolve without a shared data model, the result will be duplication, brittle sync behavior, and product drift.

This document defines the backbone that should stay stable as the product suite grows.

It is especially important because the suite is being built first for a researcher with a print disability who needs:

- low-friction access to papers
- audio-first interaction
- durable note capture
- low visual overhead
- reliable recovery across devices and sessions

The goal is not just sync.

The goal is continuity of scholarly work across search, listening, note taking, and writing.

## Strategic Principle

The suite should be:

- local-first
- sync-enabled
- provider-agnostic internally
- source-grounded
- resilient to interruptions

That means the apps should not think in terms of "files in iCloud" as the product model.

They should think in terms of structured research objects that can be stored locally, synced through iCloud first, and later bridged to other storage layers such as OneDrive.

## Product Requirement

The following must feel true to the user:

- a paper saved in Search is the same paper opened in Reader
- a note captured in Reader is available in Writer
- a clip made while listening can later support synthesis and citation
- tags, statuses, and project associations remain consistent across apps
- unfinished work can be resumed without hunting for state

If that continuity is missing, the suite will feel like separate apps instead of one research environment.

## Core Model Overview

The shared model should center on a small number of durable entities:

1. `Paper`
2. `PaperSource`
3. `Project`
4. `Tag`
5. `TriageState`
6. `ReadingSession`
7. `Anchor`
8. `Note`
9. `Clip`
10. `CitationLink`
11. `DraftReference`
12. `SyncRecord`

These should be stable even as UI and features change.

## 1. Paper

This is the canonical representation of a scholarly work inside the suite.

Recommended fields:

- `paperId`
- `canonicalTitle`
- `normalizedTitle`
- `authors`
- `year`
- `venue`
- `abstract`
- `doi`
- `url`
- `pdfUrl`
- `publicationType`
- `language`
- `citationCount`
- `createdAt`
- `updatedAt`

Guidance:

- `paperId` should be an internal stable identifier.
- `normalizedTitle` helps deduplication across providers.
- A paper should exist once in the local model even if it appears from multiple APIs.

## 2. PaperSource

This tracks where the paper came from externally.

Recommended fields:

- `paperSourceId`
- `paperId`
- `provider`
- `externalId`
- `retrievedAt`
- `sourceRank`
- `rawMetadataVersion`

Why this matters:

The same paper may come from OpenAlex, Semantic Scholar, arXiv, IEEE, or later other providers. Keeping source records separate from the canonical paper keeps the model clean.

## 3. Project

A project is the user’s working context.

Examples:

- dissertation
- chapter 2
- methods review
- comprehensive exam topic

Recommended fields:

- `projectId`
- `name`
- `description`
- `createdAt`
- `updatedAt`
- `status`

Why this matters:

The suite should organize work around real academic goals, not just a flat library of papers.

## 4. Tag

Tags are lightweight labels for user-defined organization.

Recommended fields:

- `tagId`
- `name`
- `color` if useful
- `createdAt`

Examples:

- foundational
- methods
- critique
- chapter-2
- accessibility

## 5. TriageState

This represents the paper’s current decision state in the workflow.

Recommended values:

- `inbox`
- `maybe`
- `skim`
- `read`
- `foundational`
- `exclude`
- `archived`

Optional fields:

- `reason`
- `changedAt`
- `changedBy`

This should be a first-class model object, not just a UI flag.

## 6. ReadingSession

This captures the user’s interaction history with a paper in the spoken reader.

Recommended fields:

- `readingSessionId`
- `paperId`
- `startedAt`
- `lastActiveAt`
- `lastAnchorId`
- `playbackRate`
- `voiceId`
- `status`

Why this matters:

Audio-first reading depends on resumability. The system should remember where the user was and how they were listening.

## 7. Anchor

An anchor identifies a precise location in a paper.

This is one of the most important objects in the suite.

Recommended fields:

- `anchorId`
- `paperId`
- `anchorType`
- `sectionLabel`
- `sectionIndex`
- `paragraphIndex`
- `charStart`
- `charEnd`
- `audioStartMs`
- `audioEndMs`
- `sourceLocator`

Examples of `anchorType`:

- section
- paragraph
- sentence
- figure
- table
- reference

Why this matters:

Notes, clips, playback position, and later citations all depend on reliable anchors.

## 8. Note

Notes are user-authored research thoughts tied to papers and often to anchors.

Recommended fields:

- `noteId`
- `paperId`
- `projectId`
- `anchorId` nullable
- `noteType`
- `body`
- `createdAt`
- `updatedAt`
- `importance`
- `origin`

Recommended `noteType` values:

- summary
- quote
- critique
- method
- theory
- finding
- chapter-relevance
- task

Recommended `origin` values:

- typed
- dictated
- generated-from-voice
- generated-from-selection

Why this matters:

Different note types support later synthesis better than one undifferentiated note pile.

## 9. Clip

A clip is a bounded excerpt or playback segment tied to anchors.

Recommended fields:

- `clipId`
- `paperId`
- `startAnchorId`
- `endAnchorId`
- `label`
- `createdAt`
- `clipType`

Example `clipType` values:

- key-passage
- methods-section
- quote-candidate
- review-later

Why this matters:

Clips create a bridge between listening and structured reuse.

## 10. CitationLink

This links user notes or draft artifacts back to source evidence.

Recommended fields:

- `citationLinkId`
- `paperId`
- `anchorId`
- `linkedObjectType`
- `linkedObjectId`
- `citationText`

This helps maintain scholarly trust and later export behavior.

## 11. DraftReference

This connects research memory to the writing environment.

Recommended fields:

- `draftReferenceId`
- `projectId`
- `paperId`
- `noteId` nullable
- `clipId` nullable
- `draftSection`
- `role`

Example `role` values:

- background
- method-comparison
- supporting-evidence
- counterpoint
- quote-candidate

This object keeps Writer grounded in actual research artifacts.

## 12. SyncRecord

This tracks sync behavior for each object without polluting the domain model.

Recommended fields:

- `syncRecordId`
- `entityType`
- `entityId`
- `localVersion`
- `remoteVersion`
- `lastSyncedAt`
- `syncStatus`
- `conflictState`

Why this matters:

Sync should be inspectable and recoverable.

## Relationships That Must Be Preserved

The most important relationships are:

- `Paper` to many `PaperSource`
- `Paper` to many `Note`
- `Paper` to many `Clip`
- `Paper` to many `ReadingSession`
- `Project` to many `Paper`
- `Project` to many `Note`
- `Anchor` to many `Note`
- `Anchor` to many `Clip`
- `Note` and `Clip` to many `CitationLink`

This is the real product architecture. The UI sits on top of these relationships.

## Identity and Deduplication Strategy

This should be defined early because it will affect every app.

Recommended order of identity confidence:

1. DOI match
2. trusted external id match
3. normalized title plus author overlap plus year proximity
4. manual merge if needed

Guidelines:

- never assume every provider record is distinct
- keep external provider identities separate from internal paper identity
- preserve provenance when merging duplicates

## Notes on Anchors

Anchors are likely to become the hardest technical and UX problem in the suite.

That is because they must support:

- playback resume
- note placement
- clip boundaries
- source-grounded synthesis
- eventually quote and citation support

The early version does not need perfect universal anchoring.

It does need a simple, reliable scheme.

For version one, it is reasonable to anchor primarily to:

- section
- paragraph
- character range within paragraph

That is enough to support strong product behavior without over-engineering.

## Local Storage Strategy

Recommended principle:

Every app should be usable from a local store first.

This enables:

- fast interaction
- offline use
- less fragile sync behavior
- better perceived reliability

The local store should be the source of immediate truth for the device. Sync should reconcile changes, not define the user experience.

## Sync Strategy

Recommended approach:

### Phase 1

- local-only persistence where needed
- export capability
- single-device reliability

### Phase 2

- iCloud-backed sync for core entities
- conflict-safe syncing for paper state, notes, clips, and sessions

### Phase 3

- optional provider abstraction for other backends
- OneDrive import/export or sync bridge where valuable

The critical design choice is:

The domain model should not depend on iCloud-specific semantics.

## Sync Conflict Strategy

Conflicts are especially likely in notes and reading progress.

Recommended rules:

- favor append behavior for notes where possible
- avoid destructive merging
- use latest-write-wins only for low-risk preferences
- track unresolved conflicts explicitly if needed

For example:

- two notes created independently should both survive
- playback position can safely take most recent timestamp
- tag edits may need merge semantics
- triage state changes should preserve history if conflict occurs

## Minimum Audit Trail

For academic trust and user confidence, the suite should retain lightweight history for:

- triage state changes
- note creation and updates
- clip creation
- project assignments

This does not need to become enterprise compliance. It just needs enough continuity that the user can understand what happened.

## Export Strategy

Export matters from the beginning.

Recommended export targets over time:

- Markdown summaries
- structured JSON export
- DOCX export for selected outputs
- bibliographic export when useful

Why:

- users need to trust they are not trapped
- writing workflows often involve external tools
- export becomes especially important if the suite later grows into a company

## Privacy and Sensitivity

The suite may eventually process:

- unpublished notes
- research ideas
- sensitive disability-related workflow data
- reading histories
- generated synthesis content

That means the architecture should assume privacy matters even if the first user is only one person.

Good defaults:

- local-first storage
- clear sync boundaries
- explicit export behavior
- visible provenance for generated content

## How This Supports Accessibility

A strong data model is not separate from accessibility.

It enables:

- resumable audio sessions
- reliable recovery after interruption
- quick recall of unfinished items
- low-friction cross-device continuation
- reduced need to visually re-orient after every context switch

For a researcher with a print disability, these are not convenience features. They are access features.

## Recommended Immediate Implementation Priorities

Before the suite branches too far, I would lock down these objects first:

1. `Paper`
2. `PaperSource`
3. `TriageState`
4. `Tag`
5. `Project`
6. `Note`
7. `Anchor`
8. `ReadingSession`

That is the smallest strong core.

## What To Avoid

- storing everything as app-specific blobs
- treating PDFs as the product model
- tying note identity to one UI surface
- making sync logic define domain logic
- creating separate paper records per app
- skipping export because sync feels "good enough"

## Final Recommendation

Think of the suite as one research memory system with multiple interfaces:

- Search helps decide what matters
- Reader helps consume and annotate it through audio
- Notes helps capture and review thought
- Writer helps turn it into academic output

The shared data model is the product backbone that makes this believable.

If that backbone is strong, Apple-first delivery will be a strength.
If that backbone is weak, the suite will fragment no matter how polished each app looks on its own.

