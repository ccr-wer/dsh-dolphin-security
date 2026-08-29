import{o,n,x as t,u as r,s as e,k as s,l as a}from"./schemas-BjdgLEE2.js";import"./json-schema-processors-6dmQcDt8.js";const d=t(e(),r()),l=o({id:t(e(),r()).readonly(),revision:n().readonly()}),i=o({id:t(e(),r()).readonly(),revision:n().readonly()}),c=t(e(),r()),m=o({id:t(e(),r()).readonly(),revision:n().readonly()}),p=o({roundsStarted:n().readonly(),createdAt:n().readonly(),updatedAt:n().readonly(),activation:s([a("armed"),a("disarmed")]).readonly(),objective:e().readonly(),phase:s([a("active"),a("paused"),a("blocked"),a("complete")]).readonly(),blockedReason:o({code:e().readonly(),message:e().readonly()}).readonly().optional(),maxGoalRounds:n().readonly(),id:t(e(),r()).readonly(),revision:n().readonly()}),g=t(e(),r()),u=o({objective:e().readonly(),maxGoalRounds:n().readonly().optional()}),y=o({ref:o({id:t(e(),r()).readonly(),revision:n().readonly()}).readonly()}),h=t(e(),r()),k=o({id:t(e(),r()).readonly(),revision:n().readonly()}),b=o({objective:e().readonly().optional(),maxGoalRounds:n().readonly().optional()}),v=o({roundsStarted:n().readonly(),createdAt:n().readonly(),updatedAt:n().readonly(),activation:s([a("armed"),a("disarmed")]).readonly(),objective:e().readonly(),phase:s([a("active"),a("paused"),a("blocked"),a("complete")]).readonly(),blockedReason:o({code:e().readonly(),message:e().readonly()}).readonly().optional(),maxGoalRounds:n().readonly(),id:t(e(),r()).readonly(),revision:n().readonly()}),x=t(e(),r()),f=o({id:t(e(),r()).readonly(),revision:n().readonly()}),S=o({roundsStarted:n().readonly(),createdAt:n().readonly(),updatedAt:n().readonly(),activation:s([a("armed"),a("disarmed")]).readonly(),objective:e().readonly(),phase:s([a("active"),a("paused"),a("blocked"),a("complete")]).readonly(),blockedReason:o({code:e().readonly(),message:e().readonly()}).readonly().optional(),maxGoalRounds:n().readonly(),id:t(e(),r()).readonly(),revision:n().readonly()}),C=t(e(),r()),_=o({id:t(e(),r()).readonly(),revision:n().readonly()}),I=o({roundsStarted:n().readonly(),createdAt:n().readonly(),updatedAt:n().readonly(),activation:s([a("armed"),a("disarmed")]).readonly(),objective:e().readonly(),phase:s([a("active"),a("paused"),a("blocked"),a("complete")]).readonly(),blockedReason:o({code:e().readonly(),message:e().readonly()}).readonly().optional(),maxGoalRounds:n().readonly(),id:t(e(),r()).readonly(),revision:n().readonly()}),T={package:"@deepseek-ai/dsh-goal",face:"host",schemas:[],invocations:[{id:"@deepseek-ai/dsh-goal#goals/clear",service:"goals",namespace:"goals",method:"clear",invocation:{kind:"direct"},scope:{context:"agent",wire:"agentId"},parameters:[{name:"agent",wire:"agentId",source:"lookup",lookup:"agent",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-session/types#SessionId",schema:d}},{name:"ref",wire:"ref",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-goal/client#GoalRef",schema:l}}],result:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-goal/client#GoalRef",schema:i},sourceLocation:{file:"packages/goal/goal/src/index.ts",line:377,column:3}},{id:"@deepseek-ai/dsh-goal#goals/complete",service:"goals",namespace:"goals",method:"complete",invocation:{kind:"direct"},scope:{context:"agent",wire:"agentId"},parameters:[{name:"agent",wire:"agentId",source:"lookup",lookup:"agent",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-session/types#SessionId",schema:c}},{name:"ref",wire:"ref",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-goal/client#GoalRef",schema:m}}],result:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-goal/client#GoalView",schema:p},sourceLocation:{file:"packages/goal/goal/src/index.ts",line:337,column:3}},{id:"@deepseek-ai/dsh-goal#goals/create",service:"goals",namespace:"goals",method:"create",implementation:"remoteExportCreate",invocation:{kind:"direct"},scope:{context:"agent",wire:"agentId"},parameters:[{name:"agent",wire:"agentId",source:"lookup",lookup:"agent",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-session/types#SessionId",schema:g}},{name:"request",wire:"request",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-goal/client#CreateGoalRequest",schema:u}}],result:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-goal/client#CreateGoalResult",schema:y},sourceLocation:{file:"packages/goal/goal/src/index.ts",line:586,column:3}},{id:"@deepseek-ai/dsh-goal#goals/edit",service:"goals",namespace:"goals",method:"edit",invocation:{kind:"direct"},scope:{context:"agent",wire:"agentId"},parameters:[{name:"agent",wire:"agentId",source:"lookup",lookup:"agent",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-session/types#SessionId",schema:h}},{name:"ref",wire:"ref",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-goal/client#GoalRef",schema:k}},{name:"request",wire:"request",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-goal/client#EditGoalRequest",schema:b}}],result:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-goal/client#GoalView",schema:v},sourceLocation:{file:"packages/goal/goal/src/index.ts",line:277,column:3}},{id:"@deepseek-ai/dsh-goal#goals/pause",service:"goals",namespace:"goals",method:"pause",invocation:{kind:"direct"},scope:{context:"agent",wire:"agentId"},parameters:[{name:"agent",wire:"agentId",source:"lookup",lookup:"agent",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-session/types#SessionId",schema:x}},{name:"ref",wire:"ref",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-goal/client#GoalRef",schema:f}}],result:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-goal/client#GoalView",schema:S},sourceLocation:{file:"packages/goal/goal/src/index.ts",line:299,column:3}},{id:"@deepseek-ai/dsh-goal#goals/resume",service:"goals",namespace:"goals",method:"resume",invocation:{kind:"direct"},scope:{context:"agent",wire:"agentId"},parameters:[{name:"agent",wire:"agentId",source:"lookup",lookup:"agent",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-session/types#SessionId",schema:C}},{name:"ref",wire:"ref",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-goal/client#GoalRef",schema:_}}],result:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-goal/client#GoalView",schema:I},sourceLocation:{file:"packages/goal/goal/src/index.ts",line:311,column:3}}],model:{services:[{description:"Goal service (`ctx.goals`) backed exclusively by the owning session log.",summary:"Goal service (`ctx.goals`) backed exclusively by the owning session log.",tags:[],jsDoc:"/** Goal service (`ctx.goals`) backed exclusively by the owning session log. */",key:"goals",exportName:"GoalService",members:[{kind:"method",name:"get",signature:"get(agent: Agent): GoalView | undefined",summary:"Read the current goal for one exact live agent.",jsDoc:`/**
 * Read the current goal for one exact live agent.
 * @param agent - owning live agent.
 * @returns a fresh view or \`undefined\` when no goal is current.
 * @throws {@link GoalError} when the agent is not the registry's live instance.
 */`},{kind:"method",name:"disarm",signature:"disarm(agent: Agent): GoalView | undefined",summary:"Remove process-local continuation authority without changing durable goal phase or revision.",jsDoc:`/**
 * Remove process-local continuation authority without changing durable goal
 * phase or revision. Lifecycle owners use this before unloading a driver;
 * a later human-authorized {@link resume} records the new activation edge.
 * @param agent - owning live agent.
 * @returns a fresh disarmed view, or \`undefined\` when no goal is current.
 */`},{kind:"method",name:"create",signature:"create(agent: Agent, request: CreateGoalRequest): GoalView",summary:"Create and arm a goal.",jsDoc:`/**
 * Create and arm a goal. A completed goal may be replaced; every other
 * current phase must be cleared or resumed instead.
 * @param agent - owning live agent.
 * @param request - objective and optional round cap.
 * @returns the created live view.
 */`},{kind:"method",name:"edit",signature:"@Remote('edit') edit(agent: Agent, ref: GoalRef, request: EditGoalRequest): GoalView",summary:"Edit objective and/or round cap without changing phase.",jsDoc:`/**
 * Edit objective and/or round cap without changing phase.
 * @param agent - owning live agent.
 * @param ref - expected current revision.
 * @param request - at least one replacement field.
 * @returns the edited view.
 */`},{kind:"method",name:"pause",signature:"@Remote('pause') pause(agent: Agent, ref: GoalRef): GoalView",summary:"Pause an active goal and disarm automatic continuation.",jsDoc:`/**
 * Pause an active goal and disarm automatic continuation.
 * @param agent - owning live agent.
 * @param ref - expected current revision.
 * @returns the paused view.
 */`},{kind:"method",name:"resume",signature:"@Remote('resume') resume(agent: Agent, ref: GoalRef): GoalView",summary:"Resume and arm a stopped goal, or rearm an active goal after a session-start edge, while its round budget still has capacity.",jsDoc:`/**
 * Resume and arm a stopped goal, or rearm an active goal after a
 * session-start edge, while its round budget still has capacity.
 * @param agent - owning live agent.
 * @param ref - expected current revision.
 * @returns the active view.
 */`},{kind:"method",name:"complete",signature:"@Remote('complete') complete(agent: Agent, ref: GoalRef): GoalView",summary:"Mark a current non-complete goal complete and disarm it.",jsDoc:`/**
 * Mark a current non-complete goal complete and disarm it.
 * @param agent - owning live agent.
 * @param ref - expected current revision.
 * @returns the completed view.
 */`},{kind:"method",name:"block",signature:"block(agent: Agent, ref: GoalRef, reason: GoalBlockReason): GoalView",summary:"Mark an active goal blocked and disarm it.",jsDoc:`/**
 * Mark an active goal blocked and disarm it.
 * @param agent - owning live agent.
 * @param ref - expected current revision.
 * @param reason - policy-owned stable code and human-readable explanation.
 * @returns the blocked view with its durable reason.
 */`},{kind:"method",name:"clear",signature:"@Remote('clear') clear(agent: Agent, ref: GoalRef): GoalRef",summary:"Clear the current goal while retaining a durable tombstone and history.",jsDoc:`/**
 * Clear the current goal while retaining a durable tombstone and history.
 * @param agent - owning live agent.
 * @param ref - expected current revision.
 * @returns the tombstone ref whose revision is one past the cleared snapshot.
 */`},{kind:"method",name:"remoteExportCreate",signature:"@Remote('create') remoteExportCreate(agent: Agent, request: CreateGoalRequest): CreateGoalResult",summary:"Create one Goal through the remote boundary.",jsDoc:`/**
 * Create one Goal through the remote boundary.
 * @param agent - exact live Agent resolved from the wire identity.
 * @param request - objective and optional round cap.
 * @returns the created Goal identity.
 */`}],types:[{name:"Agent",declaration:`export interface Agent {
    readonly id: SessionId;
    readonly options: AgentOptions;
    readonly session: Session;
    readonly inbox: Inbox;
    readonly status: AgentStatus;
    readonly ctx: Context;
    cancel(cause: AgentCancelCause, options?: CancelOptions): void;
    whenIdle(): Promise<void>;
    runMaintenance<T>(task: (signal: AbortSignal) => Promise<T>): Promise<T>;
    send(message: UserMessage, target: InboxTarget, wakeup: boolean): void;
    followup(message: UserMessage): void;
    steer(message: UserMessage): void;
    inject(message: UserMessage): void;
}`},{name:"AgentCancelCause",declaration:"export type AgentCancelCause = { readonly kind: 'user'; } | { readonly kind: 'parent'; } | { readonly kind: 'hook'; readonly reason: string; } | { readonly kind: 'disposed'; };"},{name:"AgentOptions",declaration:`export interface AgentOptions {
    provider?: string;
    model?: string;
    maxTokens?: number;
}`},{name:"AgentStatus",declaration:"export type AgentStatus = 'idle' | 'running';"},{name:"ApprovalOutcome",declaration:"export type ApprovalOutcome = 'allowed-once' | 'rejected' | 'cancelled' | 'unavailable';"},{name:"ApprovalPolicy",declaration:"export type ApprovalPolicy = 'ask' | 'never';"},{name:"ApprovalRequestId",declaration:"export type ApprovalRequestId = Branded<'ApprovalRequestId'>;"},{name:"AssistantMessage",declaration:`export interface AssistantMessage extends Message {
    readonly role: 'assistant';
    readonly source: ModelMessageSource;
}`},{name:"AssistantProvenance",declaration:`export interface AssistantProvenance {
    provider: string;
    model: string;
    replayState?: unknown;
}`},{name:"AttachmentId",declaration:"export type AttachmentId = Branded<'AttachmentId'>;"},{name:"Branded",declaration:"export type Branded<B extends string> = string & { readonly [BRAND]: B; };"},{name:"CallId",declaration:"export type CallId = Branded<'CallId'>;"},{name:"CancelOptions",declaration:`export interface CancelOptions {
    keepInbox?: boolean | undefined;
}`},{name:"CodeDispatchEventData",declaration:`export interface CodeDispatchEventData extends CodeDispatchStartEventData {
    isError: boolean;
    content: ContentBlock[];
}`},{name:"CodeDispatchStartEventData",declaration:`export interface CodeDispatchStartEventData {
    rootCallId: CallId;
    parentCallId: CallId;
    subCallId: CallId;
    name: string;
    arguments: unknown;
}`},{name:"CommandId",declaration:"export type CommandId = Branded<'CommandId'>;"},{name:"CommandSource",declaration:"export type CommandSource = CommandSourceMap[keyof CommandSourceMap];"},{name:"CommandSourceMap",declaration:`export interface CommandSourceMap {
    user: { kind: 'user'; };
}`},{name:"CompactionId",declaration:"export type CompactionId = Branded<'CompactionId'>;"},{name:"ContentBlock",declaration:"export type ContentBlock = ContentBlockMap[ContentBlockType];"},{name:"ContentBlockMap",declaration:`export interface ContentBlockMap {
    text: TextBlock;
    reasoning: ReasoningBlock;
    image: ImageBlock;
    'tool-call': ToolCallBlock;
    'tool-result': ToolResultBlock;
}`},{name:"ContentBlockType",declaration:"export type ContentBlockType = keyof ContentBlockMap;"},{name:"ContextFormed",declaration:"export type ContextFormed = { readonly form?: never; } | { readonly form: 'instructions'; } | { readonly form: 'catalog'; } | { readonly form: 'snapshot'; readonly sections: readonly ContextSnapshotSection[]; } | { readonly form: 'notice'; readonly summary: string; } | { readonly form: 'relay'; } | { readonly form: 'recall'; };"},{name:"ContextSnapshotSection",declaration:`export interface ContextSnapshotSection {
    readonly name: string;
    readonly text: string;
}`},{name:"CreateGoalRequest",declaration:`export interface CreateGoalRequest {
    readonly objective: string;
    readonly maxGoalRounds?: number;
}`},{name:"CreateGoalResult",declaration:`export interface CreateGoalResult {
    readonly ref: GoalRef;
}`},{name:"EditGoalRequest",declaration:`export interface EditGoalRequest {
    readonly objective?: string;
    readonly maxGoalRounds?: number;
}`},{name:"EpochHeader",declaration:`export interface EpochHeader {
    config: LlmCallConfig;
    adapterDefaults?: LlmCallConfigAdapterDefaults;
    system?: string;
    tools?: ToolSchema[];
}`},{name:"FinishReason",declaration:"export type FinishReason = FinishReasonMap[keyof FinishReasonMap];"},{name:"FinishReasonMap",declaration:`export interface FinishReasonMap {
    stop: { kind: 'stop'; };
    'tool-calls': { kind: 'tool-calls'; };
    'max-tokens': { kind: 'max-tokens'; };
    aborted: { kind: 'aborted'; failure: LlmFailure; };
    error: { kind: 'error'; failure: LlmFailure; };
}`},{name:"GoalActivation",declaration:"export type GoalActivation = 'armed' | 'disarmed';"},{name:"GoalBlockReason",declaration:`export interface GoalBlockReason {
    readonly code: string;
    readonly message: string;
}`},{name:"GoalChangeMeta",declaration:"export type GoalChangeMeta = GoalSnapshotChangeMeta | GoalClearChangeMeta;"},{name:"GoalClearChangeMeta",declaration:`export interface GoalClearChangeMeta {
    readonly kind: 'goal/change';
    readonly version: 1;
    readonly operation: 'clear';
    readonly cleared: GoalRef;
    readonly clearedAt: number;
}`},{name:"GoalId",declaration:"export type GoalId = Branded<'GoalId'>;"},{name:"GoalMessageSource",declaration:`export interface GoalMessageSource {
    readonly kind: 'goal';
    readonly goalId: GoalId;
    readonly revision: number;
    readonly round: number;
}`},{name:"GoalOperation",declaration:"export type GoalOperation = 'create' | 'edit' | 'pause' | 'resume' | 'complete' | 'block' | 'clear';"},{name:"GoalPhase",declaration:"export type GoalPhase = 'active' | 'paused' | 'blocked' | 'complete';"},{name:"GoalRef",declaration:`export interface GoalRef {
    readonly id: GoalId;
    readonly revision: number;
}`},{name:"GoalSnapshot",declaration:`export interface GoalSnapshot extends GoalRef {
    readonly objective: string;
    readonly phase: GoalPhase;
    readonly blockedReason?: GoalBlockReason;
    readonly maxGoalRounds: number;
}`},{name:"GoalSnapshotChangeMeta",declaration:`export interface GoalSnapshotChangeMeta {
    readonly kind: 'goal/change';
    readonly version: 1;
    readonly operation: Exclude<GoalOperation, 'clear'>;
    readonly goal: GoalSnapshot;
    readonly roundsStarted: number;
    readonly createdAt: number;
    readonly updatedAt: number;
}`},{name:"GoalView",declaration:`export interface GoalView extends GoalSnapshot {
    readonly roundsStarted: number;
    readonly createdAt: number;
    readonly updatedAt: number;
    readonly activation: GoalActivation;
}`},{name:"ImageAttachmentRef",declaration:`export interface ImageAttachmentRef {
    attachmentId: AttachmentId;
    mediaType: ImageMediaType;
    bytes: number;
    width: number;
    height: number;
    name?: string;
    originalDimensions?: { width: number; height: number; };
}`},{name:"ImageBlock",declaration:`export interface ImageBlock {
    type: 'image';
    attachment: ImageAttachmentRef;
}`},{name:"ImageMediaType",declaration:"export type ImageMediaType = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif';"},{name:"Inbox",declaration:`export class Inbox {
    get nextTurn(): readonly UserMessage[];
    get nextStep(): readonly UserMessage[];
    get hasPending(): boolean;
    clear(): void;
    claim(target: InboxTarget, turn: number): UserMessage[];
    append(target: InboxTarget, message: UserMessage): void;
    prepend(target: InboxTarget, message: UserMessage): void;
    replace(messageId: MessageId, newMessage: UserMessage): boolean;
    remove(messageId: MessageId): boolean;
    splice(target: InboxTarget, start: number, deleteCount: number, inserted: UserMessage[]): UserMessage[];
}`},{name:"InboxTarget",declaration:"export type InboxTarget = 'next-turn' | 'next-step';"},{name:"JsonValue",declaration:"export type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue; };"},{name:"LlmCallConfig",declaration:`export interface LlmCallConfig {
    provider: string;
    model: string;
    reasoningEffort?: ReasoningEffortId;
    temperature?: number;
    maxTokens?: number;
    stop?: string[];
}`},{name:"LlmCallConfigAdapterDefaults",declaration:`export interface LlmCallConfigAdapterDefaults {
    reasoningEffort?: true;
    maxTokens?: true;
}`},{name:"LlmFailure",declaration:`export interface LlmFailure {
    readonly message: string;
    readonly code: string;
    readonly status?: number;
    readonly providerRetryAfterMs?: number;
    readonly requestId?: ProviderRequestId;
}`},{name:"Message",declaration:`export interface Message {
    readonly id: MessageId;
    readonly role: 'system' | 'user' | 'assistant';
    readonly content: ContentBlock[];
    readonly source: MessageSource;
}`},{name:"MessageId",declaration:"export type MessageId = Branded<'MessageId'>;"},{name:"MessageSource",declaration:"export type MessageSource = MessageSourceMap[keyof MessageSourceMap];"},{name:"MessageSourceMap",declaration:`export interface MessageSourceMap {
    user: { kind: 'user'; };
    plugin: { kind: 'plugin'; plugin: string; } & ContextFormed;
    model: ModelMessageSource;
    tool: ToolMessageSource;
    goal: GoalMessageSource;
    'session-reference': SessionReferenceSource;
}`},{name:"ModelMessageSource",declaration:`export interface ModelMessageSource extends AssistantProvenance {
    kind: 'model';
}`},{name:"ProviderRequestId",declaration:"export type ProviderRequestId = Branded<'ProviderRequestId'>;"},{name:"ReasoningBlock",declaration:`export interface ReasoningBlock {
    type: 'reasoning';
    text: string;
}`},{name:"ReasoningEffortId",declaration:"export type ReasoningEffortId = Branded<'ReasoningEffortId'>;"},{name:"ReplayEnvelope",declaration:`export interface ReplayEnvelope {
    response: unknown;
    blocks?: readonly unknown[];
}`},{name:"RequestContext",declaration:`export interface RequestContext {
    provider: string;
    model: string;
    contextWindow?: number;
}`},{name:"RequestHeaderReason",declaration:"export type RequestHeaderReason = 'initial' | 'resume' | 'change';"},{name:"Session",declaration:`export class Session {
    get surface(): SessionSurface;
    readonly header: SessionHeader;
    get id(): SessionId;
    readonly firstLiveSeq: number;
    get events(): readonly SessionEvent[];
    get seq(): number;
    append<T extends SessionEventType>(type: T, data: SessionEventMap[T], ...opts: T extends SurfaceEventType ? [opts: SurfaceIntent] : []): SessionEvent<T>;
    requestHeader(): EpochHeader | undefined;
    requestContext(): RequestContext | undefined;
    deriveMessages(): Message[];
    deriveEventMessage(event: SessionEvent): Message | null;
}`},{name:"SessionEvent",declaration:"export type SessionEvent<T extends SessionEventType = SessionEventType> = { [K in SessionEventType]: { type: K; seq: number; time: number; data: SessionEventMap[K]; ignorable?: true; } & (K extends SurfaceEventType ? { sourceEventSeqs?: number[]; surfaceOp?: SurfaceOp; } : object) }[T];"},{name:"SessionEventMap",declaration:`export interface SessionEventMap {
    'turn/start': { turn: number; };
    'turn/end': { turn: number; reason: TurnEndReason; };
    'step/start': { turn: number; step: number; };
    'step/end': { turn: number; step: number; };
    'user/message': UserMessage;
    'assistant/chunk': { turn: number; step: number; chunk: StreamChunk; };
    'assistant/message': { turn: number; step: number; message: AssistantMessage; usage?: TokenUsage; interrupted?: true; };
    'tool/call': { turn: number; step: number; callId: CallId; name: string; arguments: string; };
    'tool/result': { turn: number; step: number; message: ToolResultMessage; error?: { name: string; code: string; }; meta?: JsonValue; };
    'todo/write': { todos: TodoItem[]; };
    'request/header': { header: EpochHeader; reason: RequestHeaderReason; };
    'request/context': RequestContext;
    'session/end-seed': Record<string, never>;
    'agent/inbox/spliced': { target: InboxTarget; start: number; removedCount?: number; inserted: UserMessage[]; outcome?: 'canceled'; };
    'command/run': { commandId: CommandId; name: string; args?: string; source: CommandSource; };
    'command/done': { commandId: CommandId; kind: 'success' | 'error'; text?: string; sourceEventSeq?: number; };
    'approval/asked': { id: ApprovalRequestId; toolName: string; callId?: CallId; reason?: string; };
    'approval/decided': { id: ApprovalRequestId; outcome: ApprovalOutcome; };
    'approval/policy': { policy: ApprovalPolicy; source?: 'delegation'; };
    'tool/code-dispatch-start': CodeDispatchStartEventData;
    'tool/code-dispatch': CodeDispatchEventData;
    'goal/change': GoalChangeMeta;
    'session/title': SessionTitleEventData;
    'compaction/start': { compactionId: CompactionId; sourceCommandId?: CommandId; turn: number | null; };
    'compaction/summary': { compactionId: CompactionId; sourceCommandId?: CommandId; summary: ContentBlock[]; shadowedRange: { start: number; end: number; }; shadowedSeqs: number[]; shadowedTokenCount: number; provider: string; model: string; maxTokens?: number; usage?: TokenUsage; } & ({ rawOutput: ContentBlock[]; llmStreamCall: true; } | { rawOutput?: ContentBlock[]; llmStreamCall?: never; });
    'compaction/end': { compactionId: CompactionId; sourceCommandId?: CommandId; turn: number | null; error?: string; };
    'compaction/prune': { shadowedRange: { start: number; end: number; }; shadowedSeqs: number[]; shadowedTokenCount: number; };
}`},{name:"SessionEventType",declaration:"export type SessionEventType = keyof SessionEventMap;"},{name:"SessionHeader",declaration:`export interface SessionHeader {
    readonly version: number;
    readonly id: SessionId;
    readonly createdAt: number;
    readonly cwd?: string;
    readonly parentSession?: SessionId;
    readonly seedLength?: number;
    readonly origin?: 'subagent';
    readonly delegationDepth?: number;
    readonly agentPreset?: string;
}`},{name:"SessionId",declaration:"export type SessionId = Branded<'SessionId'>;"},{name:"SessionReferenceSource",declaration:`export interface SessionReferenceSource {
    kind: 'session-reference';
    form: 'recall';
    version: 1;
    references: { sessionId: string; label: string; capturedThroughSeq: number | null; compacted: boolean; originalMessages: number; retainedMessages: number; omittedMessages: number; omittedBytes: number; truncated: boolean; inputIndex: number; }[];
}`},{name:"SessionSurface",declaration:`export interface SessionSurface {
    readonly nodes: readonly number[];
    readonly replaceGeneration: number;
}`},{name:"SessionTitleEventData",declaration:`export interface SessionTitleEventData {
    readonly title: string;
    readonly messageSeqs: number[];
    readonly source: SessionTitleSource;
}`},{name:"SessionTitleModelProvenance",declaration:`export interface SessionTitleModelProvenance {
    readonly provider: string;
    readonly model: string;
}`},{name:"SessionTitleProviderId",declaration:"export type SessionTitleProviderId = Branded<'SessionTitleProviderId'>;"},{name:"SessionTitleSource",declaration:"export type SessionTitleSource = { readonly kind: 'fallback'; } | { readonly kind: 'provider'; readonly provider: SessionTitleProviderId; readonly model?: SessionTitleModelProvenance; } | { readonly kind: 'user'; };"},{name:"StreamChunk",declaration:"export type StreamChunk = { type: 'block-start'; index: number; blockType: ContentBlockType; } | { type: 'text-delta'; index: number; text: string; } | { type: 'reasoning-delta'; index: number; text: string; } | { type: 'tool-call-delta'; index: number; id: CallId; name?: string; argumentsDelta: string; } | { type: 'block-end'; index: number; block: ContentBlock; } | { type: 'usage'; usage: TokenUsage; } | { type: 'finish'; reason: FinishReason; replayState?: ReplayEnvelope; };"},{name:"SurfaceEventType",declaration:"export type SurfaceEventType = 'user/message' | 'assistant/message' | 'tool/result';"},{name:"SurfaceIntent",declaration:`export interface SurfaceIntent {
    surfaceOp: SurfaceOp;
    sourceEventSeqs?: number[];
}`},{name:"SurfaceOp",declaration:"export type SurfaceOp = 'append' | { op: 'replace'; start: number; end: number; };"},{name:"TextBlock",declaration:`export interface TextBlock {
    type: 'text';
    text: string;
}`},{name:"TodoItem",declaration:`export interface TodoItem {
    content: string;
    status: 'pending' | 'in_progress' | 'completed';
}`},{name:"TokenUsage",declaration:`export interface TokenUsage {
    inputTokens: number;
    outputTokens: number;
    cacheReadTokens?: number;
    cacheWriteTokens?: number;
    reasoningTokens?: number;
}`},{name:"ToolCallBlock",declaration:`export interface ToolCallBlock {
    type: 'tool-call';
    id: CallId;
    name: string;
    arguments: string;
}`},{name:"ToolMessageSource",declaration:`export interface ToolMessageSource {
    kind: 'tool';
    callId: CallId;
}`},{name:"ToolResultBlock",declaration:`export interface ToolResultBlock {
    type: 'tool-result';
    toolCallId: CallId;
    content: ContentBlock[];
    isError?: boolean;
}`},{name:"ToolResultMessage",declaration:`export interface ToolResultMessage extends Message {
    readonly role: 'user';
    readonly content: [ToolResultBlock];
    readonly source: ToolMessageSource;
}`},{name:"ToolSchema",declaration:`export interface ToolSchema {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
}`},{name:"TurnEndCancelCause",declaration:"export type TurnEndCancelCause = AgentCancelCause | { readonly kind: 'legacy'; };"},{name:"TurnEndReason",declaration:"export type TurnEndReason = TurnEndReasonMap[keyof TurnEndReasonMap];"},{name:"TurnEndReasonMap",declaration:`export interface TurnEndReasonMap {
    completed: { kind: 'completed'; };
    aborted: { kind: 'aborted'; reason: TurnEndCancelCause; };
    blocked: { kind: 'blocked'; };
    error: { kind: 'error'; error: LlmFailure; };
    'max-tokens': { kind: 'max-tokens'; };
    interrupted: { kind: 'interrupted'; };
}`},{name:"UserMessage",declaration:`export interface UserMessage extends Message {
    readonly role: 'user';
}`}]}],events:[{description:"Goal mutation accepted by one live agent. The matching `goal/change` session event has already committed. Listener failures are contained. Scope-filtered dispatch (`@deepseek-ai/dsh-scope`): agent-scoped listeners receive only that agent.",summary:"Goal mutation accepted by one live agent.",tags:[{name:"param",argument:"payload.agent",comment:"- agent whose session owns the goal.",text:`@param payload.agent - agent whose session owns the goal.
     *`},{name:"param",argument:"payload.change",comment:"- fresh current projection or clear tombstone.",text:`@param payload.change - fresh current projection or clear tombstone.
     *`},{name:"mode",comment:"emit",text:"@mode emit"}],jsDoc:`/**
 * Goal mutation accepted by one live agent. The matching \`goal/change\`
 * session event has already committed. Listener failures are contained.
 * Scope-filtered dispatch (\`@deepseek-ai/dsh-scope\`): agent-scoped listeners receive only that agent.
 * @param payload.agent - agent whose session owns the goal.
 * @param payload.change - fresh current projection or clear tombstone.
 * @mode emit
 */`,name:"goal/changed",mode:"emit",signature:"'goal/changed'(this: import('@deepseek-ai/dsh-scope').Scoped<Agent>, payload: { agent: Agent; change: GoalChanged; }): void"}],objects:[]}};export{T as TYPERT};
