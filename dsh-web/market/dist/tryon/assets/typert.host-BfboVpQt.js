import{j as a,o as t,k as o,l as n,s as e,x as r,u as s}from"./schemas-BjdgLEE2.js";import"./json-schema-processors-6dmQcDt8.js";const i=r(e(),s()),l=e(),d=a(t({path:e(),kind:o([n("file"),n("directory")])})),p={package:"@deepseek-ai/dsh-file-reference",face:"host",schemas:[],invocations:[{id:"@deepseek-ai/dsh-file-reference#fileReferences/list",service:"fileReferences",namespace:"fileReferences",method:"list",implementation:"remoteExportList",invocation:{kind:"direct"},scope:{context:"agent",wire:"agentId"},parameters:[{name:"agent",wire:"agentId",source:"lookup",lookup:"agent",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-session/types#SessionId",schema:i}},{name:"query",wire:"query",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-file-reference#fileReferences/list:query",schema:l}}],cancellation:{parameter:"signal"},result:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-file-reference#fileReferences/list:result",schema:d},sourceLocation:{file:"packages/context/file-reference/src/index.ts",line:54,column:3}}],model:{services:[{description:"Host capability for cancellable file-reference discovery.",summary:"Host capability for cancellable file-reference discovery.",tags:[],jsDoc:"/** Host capability for cancellable file-reference discovery. */",key:"fileReferences",exportName:"FileReferenceService",members:[{kind:"method",name:"list",signature:"abstract list( agent: Agent, query: string, signal: AbortSignal, ): Promise<FileReferenceCandidate[]>",summary:"List file and directory candidates for one agent's working directory.",jsDoc:`/**
 * List file and directory candidates for one agent's working directory.
 * @param agent - target agent whose session cwd bounds discovery.
 * @param query - path text following \`@\` or \`@"\`.
 * @param signal - caller cancellation.
 * @returns deterministic path-only candidates.
 */`},{kind:"method",name:"remoteExportList",signature:"@Remote('list') remoteExportList( agent: Agent, query: string, signal: AbortSignal, ): Promise<FileReferenceCandidate[]>",summary:"Remote face of {@link list}; the decorator cannot mark the abstract member, so this concrete adapter carries the identical contract.",jsDoc:`/**
 * Remote face of {@link list}; the decorator cannot mark the abstract
 * member, so this concrete adapter carries the identical contract.
 * @param agent - target agent whose session cwd bounds discovery.
 * @param query - path text following \`@\` or \`@"\`.
 * @param signal - caller cancellation.
 * @returns deterministic path-only candidates.
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
}`},{name:"EpochHeader",declaration:`export interface EpochHeader {
    config: LlmCallConfig;
    adapterDefaults?: LlmCallConfigAdapterDefaults;
    system?: string;
    tools?: ToolSchema[];
}`},{name:"FileReferenceCandidate",declaration:`export interface FileReferenceCandidate {
    path: string;
    kind: 'file' | 'directory';
}`},{name:"FinishReason",declaration:"export type FinishReason = FinishReasonMap[keyof FinishReasonMap];"},{name:"FinishReasonMap",declaration:`export interface FinishReasonMap {
    stop: { kind: 'stop'; };
    'tool-calls': { kind: 'tool-calls'; };
    'max-tokens': { kind: 'max-tokens'; };
    aborted: { kind: 'aborted'; failure: LlmFailure; };
    error: { kind: 'error'; failure: LlmFailure; };
}`},{name:"GoalBlockReason",declaration:`export interface GoalBlockReason {
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
}`}]}],events:[],objects:[]}};export{p as TYPERT};
