import{k as t,o as a,l as e,x as n,u as d,s,n as o,j as r}from"./schemas-BjdgLEE2.js";import"./json-schema-processors-6dmQcDt8.js";const i=a({sessionId:n(s(),d()).readonly(),messageId:n(s(),d()).readonly(),ifVersion:n(s(),d()).readonly()}),c=t([a({ok:e(!0).readonly(),value:a({absent:e(!0).readonly()}).readonly()}),a({ok:e(!1).readonly(),error:t([a({code:e("session-not-found").readonly(),sessionId:n(s(),d()).readonly()}),a({code:e("version-conflict").readonly(),current:t([e(null),a({messageId:n(s(),d()).readonly(),rating:t([e("positive"),e("negative")]).readonly(),note:s().readonly().optional(),version:n(s(),d()).readonly(),createdAt:o().readonly(),updatedAt:o().readonly()})]).readonly()})]).readonly()})]),l=a({sessionId:n(s(),d()).readonly()}),g=t([a({ok:e(!0).readonly(),value:a({items:r(a({messageId:n(s(),d()).readonly(),rating:t([e("positive"),e("negative")]).readonly(),note:s().readonly().optional(),version:n(s(),d()).readonly(),createdAt:o().readonly(),updatedAt:o().readonly()})).readonly()}).readonly()}),a({ok:e(!1).readonly(),error:a({code:e("session-not-found").readonly(),sessionId:n(s(),d()).readonly()}).readonly()})]),m=a({sessionId:n(s(),d()).readonly(),messageId:n(s(),d()).readonly(),rating:t([e("positive"),e("negative")]).readonly(),note:s().readonly().optional(),ifVersion:t([e(null),n(s(),d())]).readonly()}),k=t([a({ok:e(!0).readonly(),value:a({messageId:n(s(),d()).readonly(),rating:t([e("positive"),e("negative")]).readonly(),note:s().readonly().optional(),version:n(s(),d()).readonly(),createdAt:o().readonly(),updatedAt:o().readonly()}).readonly()}),a({ok:e(!1).readonly(),error:t([a({code:e("session-not-found").readonly(),sessionId:n(s(),d()).readonly()}),a({code:e("target-not-found").readonly(),sessionId:n(s(),d()).readonly(),messageId:n(s(),d()).readonly()}),a({code:e("version-conflict").readonly(),current:t([e(null),a({messageId:n(s(),d()).readonly(),rating:t([e("positive"),e("negative")]).readonly(),note:s().readonly().optional(),version:n(s(),d()).readonly(),createdAt:o().readonly(),updatedAt:o().readonly()})]).readonly()}),a({code:e("note-blank").readonly()}),a({code:e("note-too-large").readonly(),maxBytes:o().readonly(),actualBytes:o().readonly()})]).readonly()})]),y={package:"@deepseek-ai/dsh-message-feedback",face:"host",schemas:[],invocations:[{id:"@deepseek-ai/dsh-message-feedback#messageFeedback/delete",service:"messageFeedback",namespace:"messageFeedback",method:"delete",invocation:{kind:"direct"},parameters:[{name:"request",wire:"request",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-message-feedback/types#MessageFeedbackDeleteRequest",schema:i}}],result:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-message-feedback/types#MessageFeedbackDeleteResult",schema:c},sourceLocation:{file:"packages/feedback/message-feedback/src/index.ts",line:272,column:3}},{id:"@deepseek-ai/dsh-message-feedback#messageFeedback/list",service:"messageFeedback",namespace:"messageFeedback",method:"list",invocation:{kind:"direct"},parameters:[{name:"request",wire:"request",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-message-feedback/types#MessageFeedbackListRequest",schema:l}}],result:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-message-feedback/types#MessageFeedbackListResult",schema:g},sourceLocation:{file:"packages/feedback/message-feedback/src/index.ts",line:190,column:9}},{id:"@deepseek-ai/dsh-message-feedback#messageFeedback/put",service:"messageFeedback",namespace:"messageFeedback",method:"put",invocation:{kind:"direct"},parameters:[{name:"request",wire:"request",source:"json",codec:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-message-feedback/types#MessageFeedbackPutRequest",schema:m}}],result:{mode:"strict",typeSymbol:"@deepseek-ai/dsh-message-feedback/types#MessageFeedbackPutResult",schema:k},sourceLocation:{file:"packages/feedback/message-feedback/src/index.ts",line:206,column:3}}],model:{services:[{description:"Storage-domain sidecar service. It inspects persisted Session history and never creates or resumes an Agent or Session.",summary:"Storage-domain sidecar service.",tags:[],jsDoc:`/**
 * Storage-domain sidecar service. It inspects persisted Session history and
 * never creates or resumes an Agent or Session.
 */`,key:"messageFeedback",exportName:"MessageFeedbackService",members:[{kind:"method",name:"list",signature:"@Remote('list') async list(request: MessageFeedbackListRequest): Promise<MessageFeedbackListResult>",summary:"Read feedback belonging to the current persisted Session lifecycle.",jsDoc:`/**
 * Read feedback belonging to the current persisted Session lifecycle.
 * A stale row from a reused Session id is invisible.
 * @param request - Session identity to inspect and list.
 * @returns current immutable items or \`session-not-found\`.
 */`},{kind:"method",name:"put",signature:"@Remote('put') put(request: MessageFeedbackPutRequest): Promise<MessageFeedbackPutResult>",summary:"Create or replace feedback for one derived append-origin assistant message.",jsDoc:`/**
 * Create or replace feedback for one derived append-origin assistant
 * message. Every request must match the addressed item's current version;
 * a matching no-op returns the stored item without changing its revision.
 * @param request - target, desired value, and observed item version.
 * @returns the committed item or an explicit business failure.
 */`},{kind:"method",name:"delete",signature:"@Remote('delete') delete(request: MessageFeedbackDeleteRequest): Promise<MessageFeedbackDeleteResult>",summary:"Delete one feedback item.",jsDoc:`/**
 * Delete one feedback item. Absence is successful regardless of the
 * supplied version; an existing item requires an exact version match.
 * @param request - Session, message, and observed item version.
 * @returns the stable absent postcondition, or an explicit failure.
 */`}],types:[{name:"Branded",declaration:"export type Branded<B extends string> = string & { readonly [BRAND]: B; };"},{name:"MessageFeedbackDeleteRequest",declaration:`export interface MessageFeedbackDeleteRequest {
    readonly sessionId: SessionId;
    readonly messageId: MessageId;
    readonly ifVersion: MessageFeedbackVersion;
}`},{name:"MessageFeedbackDeleteResult",declaration:"export type MessageFeedbackDeleteResult = MessageFeedbackSuccess<MessageFeedbackDeleteValue> | MessageFeedbackRejected<MessageFeedbackSessionNotFound | MessageFeedbackVersionConflict>;"},{name:"MessageFeedbackDeleteValue",declaration:`export interface MessageFeedbackDeleteValue {
    readonly absent: true;
}`},{name:"MessageFeedbackFailure",declaration:"export type MessageFeedbackFailure = MessageFeedbackSessionNotFound | MessageFeedbackTargetNotFound | MessageFeedbackVersionConflict | MessageFeedbackNoteBlank | MessageFeedbackNoteTooLarge;"},{name:"MessageFeedbackItem",declaration:`export interface MessageFeedbackItem {
    readonly messageId: MessageId;
    readonly rating: MessageFeedbackRating;
    readonly note?: string;
    readonly version: MessageFeedbackVersion;
    readonly createdAt: number;
    readonly updatedAt: number;
}`},{name:"MessageFeedbackListRequest",declaration:`export interface MessageFeedbackListRequest {
    readonly sessionId: SessionId;
}`},{name:"MessageFeedbackListResult",declaration:"export type MessageFeedbackListResult = MessageFeedbackSuccess<MessageFeedbackListValue> | MessageFeedbackRejected<MessageFeedbackSessionNotFound>;"},{name:"MessageFeedbackListValue",declaration:`export interface MessageFeedbackListValue {
    readonly items: readonly MessageFeedbackItem[];
}`},{name:"MessageFeedbackNoteBlank",declaration:`export interface MessageFeedbackNoteBlank {
    readonly code: 'note-blank';
}`},{name:"MessageFeedbackNoteTooLarge",declaration:`export interface MessageFeedbackNoteTooLarge {
    readonly code: 'note-too-large';
    readonly maxBytes: number;
    readonly actualBytes: number;
}`},{name:"MessageFeedbackPutRequest",declaration:`export interface MessageFeedbackPutRequest {
    readonly sessionId: SessionId;
    readonly messageId: MessageId;
    readonly rating: MessageFeedbackRating;
    readonly note?: string;
    readonly ifVersion: MessageFeedbackVersion | null;
}`},{name:"MessageFeedbackPutResult",declaration:"export type MessageFeedbackPutResult = MessageFeedbackSuccess<MessageFeedbackItem> | MessageFeedbackRejected<MessageFeedbackSessionNotFound | MessageFeedbackTargetNotFound | MessageFeedbackVersionConflict | MessageFeedbackNoteBlank | MessageFeedbackNoteTooLarge>;"},{name:"MessageFeedbackRating",declaration:"export type MessageFeedbackRating = 'positive' | 'negative';"},{name:"MessageFeedbackRejected",declaration:`export interface MessageFeedbackRejected<E extends MessageFeedbackFailure> {
    readonly ok: false;
    readonly error: E;
}`},{name:"MessageFeedbackSessionNotFound",declaration:`export interface MessageFeedbackSessionNotFound {
    readonly code: 'session-not-found';
    readonly sessionId: SessionId;
}`},{name:"MessageFeedbackSuccess",declaration:`export interface MessageFeedbackSuccess<T> {
    readonly ok: true;
    readonly value: T;
}`},{name:"MessageFeedbackTargetNotFound",declaration:`export interface MessageFeedbackTargetNotFound {
    readonly code: 'target-not-found';
    readonly sessionId: SessionId;
    readonly messageId: MessageId;
}`},{name:"MessageFeedbackVersion",declaration:"export type MessageFeedbackVersion = Branded<'MessageFeedbackVersion'>;"},{name:"MessageFeedbackVersionConflict",declaration:`export interface MessageFeedbackVersionConflict {
    readonly code: 'version-conflict';
    readonly current: MessageFeedbackItem | null;
}`},{name:"MessageId",declaration:"export type MessageId = Branded<'MessageId'>;"},{name:"SessionId",declaration:"export type SessionId = Branded<'SessionId'>;"}]}],events:[],objects:[]}};export{y as TYPERT};
