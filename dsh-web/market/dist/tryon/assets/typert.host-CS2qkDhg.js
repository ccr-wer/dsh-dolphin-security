import{o as t,x as a,u as r,s as n,j as s,k as o,l as e,m as d,n as c,t as i,r as l}from"./schemas-BjdgLEE2.js";import"./json-schema-processors-6dmQcDt8.js";const u=o([e(null),n(),c(),e(!1),e(!0),s(i(()=>u)),l(n(),i(()=>u))]),m=o([e(null),n(),c(),e(!1),e(!0),s(i(()=>m)),l(n(),i(()=>m))]),p=o([e(null),n(),c(),e(!1),e(!0),s(i(()=>p)),l(n(),i(()=>p))]),g=o([e(null),n(),c(),e(!1),e(!0),s(i(()=>g)),l(n(),i(()=>g))]),y=a(n(),r()),h=a(n(),r()),C=a(n(),r()),k=t({code:n(),name:n(),pluginId:a(n(),r()),packageId:a(n(),r()),pluginRunId:a(n(),r())}),I=s(t({pluginId:a(n(),r()),agentId:a(n(),r()),packages:s(t({packageId:a(n(),r()),name:n(),purpose:n(),hasHostHalf:d(),hasClientHalf:d()})),currentPackageId:a(n(),r()).optional(),nextPackageId:a(n(),r()).optional(),activeRun:t({pluginRunId:a(n(),r()),packageId:a(n(),r())}).optional(),latestRun:t({pluginRunId:a(n(),r()),packageId:a(n(),r()),mode:o([e("run"),e("update")]),status:o([e("rejected"),e("awaiting-approval"),e("running"),e("cancelled"),e("starting-host"),e("client-pending"),e("waiting"),e("failed"),e("stopped")]),approvalRequestId:a(n(),r()).optional(),requiresApproval:d().optional(),host:t({status:o([e("running"),e("waiting"),e("failed"),e("stopped"),e("absent"),e("pending")]),waitingFor:s(n()),error:n().optional()}),client:t({status:o([e("running"),e("waiting"),e("failed"),e("stopped"),e("absent"),e("pending")]),waitingFor:s(n()),error:n().optional()}),error:t({phase:o([e("approval"),e("host-load"),e("host-apply"),e("client-load"),e("client-apply"),e("client-render")]),message:n(),stack:n().optional(),pluginId:a(n(),r()),packageId:a(n(),r()),pluginRunId:a(n(),r())}).optional()}).optional()})),f=a(n(),r()),R=a(n(),r()),v=n(),x=o([e(null),n(),c(),e(!1),e(!0),s(i(()=>p)),l(n(),i(()=>p))]),_=o([t({ok:e(!0),value:o([e(null),n(),c(),e(!1),e(!0),s(i(()=>g)),l(n(),i(()=>g))])}),a(t({ok:e(!1),code:o([e("plugin-not-running"),e("stale-run"),e("method-not-found"),e("handler-error")])}),t({message:n(),stack:n().optional()}))]),S=a(n(),r()),b=a(n(),r()),P=a(n(),r()),D=t({message:n(),stack:n().optional()}),M=e(null),w=a(n(),r()),T=a(n(),r()),q=a(n(),r()),A=t({slot:n(),message:n(),stack:n().optional(),abdicated:d()}),E=e(null),H=a(n(),r()),B=a(n(),r()),F=o([t({ok:e(!0),data:o([e(null),n(),c(),e(!1),e(!0),s(i(()=>m)),l(n(),i(()=>m))])}),t({ok:e(!1),reason:o([e("cancelled"),e("provider-missing"),e("method-missing"),e("invalid-input"),e("provider-error")]),message:n()})]),j=t({accepted:d()}),G=a(n(),r()),U=o([t({ok:e(!0),pluginRunId:a(n(),r()),waitingFor:s(n()).optional()}),t({ok:e(!1),reason:o([e("rejected"),e("host-half-failed"),e("client-half-failed")]),pluginRunId:a(n(),r()).optional(),startedHere:d().optional(),message:n().optional(),stack:n().optional()})]),O=t({accepted:d()}),$=a(n(),r()),L=a(n(),r()),V=a(n(),r()),J=o([e("run"),e("update")]),Q=o([e(null),a(n(),r())]),N=d(),W=o([t({ok:e(!0),pluginId:a(n(),r()),packageId:a(n(),r()),pluginRunId:a(n(),r()),waitingFor:s(n()),startedHere:d()}),a(t({ok:e(!1)}),t({message:n(),stack:n().optional()}))]),K=a(n(),r()),z=a(n(),r()),Y=o([t({ok:e(!0),pluginRunId:a(n(),r()),waitingFor:s(n()).optional()}),t({ok:e(!1),reason:o([e("rejected"),e("host-half-failed"),e("client-half-failed")]),pluginRunId:a(n(),r()).optional(),startedHere:d().optional(),message:n().optional(),stack:n().optional()})]),X=o([t({ok:e(!0),status:o([e("awaiting-approval"),e("starting"),e("running")]),pluginId:a(n(),r()),packageId:a(n(),r()),pluginRunId:a(n(),r()),waitingFor:s(n()),clientWaitingFor:s(n()).optional(),currentPackageId:a(n(),r()).optional(),nextPackageId:a(n(),r()).optional(),mode:o([e("run"),e("update")])}),t({ok:e(!1),reason:o([e("plugin-missing"),e("rejected"),e("host-half-failed"),e("client-half-failed"),e("package-missing"),e("invalid-mode"),e("transition-in-flight"),e("cancelled"),e("not-running")]),message:n(),stack:n().optional()})]),Z=a(n(),r()),ee=a(n(),r()),ne=o([t({ok:e(!0)}),t({ok:e(!1),reason:o([e("plugin-missing"),e("not-running")]),message:n()})]),ae=s(t({id:n(),description:n(),methods:s(t({name:n(),description:n(),inputSchema:o([e(null),n(),c(),e(!1),e(!0),s(i(()=>u)),l(n(),i(()=>u))]),outputSchema:o([e(null),n(),c(),e(!1),e(!0),s(i(()=>u)),l(n(),i(()=>u))])}))})),re=e(null),te=a(n(),r()),oe=a(n(),r()),se=o([t({ok:e(!0),wasRunning:d()}),t({ok:e(!1),reason:e("plugin-missing"),message:n()})]),ce={package:"@deepseek-ai/dsh-cordis-host-runner",face:"host",schemas:[],invocations:[{id:"@deepseek-ai/dsh-cordis-host-runner#dynamicCordisRunner/getClientCode",service:"dynamicCordisRunner",namespace:"dynamicCordisRunner",method:"getClientCode",invocation:{kind:"direct"},scope:{context:"agent",wire:"agentId"},parameters:[{name:"agent",wire:"agentId",source:"lookup",lookup:"agent",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-session/types#SessionId",schema:y}},{name:"pluginId",wire:"pluginId",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#CordisDynamicPluginId",schema:h}},{name:"pluginRunId",wire:"pluginRunId",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#CordisDynamicPluginRunId",schema:C}}],result:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#DynamicCordisClientSource",schema:k},sourceLocation:{file:"packages/extensions/cordis-host-runner/src/index.ts",line:384,column:3}},{id:"@deepseek-ai/dsh-cordis-host-runner#dynamicCordisRunner/inventory",service:"dynamicCordisRunner",namespace:"dynamicCordisRunner",method:"inventory",invocation:{kind:"direct"},parameters:[],result:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner#dynamicCordisRunner/inventory:result",schema:I},sourceLocation:{file:"packages/extensions/cordis-host-runner/src/index.ts",line:525,column:3}},{id:"@deepseek-ai/dsh-cordis-host-runner#dynamicCordisRunner/invoke",service:"dynamicCordisRunner",namespace:"dynamicCordisRunner",method:"invoke",invocation:{kind:"direct"},parameters:[{name:"pluginId",wire:"pluginId",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#CordisDynamicPluginId",schema:f}},{name:"pluginRunId",wire:"pluginRunId",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#CordisDynamicPluginRunId",schema:R}},{name:"method",wire:"method",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner#dynamicCordisRunner/invoke:method",schema:v}},{name:"args",wire:"args",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-session/types#JsonValue",schema:x}}],result:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#DynamicCordisInvokeResult",schema:_},sourceLocation:{file:"packages/extensions/cordis-host-runner/src/index.ts",line:741,column:9}},{id:"@deepseek-ai/dsh-cordis-host-runner#dynamicCordisRunner/reportClientGuardFailure",service:"dynamicCordisRunner",namespace:"dynamicCordisRunner",method:"reportClientGuardFailure",invocation:{kind:"direct"},scope:{context:"agent",wire:"agentId"},parameters:[{name:"agent",wire:"agentId",source:"lookup",lookup:"agent",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-session/types#SessionId",schema:S}},{name:"pluginId",wire:"pluginId",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#CordisDynamicPluginId",schema:b}},{name:"pluginRunId",wire:"pluginRunId",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#CordisDynamicPluginRunId",schema:P}},{name:"failure",wire:"failure",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#CordisErrorDetails",schema:D}}],result:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner#dynamicCordisRunner/reportClientGuardFailure:result",schema:M},sourceLocation:{file:"packages/extensions/cordis-host-runner/src/index.ts",line:718,column:9}},{id:"@deepseek-ai/dsh-cordis-host-runner#dynamicCordisRunner/reportRenderFailure",service:"dynamicCordisRunner",namespace:"dynamicCordisRunner",method:"reportRenderFailure",invocation:{kind:"direct"},scope:{context:"agent",wire:"agentId"},parameters:[{name:"agent",wire:"agentId",source:"lookup",lookup:"agent",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-session/types#SessionId",schema:w}},{name:"pluginId",wire:"pluginId",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#CordisDynamicPluginId",schema:T}},{name:"pluginRunId",wire:"pluginRunId",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#CordisDynamicPluginRunId",schema:q}},{name:"failure",wire:"failure",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#DynamicCordisRenderFailure",schema:A}}],result:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner#dynamicCordisRunner/reportRenderFailure:result",schema:E},sourceLocation:{file:"packages/extensions/cordis-host-runner/src/index.ts",line:684,column:9}},{id:"@deepseek-ai/dsh-cordis-host-runner#dynamicCordisRunner/resolveInspectQuery",service:"dynamicCordisRunner",namespace:"dynamicCordisRunner",method:"resolveInspectQuery",invocation:{kind:"direct"},scope:{context:"agent",wire:"agentId"},parameters:[{name:"agent",wire:"agentId",source:"lookup",lookup:"agent",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-session/types#SessionId",schema:H}},{name:"requestId",wire:"requestId",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#CordisInspectRequestId",schema:B}},{name:"resolution",wire:"resolution",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#CordisInspectQueryResolution",schema:F}}],result:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#CordisInspectResolveAck",schema:j},sourceLocation:{file:"packages/extensions/cordis-host-runner/src/index.ts",line:511,column:3}},{id:"@deepseek-ai/dsh-cordis-host-runner#dynamicCordisRunner/resolveRequestRun",service:"dynamicCordisRunner",namespace:"dynamicCordisRunner",method:"resolveRequestRun",invocation:{kind:"direct"},parameters:[{name:"requestId",wire:"requestId",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#ApprovalRequestId",schema:G}},{name:"resolution",wire:"resolution",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#DynamicCordisRunResolution",schema:U}}],result:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#DynamicCordisResolveAck",schema:O},sourceLocation:{file:"packages/extensions/cordis-host-runner/src/index.ts",line:413,column:9}},{id:"@deepseek-ai/dsh-cordis-host-runner#dynamicCordisRunner/runHostHalf",service:"dynamicCordisRunner",namespace:"dynamicCordisRunner",method:"runHostHalf",invocation:{kind:"direct"},scope:{context:"agent",wire:"agentId"},parameters:[{name:"agent",wire:"agentId",source:"lookup",lookup:"agent",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-session/types#SessionId",schema:$}},{name:"pluginId",wire:"pluginId",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#CordisDynamicPluginId",schema:L}},{name:"packageId",wire:"packageId",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#CordisDynamicPackageId",schema:V}},{name:"mode",wire:"mode",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#CordisDynamicRunMode",schema:J}},{name:"requestId",wire:"requestId",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner#dynamicCordisRunner/runHostHalf:requestId",schema:Q}},{name:"approveFutureVersions",wire:"approveFutureVersions",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner#dynamicCordisRunner/runHostHalf:approveFutureVersions",schema:N}}],result:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#DynamicCordisHostHalfResult",schema:W},sourceLocation:{file:"packages/extensions/cordis-host-runner/src/index.ts",line:325,column:9}},{id:"@deepseek-ai/dsh-cordis-host-runner#dynamicCordisRunner/settleUserRun",service:"dynamicCordisRunner",namespace:"dynamicCordisRunner",method:"settleUserRun",invocation:{kind:"direct"},scope:{context:"agent",wire:"agentId"},parameters:[{name:"agent",wire:"agentId",source:"lookup",lookup:"agent",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-session/types#SessionId",schema:K}},{name:"pluginId",wire:"pluginId",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#CordisDynamicPluginId",schema:z}},{name:"resolution",wire:"resolution",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#DynamicCordisRunResolution",schema:Y}}],result:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#DynamicCordisRunResponse",schema:X},sourceLocation:{file:"packages/extensions/cordis-host-runner/src/index.ts",line:438,column:9}},{id:"@deepseek-ai/dsh-cordis-host-runner#dynamicCordisRunner/stopFromPanel",service:"dynamicCordisRunner",namespace:"dynamicCordisRunner",method:"stopFromPanel",invocation:{kind:"direct"},scope:{context:"agent",wire:"agentId"},parameters:[{name:"agent",wire:"agentId",source:"lookup",lookup:"agent",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-session/types#SessionId",schema:Z}},{name:"pluginId",wire:"pluginId",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#CordisDynamicPluginId",schema:ee}}],result:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#DynamicCordisStopResponse",schema:ne},sourceLocation:{file:"packages/extensions/cordis-host-runner/src/index.ts",line:480,column:9}},{id:"@deepseek-ai/dsh-cordis-host-runner#dynamicCordisRunner/syncInspectManifest",service:"dynamicCordisRunner",namespace:"dynamicCordisRunner",method:"syncInspectManifest",invocation:{kind:"direct"},parameters:[{name:"providers",wire:"providers",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner#dynamicCordisRunner/syncInspectManifest:providers",schema:ae}}],result:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner#dynamicCordisRunner/syncInspectManifest:result",schema:re},sourceLocation:{file:"packages/extensions/cordis-host-runner/src/index.ts",line:498,column:3}},{id:"@deepseek-ai/dsh-cordis-host-runner#dynamicCordisRunner/undefineFromPanel",service:"dynamicCordisRunner",namespace:"dynamicCordisRunner",method:"undefineFromPanel",invocation:{kind:"direct"},scope:{context:"agent",wire:"agentId"},parameters:[{name:"agent",wire:"agentId",source:"lookup",lookup:"agent",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-session/types#SessionId",schema:te}},{name:"pluginId",wire:"pluginId",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#CordisDynamicPluginId",schema:oe}}],result:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-cordis-host-runner/types#DynamicCordisUndefineReceipt",schema:se},sourceLocation:{file:"packages/extensions/cordis-host-runner/src/index.ts",line:227,column:9}}],model:{services:[{description:"Registry and cross-page router behind the two model-facing inspect tools.",summary:"Registry and cross-page router behind the two model-facing inspect tools.",tags:[],jsDoc:"/** Registry and cross-page router behind the two model-facing inspect tools. */",key:"cordisInspect",exportName:"CordisInspectRegistryService",members:[{kind:"method",name:"register",signature:"register(registration: HostCordisInspectProviderRegistration): () => void",summary:"Register one Host provider.",jsDoc:`/**
 * Register one Host provider.
 * @param registration - manifest and local query handler.
 * @returns idempotent disposer.
 */`},{kind:"method",name:"syncClientManifest",signature:"syncClientManifest(providers: readonly CordisInspectProviderManifest[]): void",summary:"Replace the mirrored Client provider directory.",jsDoc:`/**
 * Replace the mirrored Client provider directory.
 * @param providers - complete Client manifest snapshot.
 */`},{kind:"method",name:"list",signature:"list(): CordisInspectProviderView[]",summary:"Return the complete known Host and Client provider directory.",jsDoc:`/**
 * Return the complete known Host and Client provider directory.
 * @returns Host providers followed by the Client providers.
 */`},{kind:"method",name:"query",signature:"async query( platform: CordisInspectPlatform, providerId: string, methodName: string, input: JsonValue | undefined, agent: Agent, signal: AbortSignal, ): Promise<JsonValue>",summary:"Execute one provider query on its owning platform.",jsDoc:`/**
 * Execute one provider query on its owning platform.
 * @param platform - Host or Client runtime.
 * @param providerId - provider selected from {@link list}.
 * @param methodName - declared method name.
 * @param input - optional lossless JSON input.
 * @param agent - requesting Agent and scope.
 * @param signal - tool-call cancellation.
 * @returns provider JSON data.
 */`},{kind:"method",name:"resolveClientQuery",signature:"resolveClientQuery( agent: Agent, requestId: CordisInspectRequestId, resolution: CordisInspectQueryResolution, ): CordisInspectResolveAck",summary:"Accept the first valid Client response for a pending query.",jsDoc:`/**
 * Accept the first valid Client response for a pending query.
 * @param agent - Agent whose Session owns the query.
 * @param requestId - Pending Client query identity.
 * @param resolution - Client provider result or failure.
 * @returns whether this response settled the still-pending query.
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
}`},{name:"CordisInspectMethodManifest",declaration:`export interface CordisInspectMethodManifest {
    name: string;
    description: string;
    inputSchema: JsonValue;
    outputSchema: JsonValue;
}`},{name:"CordisInspectPlatform",declaration:"export type CordisInspectPlatform = 'host' | 'client';"},{name:"CordisInspectProviderManifest",declaration:`export interface CordisInspectProviderManifest {
    id: string;
    description: string;
    methods: readonly CordisInspectMethodManifest[];
}`},{name:"CordisInspectProviderView",declaration:`export interface CordisInspectProviderView extends CordisInspectProviderManifest {
    platform: CordisInspectPlatform;
}`},{name:"CordisInspectQueryResolution",declaration:"export type CordisInspectQueryResolution = { ok: true; data: JsonValue; } | { ok: false; reason: 'provider-missing' | 'method-missing' | 'invalid-input' | 'provider-error' | 'cancelled'; message: string; };"},{name:"CordisInspectRequestId",declaration:"export type CordisInspectRequestId = Branded<'CordisInspectRequestId'>;"},{name:"CordisInspectResolveAck",declaration:`export interface CordisInspectResolveAck {
    accepted: boolean;
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
}`},{name:"HostCordisInspectProviderRegistration",declaration:`export interface HostCordisInspectProviderRegistration {
    manifest: CordisInspectProviderManifest;
    query(method: string, input: JsonValue | undefined, context: HostCordisInspectQueryContext): Promise<JsonValue>;
}`},{name:"HostCordisInspectQueryContext",declaration:`export interface HostCordisInspectQueryContext {
    signal: AbortSignal;
    agent: Agent;
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
}`}]},{description:"Dynamic Plugin registry and Host-half lifecycle.",summary:"Dynamic Plugin registry and Host-half lifecycle.",tags:[],jsDoc:"/** Dynamic Plugin registry and Host-half lifecycle. */",key:"dynamicCordisRunner",exportName:"DynamicCordisRunnerService",members:[{kind:"method",name:"define",signature:"define(request: DynamicCordisDefineRequest): DynamicCordisDefineReceipt",summary:"Define a new Plugin's first Package or append a Package to an existing Plugin.",jsDoc:`/**
 * Define a new Plugin's first Package or append a Package to an existing Plugin.
 * @param request - Session ownership, Plugin selection, metadata, and source code.
 * @returns Host-minted Plugin and Package identities with declared-half metadata.
 */`},{kind:"method",name:"undefine",signature:"async undefine(agent: Agent, pluginId: CordisDynamicPluginId): Promise<DynamicCordisUndefineReceipt>",summary:"Remove a Plugin, its active run, and all immutable Packages.",jsDoc:`/**
 * Remove a Plugin, its active run, and all immutable Packages.
 * @param agent - Agent whose Session must own the Plugin.
 * @param pluginId - Stable Plugin identity to remove.
 * @returns Whether removal succeeded and whether it stopped an active run.
 */`},{kind:"method",name:"undefineFromPanel",signature:"@Remote('undefineFromPanel') async undefineFromPanel(agent: Agent, pluginId: CordisDynamicPluginId): Promise<DynamicCordisUndefineReceipt>",summary:"Remove a Plugin from the user panel and queue the resulting state change for the model's next step.",jsDoc:`/**
 * Remove a Plugin from the user panel and queue the resulting state change for the model's next step.
 * @param agent - Agent whose Session owns the Plugin and receives the context.
 * @param pluginId - Stable Plugin identity to remove.
 * @returns Whether removal succeeded and whether it stopped an active run.
 */`},{kind:"method",name:"run",signature:"async run( agent: Agent, pluginId: CordisDynamicPluginId, packageId: CordisDynamicPackageId, mode: CordisDynamicRunMode, signal?: AbortSignal, ): Promise<DynamicCordisRunResponse>",summary:"Start or update one Package for a model tool call.",jsDoc:`/**
 * Start or update one Package for a model tool call. An unauthorized Client
 * Package waits for approval; Plugin-wide authorization covers later versions.
 * @param agent - Agent whose Session must own the Plugin.
 * @param pluginId - Stable Plugin identity to activate.
 * @param packageId - Immutable Package version to activate.
 * @param mode - Whether to run the current version or switch versions.
 * @param signal - Tool-call cancellation signal while the activation request is being created.
 * @returns The successful activation identity or an actionable refusal.
 */`},{kind:"method",name:"runHostHalf",signature:"@Remote('runHostHalf') async runHostHalf( agent: Agent, pluginId: CordisDynamicPluginId, packageId: CordisDynamicPackageId, mode: CordisDynamicRunMode, requestId: ApprovalRequestId | null, approveFutureVersions: boolean, ): Promise<DynamicCordisHostHalfResult>",summary:"Start Host code for an approved request or a direct panel gesture.",jsDoc:`/**
 * Start Host code for an approved request or a direct panel gesture.
 * @param agent - Agent whose Session must own the Plugin.
 * @param pluginId - Stable Plugin identity to activate.
 * @param packageId - Immutable Package version to activate.
 * @param mode - Whether to run the current version or switch versions.
 * @param requestId - Model-driven request identity, or null for a direct user gesture.
 * @param approveFutureVersions - Whether this approval covers later Packages of the same Plugin.
 * @returns The exact Host activation or a failure message.
 */`},{kind:"method",name:"getClientCode",signature:"@Remote('getClientCode') getClientCode( agent: Agent, pluginId: CordisDynamicPluginId, pluginRunId: CordisDynamicPluginRunId, ): DynamicCordisClientSource",summary:"Fetch Client code for the exact active run.",jsDoc:`/**
 * Fetch Client code for the exact active run.
 * @param agent - Agent whose Session must own the Plugin.
 * @param pluginId - Stable Plugin identity to read.
 * @param pluginRunId - Exact active run authorized to receive source.
 * @returns Client source and its Plugin, Package, and run identities.
 */`},{kind:"method",name:"resolveRequestRun",signature:"@Remote('resolveRequestRun') async resolveRequestRun( requestId: ApprovalRequestId, resolution: DynamicCordisRunResolution, ): Promise<DynamicCordisResolveAck>",summary:"Resolve one model-driven Client activation request.",jsDoc:`/**
 * Resolve one model-driven Client activation request.
 * @param requestId - Request identity to settle once.
 * @param resolution - Browser refusal or exact Client activation result.
 * @returns Whether the still-pending request accepted this resolution.
 */`},{kind:"method",name:"settleUserRun",signature:"@Remote('settleUserRun') async settleUserRun( agent: Agent, pluginId: CordisDynamicPluginId, resolution: DynamicCordisRunResolution, ): Promise<DynamicCordisRunResponse>",summary:"Settle a direct panel run after this page loaded or failed its Client half.",jsDoc:`/**
 * Settle a direct panel run after this page loaded or failed its Client half.
 * @param agent - Agent whose Session must own the Plugin.
 * @param pluginId - Stable Plugin identity being settled.
 * @param resolution - Exact Client activation result from the acting page.
 * @returns The committed activation or its failure.
 */`},{kind:"method",name:"stop",signature:"async stop(agent: Agent, pluginId: CordisDynamicPluginId): Promise<DynamicCordisStopResponse>",summary:"Stop the active run while retaining every Package version.",jsDoc:`/**
 * Stop the active run while retaining every Package version.
 * @param agent - Agent whose Session must own the Plugin.
 * @param pluginId - Stable Plugin identity to stop.
 * @returns Success or the reason no run was stopped.
 */`},{kind:"method",name:"stopFromPanel",signature:"@Remote('stopFromPanel') async stopFromPanel(agent: Agent, pluginId: CordisDynamicPluginId): Promise<DynamicCordisStopResponse>",summary:"Stop a Plugin from the user panel and queue the resulting state change for the model's next step.",jsDoc:`/**
 * Stop a Plugin from the user panel and queue the resulting state change for the model's next step.
 * @param agent - Agent whose Session owns the Plugin and receives the context.
 * @param pluginId - Stable Plugin identity to stop.
 * @returns Success or the reason no run was stopped.
 */`},{kind:"method",name:"syncInspectManifest",signature:"@Remote('syncInspectManifest') syncInspectManifest(providers: readonly CordisInspectProviderManifest[]): null",summary:"Replace the Host mirror of the Client inspect provider directory.",jsDoc:`/**
 * Replace the Host mirror of the Client inspect provider directory.
 * @param providers - complete Client provider manifest.
 * @returns null after accepting the manifest.
 */`},{kind:"method",name:"resolveInspectQuery",signature:"@Remote('resolveInspectQuery') resolveInspectQuery( agent: Agent, requestId: CordisInspectRequestId, resolution: CordisInspectQueryResolution, ): CordisInspectResolveAck",summary:"Claim one pending Client inspect query with its live result.",jsDoc:`/**
 * Claim one pending Client inspect query with its live result.
 * @param agent - Session that owns the query.
 * @param requestId - exact pending query identity.
 * @param resolution - provider result or structured refusal.
 * @returns whether this answer won the query.
 */`},{kind:"method",name:"inventory",signature:"@Remote('inventory') inventory(): DynamicCordisInventoryRow[]",summary:"Frame-wide inventory, grouped as one row per stable Plugin.",jsDoc:`/**
 * Frame-wide inventory, grouped as one row per stable Plugin.
 * @returns Source-free metadata for every process-local Plugin.
 */`},{kind:"method",name:"snapshot",signature:"snapshot(agent: Agent): DynamicCordisSnapshotRow[]",summary:"Read one Session's Host-rich state for inspection and result rendering.",jsDoc:`/**
 * Read one Session's Host-rich state for inspection and result rendering.
 * @param agent - Agent whose Session selects visible Plugins.
 * @returns Plugin versions, active runs, Host fibers, and render failures.
 */`},{kind:"method",name:"reference",signature:"reference(agent: Agent, pluginId: CordisDynamicPluginId): DynamicCordisReference | undefined",summary:"Read source-free context for an explicit `@pluginId` user gesture.",jsDoc:`/**
 * Read source-free context for an explicit \`@pluginId\` user gesture.
 * @param agent - Agent whose Session must own the Plugin.
 * @param pluginId - Stable Plugin identity referenced by the user.
 * @returns The preferred modification base, or undefined when unavailable.
 */`},{kind:"method",name:"listPlugins",signature:"listPlugins(agent: Agent): DynamicCordisPluginInspection[]",summary:"List source-free Plugin summaries owned by one Session.",jsDoc:`/**
 * List source-free Plugin summaries owned by one Session.
 * @param agent - Agent whose Session selects visible Plugins.
 * @returns one summary per Plugin in creation order.
 */`},{kind:"method",name:"inspectPlugin",signature:"inspectPlugin(agent: Agent, pluginId: CordisDynamicPluginId): DynamicCordisPluginInspection",summary:"Inspect one Plugin without returning Package source.",jsDoc:`/**
 * Inspect one Plugin without returning Package source.
 * @param agent - Agent whose Session must own the Plugin.
 * @param pluginId - stable Plugin identity.
 * @returns version pointers, latest run, and all Package summaries.
 */`},{kind:"method",name:"inspectPackage",signature:"inspectPackage( agent: Agent, pluginId: CordisDynamicPluginId, packageId: CordisDynamicPackageId, ): DynamicCordisPackageInspection",summary:"Read one exact immutable Package and its Host and Client source.",jsDoc:`/**
 * Read one exact immutable Package and its Host and Client source.
 * @param agent - Agent whose Session must own the Plugin.
 * @param pluginId - Stable Plugin identity that owns the Package.
 * @param packageId - Exact immutable Package identity to inspect.
 * @returns Package metadata, source, and the Plugin's lifecycle pointers.
 */`},{kind:"method",name:"reportRenderFailure",signature:"@Remote('reportRenderFailure') async reportRenderFailure( agent: Agent, pluginId: CordisDynamicPluginId, pluginRunId: CordisDynamicPluginRunId, failure: DynamicCordisRenderFailure, ): Promise<null>",summary:"Record a post-load render failure for the exact active run.",jsDoc:`/**
 * Record a post-load render failure for the exact active run.
 * @param agent - Agent whose Session must own the Plugin.
 * @param pluginId - Stable Plugin identity that rendered.
 * @param pluginRunId - Exact active run that produced the failure.
 * @param failure - Slot, message, and entry-retirement result.
 * @returns Null after recording or ignoring a stale report.
 */`},{kind:"method",name:"reportClientGuardFailure",signature:"@Remote('reportClientGuardFailure') async reportClientGuardFailure( agent: Agent, pluginId: CordisDynamicPluginId, pluginRunId: CordisDynamicPluginRunId, failure: CordisErrorDetails, ): Promise<null>",summary:"Report a Client guard rejection that happened after the Package completed activation.",jsDoc:`/**
 * Report a Client guard rejection that happened after the Package completed activation.
 * @param agent - Agent whose Session must own the Plugin.
 * @param pluginId - Stable Plugin identity whose Client code was rejected.
 * @param pluginRunId - Exact active run that produced the rejection.
 * @param failure - Original guard message and stack.
 * @returns Null after reporting or ignoring a stale/startup failure.
 */`},{kind:"method",name:"invoke",signature:"@Remote('invoke') async invoke( pluginId: CordisDynamicPluginId, pluginRunId: CordisDynamicPluginRunId, method: string, args: JsonValue, ): Promise<DynamicCordisInvokeResult>",summary:"Invoke an active Host method while rejecting stale Client runs.",jsDoc:`/**
 * Invoke an active Host method while rejecting stale Client runs.
 * @param pluginId - Stable Plugin identity that owns the method.
 * @param pluginRunId - Exact active run authorizing the call.
 * @param method - Registered Host handler name.
 * @param args - JSON argument delivered to the handler.
 * @returns The JSON result or a typed invocation failure.
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
}`},{name:"AgentStatus",declaration:"export type AgentStatus = 'idle' | 'running';"},{name:"ApprovalOutcome",declaration:"export type ApprovalOutcome = 'allowed-once' | 'rejected' | 'cancelled' | 'unavailable';"},{name:"ApprovalPolicy",declaration:"export type ApprovalPolicy = 'ask' | 'never';"},{name:"ApprovalRequestId",declaration:"export type ApprovalRequestId = Branded<'ApprovalRequestId'>;"},{name:"ApprovalRequestId",declaration:"export type ApprovalRequestId = Branded<'ApprovalRequestId'>;"},{name:"AssistantMessage",declaration:`export interface AssistantMessage extends Message {
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
}`},{name:"CordisDynamicPackageId",declaration:"export type CordisDynamicPackageId = Branded<'CordisDynamicPackageId'>;"},{name:"CordisDynamicPluginId",declaration:"export type CordisDynamicPluginId = Branded<'CordisDynamicPluginId'>;"},{name:"CordisDynamicPluginRunId",declaration:"export type CordisDynamicPluginRunId = Branded<'CordisDynamicPluginRunId'>;"},{name:"CordisDynamicRunMode",declaration:"export type CordisDynamicRunMode = 'run' | 'update';"},{name:"CordisErrorDetails",declaration:`export interface CordisErrorDetails {
    message: string;
    stack?: string;
}`},{name:"CordisHalfState",declaration:`export interface CordisHalfState {
    status: 'absent' | 'pending' | 'stopped' | 'running' | 'waiting' | 'failed';
    waitingFor: readonly string[];
    error?: string;
}`},{name:"CordisInspectMethodManifest",declaration:`export interface CordisInspectMethodManifest {
    name: string;
    description: string;
    inputSchema: JsonValue;
    outputSchema: JsonValue;
}`},{name:"CordisInspectProviderManifest",declaration:`export interface CordisInspectProviderManifest {
    id: string;
    description: string;
    methods: readonly CordisInspectMethodManifest[];
}`},{name:"CordisInspectQueryResolution",declaration:"export type CordisInspectQueryResolution = { ok: true; data: JsonValue; } | { ok: false; reason: 'provider-missing' | 'method-missing' | 'invalid-input' | 'provider-error' | 'cancelled'; message: string; };"},{name:"CordisInspectRequestId",declaration:"export type CordisInspectRequestId = Branded<'CordisInspectRequestId'>;"},{name:"CordisInspectResolveAck",declaration:`export interface CordisInspectResolveAck {
    accepted: boolean;
}`},{name:"CordisRunDiagnostic",declaration:`export interface CordisRunDiagnostic {
    phase: 'approval' | 'host-load' | 'host-apply' | 'client-load' | 'client-apply' | 'client-render';
    message: string;
    stack?: string;
    pluginId: CordisDynamicPluginId;
    packageId: CordisDynamicPackageId;
    pluginRunId: CordisDynamicPluginRunId;
}`},{name:"CordisRunStatus",declaration:"export type CordisRunStatus = 'awaiting-approval' | 'starting-host' | 'client-pending' | 'running' | 'waiting' | 'rejected' | 'failed' | 'cancelled' | 'stopped';"},{name:"DynamicCordisClientSource",declaration:`export interface DynamicCordisClientSource {
    code: string;
    name: string;
    pluginId: CordisDynamicPluginId;
    packageId: CordisDynamicPackageId;
    pluginRunId: CordisDynamicPluginRunId;
}`},{name:"DynamicCordisDefineReceipt",declaration:`export interface DynamicCordisDefineReceipt {
    pluginId: CordisDynamicPluginId;
    packageId: CordisDynamicPackageId;
    name: string;
    purpose: string;
    hasHostHalf: boolean;
    hasClientHalf: boolean;
}`},{name:"DynamicCordisDefineRequest",declaration:`export interface DynamicCordisDefineRequest {
    sessionId: SessionId;
    plugin: { kind: 'new'; idPrefix: string; } | { kind: 'existing'; pluginId: CordisDynamicPluginId; };
    name: string;
    purpose: string;
    code: { host?: string; client?: string; };
}`},{name:"DynamicCordisHostHalfResult",declaration:"export type DynamicCordisHostHalfResult = { ok: true; pluginId: CordisDynamicPluginId; packageId: CordisDynamicPackageId; pluginRunId: CordisDynamicPluginRunId; waitingFor: readonly string[]; startedHere: boolean; } | ({ ok: false; } & CordisErrorDetails);"},{name:"DynamicCordisInventoryPackage",declaration:`export interface DynamicCordisInventoryPackage {
    packageId: CordisDynamicPackageId;
    name: string;
    purpose: string;
    hasHostHalf: boolean;
    hasClientHalf: boolean;
}`},{name:"DynamicCordisInventoryRow",declaration:`export interface DynamicCordisInventoryRow {
    pluginId: CordisDynamicPluginId;
    agentId: SessionId;
    packages: readonly DynamicCordisInventoryPackage[];
    currentPackageId?: CordisDynamicPackageId;
    nextPackageId?: CordisDynamicPackageId;
    activeRun?: { pluginRunId: CordisDynamicPluginRunId; packageId: CordisDynamicPackageId; };
    latestRun?: DynamicCordisRunAttempt;
}`},{name:"DynamicCordisInvokeResult",declaration:"export type DynamicCordisInvokeResult = { ok: true; value: JsonValue; } | ({ ok: false; code: 'plugin-not-running' | 'stale-run' | 'method-not-found' | 'handler-error'; } & CordisErrorDetails);"},{name:"DynamicCordisPackageInspection",declaration:`export interface DynamicCordisPackageInspection extends DynamicCordisReference {
    code: { host?: string; client?: string; };
}`},{name:"DynamicCordisPluginInspection",declaration:`export interface DynamicCordisPluginInspection extends DynamicCordisReference {
    packages: Array<{ packageId: CordisDynamicPackageId; name: string; purpose: string; hasHostHalf: boolean; hasClientHalf: boolean; }>;
}`},{name:"DynamicCordisReference",declaration:`export interface DynamicCordisReference {
    pluginId: CordisDynamicPluginId;
    packageId: CordisDynamicPackageId;
    name: string;
    purpose: string;
    currentPackageId?: CordisDynamicPackageId;
    nextPackageId?: CordisDynamicPackageId;
    activeRun?: { pluginRunId: CordisDynamicPluginRunId; packageId: CordisDynamicPackageId; };
    latestRun?: DynamicCordisRunAttempt;
}`},{name:"DynamicCordisRenderFailure",declaration:`export interface DynamicCordisRenderFailure {
    slot: string;
    message: string;
    stack?: string;
    abdicated: boolean;
}`},{name:"DynamicCordisResolveAck",declaration:`export interface DynamicCordisResolveAck {
    accepted: boolean;
}`},{name:"DynamicCordisRunAttempt",declaration:`export interface DynamicCordisRunAttempt {
    pluginRunId: CordisDynamicPluginRunId;
    packageId: CordisDynamicPackageId;
    mode: CordisDynamicRunMode;
    status: CordisRunStatus;
    approvalRequestId?: ApprovalRequestId;
    requiresApproval?: boolean;
    host: CordisHalfState;
    client: CordisHalfState;
    error?: CordisRunDiagnostic;
}`},{name:"DynamicCordisRunResolution",declaration:"export type DynamicCordisRunResolution = { ok: true; pluginRunId: CordisDynamicPluginRunId; waitingFor?: readonly string[]; } | { ok: false; reason: 'rejected' | 'host-half-failed' | 'client-half-failed'; pluginRunId?: CordisDynamicPluginRunId; startedHere?: boolean; message?: string; stack?: string; };"},{name:"DynamicCordisRunResponse",declaration:"export type DynamicCordisRunResponse = { ok: true; status: 'awaiting-approval' | 'starting' | 'running'; pluginId: CordisDynamicPluginId; packageId: CordisDynamicPackageId; pluginRunId: CordisDynamicPluginRunId; waitingFor: readonly string[]; clientWaitingFor?: readonly string[]; currentPackageId?: CordisDynamicPackageId; nextPackageId?: CordisDynamicPackageId; mode: CordisDynamicRunMode; } | { ok: false; reason: 'plugin-missing' | 'package-missing' | 'invalid-mode' | 'transition-in-flight' | 'host-half-failed' | 'client-half-failed' | 'rejected' | 'cancelled' | 'not-running'; message: string; stack?: string; };"},{name:"DynamicCordisSnapshotRow",declaration:`export interface DynamicCordisSnapshotRow {
    pluginId: CordisDynamicPluginId;
    currentPackageId?: CordisDynamicPackageId;
    nextPackageId?: CordisDynamicPackageId;
    packages: Array<{ packageId: CordisDynamicPackageId; name: string; purpose: string; hasHostHalf: boolean; hasClientHalf: boolean; }>;
    activeRun?: { pluginRunId: CordisDynamicPluginRunId; packageId: CordisDynamicPackageId; fiber?: Fiber; handlers: string[]; renderFailure?: DynamicCordisRenderFailure; };
    latestRun?: DynamicCordisRunAttempt;
}`},{name:"DynamicCordisStopResponse",declaration:"export type DynamicCordisStopResponse = { ok: true; } | { ok: false; reason: 'plugin-missing' | 'not-running'; message: string; };"},{name:"DynamicCordisUndefineReceipt",declaration:"export type DynamicCordisUndefineReceipt = { ok: true; wasRunning: boolean; } | { ok: false; reason: 'plugin-missing'; message: string; };"},{name:"EpochHeader",declaration:`export interface EpochHeader {
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
}`}]}],events:[{description:"One exact Plugin/Package activation is now live in the Host.",summary:"One exact Plugin/Package activation is now live in the Host.",tags:[{name:"param",argument:"pkg",comment:"- stable plugin, immutable package, run identity, and label.",text:`@param pkg - stable plugin, immutable package, run identity, and label.
     *`},{name:"mode",comment:"emit",text:"@mode emit"}],jsDoc:`/**
 * One exact Plugin/Package activation is now live in the Host.
 * @param pkg - stable plugin, immutable package, run identity, and label.
 * @mode emit
 */`,name:"cordis/dynamic-package",mode:"emit",signature:"'cordis/dynamic-package'(pkg: DynamicCordisPackage): void"},{description:"One exact activation was withdrawn.",summary:"One exact activation was withdrawn.",tags:[{name:"param",argument:"retracted",comment:"- plugin, package, and run identity.",text:`@param retracted - plugin, package, and run identity.
     *`},{name:"mode",comment:"emit",text:"@mode emit"}],jsDoc:`/**
 * One exact activation was withdrawn.
 * @param retracted - plugin, package, and run identity.
 * @mode emit
 */`,name:"cordis/dynamic-retract",mode:"emit",signature:"'cordis/dynamic-retract'(retracted: DynamicCordisRetracted): void"},{description:"Request a live read-only query from the Client inspect registry.",summary:"Request a live read-only query from the Client inspect registry.",tags:[{name:"param",argument:"request",comment:"- correlation, Session, provider, method, and JSON input.",text:`@param request - correlation, Session, provider, method, and JSON input.
     *`},{name:"mode",comment:"emit",text:"@mode emit"}],jsDoc:`/**
 * Request a live read-only query from the Client inspect registry.
 * @param request - correlation, Session, provider, method, and JSON input.
 * @mode emit
 */`,name:"cordis/inspect-query",mode:"emit",signature:"'cordis/inspect-query'(request: CordisInspectQueryRequest): void"},{description:"Notify every Client that an inspect query has settled or been cancelled.",summary:"Notify every Client that an inspect query has settled or been cancelled.",tags:[{name:"param",argument:"resolved",comment:"- exact query identity that is no longer answerable.",text:`@param resolved - exact query identity that is no longer answerable.
     *`},{name:"mode",comment:"emit",text:"@mode emit"}],jsDoc:`/**
 * Notify every Client that an inspect query has settled or been cancelled.
 * @param resolved - exact query identity that is no longer answerable.
 * @mode emit
 */`,name:"cordis/inspect-query-resolved",mode:"emit",signature:"'cordis/inspect-query-resolved'(resolved: CordisInspectQueryResolved): void"},{description:"A Client-bearing activation needs a browser page, and may require a user decision.",summary:"A Client-bearing activation needs a browser page, and may require a user decision.",tags:[{name:"param",argument:"request",comment:"- correlation identity, owner, target version, mode, and approval requirement.",text:`@param request - correlation identity, owner, target version, mode, and approval requirement.
     *`},{name:"mode",comment:"emit",text:"@mode emit"}],jsDoc:`/**
 * A Client-bearing activation needs a browser page, and may require a user decision.
 * @param request - correlation identity, owner, target version, mode, and approval requirement.
 * @mode emit
 */`,name:"cordis/request-run",mode:"emit",signature:"'cordis/request-run'(request: DynamicCordisRunRequest): void"},{description:"A pending Client activation request left the answerable state.",summary:"A pending Client activation request left the answerable state.",tags:[{name:"param",argument:"resolved",comment:"- request identity and outcome.",text:`@param resolved - request identity and outcome.
     *`},{name:"mode",comment:"emit",text:"@mode emit"}],jsDoc:`/**
 * A pending Client activation request left the answerable state.
 * @param resolved - request identity and outcome.
 * @mode emit
 */`,name:"cordis/request-run-resolved",mode:"emit",signature:"'cordis/request-run-resolved'(resolved: DynamicCordisRequestResolved): void"}],objects:[]}};export{ce as TYPERT};
