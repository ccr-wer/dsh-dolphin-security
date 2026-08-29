# Agent Note: Pet murmurs follow context and the current session

Status: implemented

## Problem

The pet's inner whispers (碎碎念) did not match what the user was actually watching. The murmur engine fed on the model's streamed chunk text alone: keyword rules fired on substrings (a discussion of "error handling" woke the error mood) and an ambient pool earned by output volume played pure persona lines ("窗外鸟叫了两声") while the session worked on anything at all. Whispers also rode a GLOBAL view field bound to the host's display session — the session with the most recent meaningful event — so while the user was looking at session B, session A's whisper took over the visible bubble. Two mismatches: content-category mismatch and session-attribution mismatch.

## Decision

The murmur engine is now situation-driven and outcome-driven, and whispers are attributed per session.

- Category channel (chatter.ts WhisperCategory, ten keys): the projection feeds the situation — thinking / writing from the stream chunk kinds, and the running tool family (read/edit/write→editing, shell→running, search/web/memory→searching, git, subagent/todo→delegating, browser, …) from tool/call. No real content is ever quoted: no tool names, paths, or model text. Category cooldown stays 9 s.
- Outcome channel (WhisperResult: pass / fail / done): test green fires only from a passed test-looking tool result (the projection marks test calls at tool/call from name + command/code arguments; tool/result's message source carries only the callId), error fires from any failed tool result or an errored turn, completion from a completed turn. Outcomes never read the model's prose. Outcome cooldown is 5 s (measured against the shared last-whisper clock), so a real moment is heard unless another voice just spoke.
- The ambient volume pool and the keyword rules are removed; all pools are round-robin deterministic, voice-pack overridable per key.
- Bubble attribution (service.ts PetSessionView.whisper, pet M6): each session's whisper rides its own bubble with the same 8 s TTL; the global snapshot.whisper field is gone. The bubble stack leads with the GUI's current session (the browser half reports ctx.sessions.list.getSnapshot().current through the existing /api/pet/state poll with a ?current= query param and re-polls immediately on a session switch), falling back to the most recently active session when the current session is not reported or has no bubble. The sprite animation still follows the most recent meaningful event.
- Voice-pack contract: whispers.generic / whispers.rules are replaced by per-key whispers.categories (ten WhisperCategory keys) and whispers.results (pass / fail / done); an explicit empty array mutes that category or outcome. Legacy fields are ignored with a warning ("no longer supported"). The schema twin contracts/voice-pack-v1.schema.json is updated and drift-locked in tests.

## Alternatives considered

- Keep keyword moods but rewrite the pools (option A in discussion): rejected — the task was content-category alignment; text-substring matching could not know what the session was doing and would keep firing on prose that merely mentions a keyword.
- Quote real content in whispers (option C, e.g. file paths, tool names, the user's words) and an LLM-generated whisper channel (option D): rejected by the user in discussion — real content in the pet bubble is not wanted, and an LLM path would break the plugin's deterministic, offline, zero-cost design.
- Reorder the stack purely client-side (option 1b): rejected — the whisper would still be bound to the display session and could keep hijacking the bubble of the session the user is looking at; the host is the single source of truth for the ordering and attribution, which keeps the behavior unit-testable.
- Keep the global whisper field for compatibility: rejected — the browser and host halves ship together, and the stale field would keep the mis-attribution alive.

## Consequences

Whispers now always roughly match what the user watches and never name real objects; outcome moods can no longer mis-fire on model prose. The voice.json contract changed: packs using whispers.generic / whispers.rules keep loading (warned, ignored), but the fields no longer take effect — docs, README pairs and the schema twin are updated in the same change. The bubble stack order changes when the GUI's current session differs from the most recently active one; the sprite animation rule is unchanged. Behavior is covered by chatter tests (category rotation, outcome cooldowns, mutes), service tests (current-first ordering, per-session whisper attribution, test-green/error/completion moods), voice-pack tests (new normalizers, legacy warnings, schema drift lock) and PetSprite tests (per-bubble whispers). Live GUI verification pending a bundle reload by the user.

