import{a as Me}from"./git-DJDr4heb.js";function qe(f,w){for(var p=0;p<w.length;p++){const k=w[p];if(typeof k!="string"&&!Array.isArray(k)){for(const m in k)if(m!=="default"&&!(m in f)){const v=Object.getOwnPropertyDescriptor(k,m);v&&Object.defineProperty(f,m,v.get?v:{enumerable:!0,get:()=>k[m]})}}}return Object.freeze(Object.defineProperty(f,Symbol.toStringTag,{value:"Module"}))}var z={},Y;function Ne(){return Y||(Y=1,window.__ModuleLoader__.load({id:"@deepseek-ai/dsh-cordis-client-runner",factory:f=>{var w={exports:{}},p=w.exports;Object.defineProperty(p,Symbol.toStringTag,{value:"Module"});var k=Object.create,m=Object.defineProperty,v=Object.getOwnPropertyDescriptor,J=Object.getOwnPropertyNames,Q=Object.getPrototypeOf,Z=Object.prototype.hasOwnProperty,X=(e,t,n,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(var i=J(t),s=0,r=i.length,a;s<r;s++)a=i[s],!Z.call(e,a)&&a!==n&&m(e,a,{get:(c=>t[c]).bind(null,a),enumerable:!(o=v(t,a))||o.enumerable});return e},ee=(e,t,n)=>(n=e!=null?k(Q(e)):{},X(m(n,"default",{value:e,enumerable:!0}),e));let I=f("react");I=ee(I);let P=f("@deepseek-ai/cordis");const S="browser timer globals are unavailable in dynamic packages. Declare inject: ['timer'] on the returned plugin, query Client Service.listService for the exact API, and close over that plugin ctx. In React, create timers from an event handler or React.useEffect and return callback-form disposers from the effect cleanup.",C={setTimeout:S,setInterval:S,clearTimeout:S,clearInterval:S,fetch:"network belongs to the HOST half: register a handler there with harness.handle(method, fn) and call it here via host.call(method, args).",require:"modules cannot be imported here. React arrives as the `React` closure symbol; everything else goes through ctx services or host.call."};function te(){const e={};for(const[t,n]of Object.entries(C))e[t]=()=>{throw new Error(`${t} is not available in a dynamic client half — ${n}`)};return e}function ne(){return new Proxy({},{get(e,t){throw new Error(`harness.${String(t)} belongs to the HOST half (\`code\`): register handlers there with harness.handle(method, fn); the browser half calls them via host.call(method, args).`)}})}var R=class{pluginId;tags=new Set;constructor(e){this.pluginId=e}insert(e){if(typeof e!="string")throw new Error("styles.insert(css) needs a CSS string");const t=document.createElement("style");return t.dataset.dyn=this.pluginId,t.textContent=e,document.head.append(t),this.tags.add(t),()=>{this.tags.delete(t),t.remove()}}get count(){return this.tags.size}dispose(){for(const e of this.tags)e.remove();this.tags.clear()}};function oe(e){if(e instanceof Error)return e.message;if(typeof e=="string")return e;if(e===void 0)return"undefined";try{return JSON.stringify(e)}catch{return"[unserializable console argument]"}}function se(e,t){const n=`[cordis:${e}]`,o=i=>(...s)=>{console[i](n,...s),i==="error"&&t(s.map(oe).join(" ").slice(0,500))};return{...console,log:o("log"),info:o("info"),warn:o("warn"),error:o("error"),debug:o("debug")}}function T(e){return typeof e=="function"?!0:typeof e=="object"&&e!==null&&typeof e.apply=="function"}async function j(e,t,n,o){const i=te(),s=["React","console","styles","host","harness",...Object.keys(i),"process","Buffer"];let r;try{r=new Function(...s,`return (async () => {
${t}
})()`)}catch(c){throw c instanceof SyntaxError?new Error(`client half failed to parse in this browser: ${c.message}
The browser half is plain JavaScript (no JSX, no TypeScript); build elements with React.createElement.`):c}const a=await r(I,se(e,c=>{n.noteError(c)}),o,{call:(c,l=null)=>n.invoke(c,l)},ne(),...Object.values(i),void 0,void 0);if(!T(a))throw a===void 0?new Error("client half returned `undefined` — did you forget `return`?\n  ✓ return (ctx) => { … }\n  ✓ return { name: '…', inject: ['slots'], apply(ctx) { … } }"):new Error("client half must `return` a plugin: a function, or an object with an `apply(ctx)` method");return a}const O=new Set(["effect","on","once","provide","timeout","interval","setTimeout","setInterval","throttle","debounce"]),H=new Set(["timeout","interval","setTimeout","setInterval","throttle","debounce"]);function h(e,t,n){return e instanceof P.Context?g(n,`service "${t}" returned a cordis Context, which the dynamic facade does not expose. Operate through your own plugin ctx and the services you declared — never another context.`):e}function re(e,t,n){return new Proxy(e,{get(o,i){const s=Reflect.get(o,i,o);return typeof s!="function"?h(s,t,n):(...r)=>{const a=Reflect.apply(s,o,r);return a instanceof Promise?a.then(c=>h(c,t,n)):h(a,t,n)}}})}function ie(e,t){return new Proxy(e,{get(n,o){const i=Reflect.get(n,o,n);return o!=="register"?typeof i!="function"?h(i,"slots",t):(...s)=>h(Reflect.apply(i,n,s),"slots",t):(s,r)=>{if(typeof s!="object"||s===null)return g(t,"slots.register(options, component) needs an options object with a `name`");const a={...s},c=a.name;if(typeof c!="string"||c.length===0)return g(t,"slots.register options need a string `name` (the target slot key)");if(c==="tool.view.cordis"){if(a.key!=="self")return g(t,'tool.view.cordis only accepts key "self"; the runtime binds it to this Package');a.key=`${t.pkg.pluginId}.${t.pkg.packageId}`}const l=e.spec(c);let u=a.priority;(l===void 0||l.kind!=="chain")&&(u=t.allocatePriority(),a.priority=u);const d=Reflect.get(n,"register",n).call(n,a,r);return t.ledger.push({slot:c,priority:u}),t.claim(r),d}}})}function ae(e,t,n){return new Proxy(e,{get(o,i){if(i!=="overrideTokens"){const s=Reflect.get(o,i,o);return typeof s!="function"?h(s,"theme",t):(...r)=>{const a=Reflect.apply(s,o,r);return a instanceof Promise?a.then(c=>h(c,"theme",t)):h(a,"theme",t)}}return(s,r)=>{if(r===void 0&&typeof s=="object"&&s!==null)return g(t,"theme.overrideTokens(source, tokens) takes two arguments; source is replaced with your package id, so pass any string first and the token map second: overrideTokens('mine', { '--dsw-alias-…': { light: '…', dark: '…' } })");const a=Reflect.get(o,"overrideTokens",o),c=Reflect.apply(a,o,[`${t.pkg.pluginId}.${t.pkg.packageId}`,r]);return n.effect(()=>c,"cordis-client-runner: dynamic theme override layer"),c}}})}function A(e,t){const n=new Set(Object.keys(e.fiber.inject)),o=s=>e.get(s)!==void 0?g(t,`service "${s}" is not declared by your plugin. Declare it on the plugin you return: { inject: ['${s}', …], apply(ctx) { … } } — a plain \`function\` has no declaration site, so use the object form. The runtime then parks the package if the provider unloads.`):g(t,`dynamic ctx does not expose "${s}". Available: ctx.on / ctx.provide / timer helpers after injecting timer, and any service your returned plugin declared in inject (slots and theme are the usual UI seats). Framework internals are withheld by design.`),i=(s,r)=>{if(r&&!n.has(s))return o(s);const a=h(e.get(s),s,t);return a===null||typeof a!="object"&&typeof a!="function"?a:s==="slots"?ie(a,t):s==="theme"?ae(a,t,e):re(a,s,t)};return new Proxy({},{get(s,r){if(r==="get")return a=>i(a,!1);if(typeof r=="string")return O.has(r)?(...a)=>{if(H.has(r)&&!n.has("timer"))return o("timer");const c=e[r];return Reflect.apply(c,e,a)}:i(r,!0)},set(s,r){return g(t,`dynamic ctx is read-only; cannot assign "${String(r)}"`)},has:(s,r)=>r==="get"||typeof r=="string"&&(O.has(r)&&(!H.has(r)||n.has("timer"))||n.has(r))})}function g(e,t){const n=new Error(t);throw e.reportFailure(n),n}function b(e){return`dyn/${e}`}var E=class{env;live=new Map;queues=new Map;changeListeners=new Set;nextPriority=0;owners=new WeakMap;failures=new Map;unwatch;snapshotCache;failureCache;constructor(e){this.env=e,this.unwatch=e.slots.onEntryError((t,n,o,i)=>{const s=n.component,r=L(s)?this.owners.get(s):void 0;if(r===void 0)return;const a=y(o),c={slot:t,message:ce(t,a.message),...a.stack===void 0?{}:{stack:a.stack},abdicated:i.abdicated};e.reportRenderFailure(r.agentId,r.pluginId,r.pluginRunId,c),this.failures.set(r.pluginId,c),this.notify()})}subscribe(e){return this.changeListeners.add(e),()=>{this.changeListeners.delete(e)}}renderFailures={getSnapshot:()=>this.failureCache??=new Map(this.failures),subscribe:e=>this.subscribe(e)};getSnapshot(){return this.snapshotCache??=[...this.live.values()].map(({pkg:e,ledger:t,styles:n})=>({pluginId:e.pluginId,packageId:e.packageId,pluginRunId:e.pluginRunId,name:e.name,slots:[...new Set(t.map(o=>o.slot))],styleCount:n.count}))}isLoaded(e){return this.live.has(e)}load(e){return this.enqueue(e.pluginId,async()=>{const t=this.live.get(e.pluginId);if(t!==void 0){if(t.pkg.pluginRunId===e.pluginRunId)return D(t);await this.teardown(t.pkg.pluginId,t.entryId,t.styles)}const n=await this.mount(e);return this.notify(),n})}retract(e,t){this.enqueue(e,async()=>{const n=this.live.get(e);n===void 0||n.pkg.pluginRunId!==t||(await this.teardown(e,n.entryId,n.styles),this.notify())})}async dispose(){this.unwatch();for(const e of[...this.live.values()])await this.teardown(e.pkg.pluginId,e.entryId,e.styles);this.notify()}notify(){this.snapshotCache=void 0,this.failureCache=void 0;for(const e of[...this.changeListeners])e()}enqueue(e,t){const n=(this.queues.get(e)??Promise.resolve()).then(t);return this.queues.set(e,n.then(()=>{},()=>{})),n}async mount(e){const t=new R(e.pluginId),n=[];let o;try{o=await j(e.pluginId,e.code,{invoke:(d,Le)=>this.env.invoke(e.pluginId,e.pluginRunId,d,Le),noteError:d=>{console.error(`[cordis-client-runner] ${e.pluginId} logged an error:`,d)}},t)}catch(d){return t.dispose(),{ok:!1,cause:"evaluate",...y(d),error:d}}const i={pluginId:e.pluginId,packageId:e.packageId,pluginRunId:e.pluginRunId,name:e.name},s=this.guardedSurface(i,e.agentId,o,n),r=b(e.pluginId);this.env.modules.invalidate(r);const a=globalThis.__ModuleLoader__;if(a===void 0)throw new Error("cordis-client-runner: window.__ModuleLoader__ is missing (booted outside the web shell?)");a.load({id:r,factory:()=>s});const c=await this.env.loader.create({name:r}),l=this.env.loader.resolve(c).fiber;if(l===void 0)return await this.teardown(e.pluginId,c,t),{ok:!1,cause:"module-import",message:"module import failed (see the browser console)"};try{await l.await()}catch(d){return await this.teardown(e.pluginId,c,t),{ok:!1,cause:"activate",...y(d),error:d}}const u={pkg:i,entryId:c,styles:t,ledger:n,waitingFor:Object.keys(l.inject).filter(d=>this.env.ctx.get(d)===void 0)};return this.live.set(e.pluginId,u),this.failures.delete(e.pluginId),D(u)}guardedSurface(e,t,n,o){const i=r=>{L(r)&&this.owners.set(r,{pluginId:e.pluginId,pluginRunId:e.pluginRunId,agentId:t})},s=r=>A(r,{pkg:e,ledger:o,claim:i,allocatePriority:()=>--this.nextPriority,reportFailure:a=>{this.env.reportGuardFailure(t,e.pluginId,e.pluginRunId,y(a))}});return typeof n=="function"?{name:b(e.pluginId),apply:r=>n(s(r))}:{...n,name:b(e.pluginId),apply:(r,a)=>n.apply(s(r),a)}}async teardown(e,t,n){this.live.delete(e),this.failures.delete(e),await this.env.loader.remove(t),this.env.modules.invalidate(b(e)),n.dispose()}};function D(e){return{ok:!0,pluginRunId:e.pkg.pluginRunId,...e.waitingFor.length>0?{waitingFor:e.waitingFor}:{}}}function L(e){return typeof e=="object"&&e!==null||typeof e=="function"}function y(e){if(typeof e!="object"||e===null)return{message:String(e)};const t="message"in e&&typeof e.message=="string"?e.message:Object.prototype.toString.call(e),n="stack"in e&&typeof e.stack=="string"?e.stack:void 0;return{message:t,...n===void 0?{}:{stack:n}}}function ce(e,t){const n=Object.entries(C).find(([o,i])=>t.includes(o)&&!t.includes(i))?.[1];return`your entry in slot "${e}" crashed while React rendered it: ${t}`+(n===void 0?"":`
${n}`)}var M=class{env;requests=new Map;activity=new Map;failures=new Map;inFlight=new Map;listeners=new Set;activityCache;failureCache;constructor(e){this.env=e}activeRuns={getSnapshot:()=>this.activityCache??=new Map(this.activity),subscribe:e=>this.observe(e)};lastRunError={getSnapshot:()=>this.failureCache??=new Map(this.failures),subscribe:e=>this.observe(e)};open(e){if(this.requests.set(e.requestId,e),!e.requiresApproval){this.orchestrate({agentId:e.agentId,pluginId:e.pluginId,packageId:e.packageId,mode:e.mode,requestId:e.requestId,hasClientHalf:!0}).catch(t=>{console.error(`[cordis-client-runner] automatic activation ${e.requestId} failed:`,t)});return}this.activity.get(e.pluginId)?.phase!=="orchestrating"&&this.activity.set(e.pluginId,{phase:"awaiting-approval",requestId:e.requestId,agentId:e.agentId,packageId:e.packageId,mode:e.mode,name:e.name,purpose:e.purpose}),this.commit()}reconcileApprovals(e){const t=new Map;for(const o of e){const i=o.latestRun;if(i?.approvalRequestId===void 0||i.status!=="awaiting-approval"&&i.status!=="starting-host"&&i.status!=="client-pending")continue;const s=o.packages.find(r=>r.packageId===i.packageId);s!==void 0&&t.set(i.approvalRequestId,{requestId:i.approvalRequestId,agentId:o.agentId,pluginId:o.pluginId,packageId:i.packageId,mode:i.mode,name:s.name,purpose:s.purpose,requiresApproval:i.requiresApproval??i.status==="awaiting-approval"})}let n=!1;for(const[o,i]of[...this.requests]){if(t.has(o))continue;this.requests.delete(o);const s=this.activity.get(i.pluginId);s?.phase==="awaiting-approval"&&s.requestId===o&&this.activity.delete(i.pluginId),n=!0}for(const[o,i]of t){const s=this.requests.get(o),r=this.activity.get(i.pluginId);if(!(!i.requiresApproval&&r?.phase==="orchestrating")&&!(i.requiresApproval&&le(s,i)&&r?.phase==="awaiting-approval"&&r.requestId===o)){if(!i.requiresApproval){this.open(i),n=!0;continue}this.requests.set(o,i),r?.phase!=="orchestrating"&&this.activity.set(i.pluginId,{phase:"awaiting-approval",requestId:o,agentId:i.agentId,packageId:i.packageId,mode:i.mode,name:i.name,purpose:i.purpose}),n=!0}}n&&this.commit()}close(e){const t=this.requests.get(e);if(t===void 0)return;this.requests.delete(e);const n=this.activity.get(t.pluginId);n?.phase==="awaiting-approval"&&n.requestId===e&&this.activity.delete(t.pluginId),this.commit()}approve(e,t){const n=this.requests.get(e);return n===void 0||!n.requiresApproval?Promise.resolve():this.orchestrate({agentId:n.agentId,pluginId:n.pluginId,packageId:n.packageId,mode:n.mode,requestId:e,approveFutureVersions:t,hasClientHalf:!0})}async decline(e){const t=this.requests.get(e);if(t===void 0||!t.requiresApproval)return;const n=this.activity.get(t.pluginId);n?.phase!=="awaiting-approval"||n.requestId!==e||(this.requests.delete(e),this.activity.delete(t.pluginId),this.commit(),await this.answer(e,{ok:!1,reason:"rejected"}))}startUserRun(e){return this.orchestrate(e)}observe(e){return this.listeners.add(e),()=>{this.listeners.delete(e)}}commit(){this.activityCache=void 0,this.failureCache=void 0;for(const e of[...this.listeners])e()}orchestrate(e){const t=this.inFlight.get(e.pluginId);if(t!==void 0)return t;this.activity.set(e.pluginId,{phase:"orchestrating",agentId:e.agentId,packageId:e.packageId,mode:e.mode}),this.failures.delete(e.pluginId),e.requestId!==void 0&&this.requests.delete(e.requestId),this.commit();const n=this.drive(e).finally(()=>{this.inFlight.delete(e.pluginId),this.activity.delete(e.pluginId),this.commit()});return this.inFlight.set(e.pluginId,n),n}async drive(e){const t=await this.startHost(e);if(!t.ok){this.fail(e,"host-half-failed",t),e.requestId!==void 0&&await this.answer(e.requestId,{...t,reason:"host-half-failed"});return}if(!e.hasClientHalf)return;let n;try{n=await this.env.host.getClientCode(e.agentId,e.pluginId,t.pluginRunId)}catch(s){await this.finishClientFailure(e,t.pluginRunId,t.startedHere,y(s),s);return}const o=await this.env.runner.load({pluginId:n.pluginId,packageId:n.packageId,pluginRunId:n.pluginRunId,agentId:e.agentId,name:n.name,code:n.code}).catch(s=>({ok:!1,cause:"evaluate",...y(s),error:s}));if(!o.ok){await this.finishClientFailure(e,t.pluginRunId,t.startedHere,{message:`${o.cause}: ${o.message}`,...o.stack===void 0?{}:{stack:o.stack}},o.error);return}const i={ok:!0,pluginRunId:o.pluginRunId,...o.waitingFor===void 0?{}:{waitingFor:o.waitingFor}};if(e.requestId!==void 0){await this.answer(e.requestId,i);return}await this.settleDirect(e,i)}async startHost(e){try{return await this.env.host.runHostHalf(e.agentId,e.pluginId,e.packageId,e.mode,e.requestId??null,e.approveFutureVersions??!1)}catch(t){return{ok:!1,...y(t)}}}async finishClientFailure(e,t,n,o,i){console.error(`[cordis-client-runner] Client activation ${e.pluginId}/${e.packageId} (${t}) failed:`,i??o),this.fail(e,"client-half-failed",o);const s={ok:!1,reason:"client-half-failed",pluginRunId:t,startedHere:n,...o};e.requestId!==void 0?await this.answer(e.requestId,s):await this.settleDirect(e,s)}async settleDirect(e,t){try{const n=await this.env.host.settleUserRun(e.agentId,e.pluginId,t);n.ok||this.fail(e,"client-half-failed",n)}catch(n){this.fail(e,"client-half-failed",y(n))}}async answer(e,t){try{await this.env.host.resolveRequestRun(e,t)}catch(n){console.error(`[cordis-client-runner] answering run request ${e} failed:`,n)}}fail(e,t,n){this.failures.set(e.pluginId,{packageId:e.packageId,reason:t,...n}),this.commit()}};function le(e,t){return e?.requestId===t.requestId&&e.agentId===t.agentId&&e.pluginId===t.pluginId&&e.packageId===t.packageId&&e.mode===t.mode&&e.name===t.name&&e.purpose===t.purpose&&e.requiresApproval===t.requiresApproval}var q=class{host;providers=new Map;active=new Map;publishQueued=!1;syncChain=Promise.resolve();constructor(e){this.host=e}register(e){const{manifest:t}=e;if(t.id.trim()==="")throw new Error("Client Cordis inspect provider id must not be empty");if(this.providers.has(t.id))throw new Error(`Client Cordis inspect provider "${t.id}" is already registered`);const n=new Set;for(const i of t.methods){if(n.has(i.name))throw new Error(`Client Cordis inspect provider "${t.id}" repeats method "${i.name}"`);n.add(i.name)}this.providers.set(t.id,e),this.publish();let o=!1;return()=>{o||(o=!0,this.providers.get(t.id)===e&&(this.providers.delete(t.id),this.publish()))}}publish(){this.publishQueued||(this.publishQueued=!0,queueMicrotask(()=>{this.publishQueued=!1;const e=[...this.providers.values()].map(t=>t.manifest);this.syncChain=this.syncChain.then(async()=>{await this.host.sync(e)}).catch(t=>{console.error("[cordis-client-runner] syncing inspect providers failed:",t)})}))}async query(e){if(this.active.has(e.requestId))return;const t=new AbortController;this.active.set(e.requestId,t);let n;try{const o=this.providers.get(e.provider);if(o===void 0)n={ok:!1,reason:"provider-missing",message:`Client inspect provider "${e.provider}" is unavailable`};else if(!o.manifest.methods.some(i=>i.name===e.method))n={ok:!1,reason:"method-missing",message:`Client inspect provider "${e.provider}" has no method "${e.method}"`};else{const i=await o.query(e.method,e.input,{signal:t.signal,sessionId:e.agentId});n=t.signal.aborted?{ok:!1,reason:"cancelled",message:"Client inspect query was cancelled"}:{ok:!0,data:i}}}catch(o){n=t.signal.aborted?{ok:!1,reason:"cancelled",message:"Client inspect query was cancelled"}:{ok:!1,reason:"provider-error",message:o instanceof Error?o.message:String(o)}}finally{this.active.delete(e.requestId)}t.signal.aborted||await this.host.resolve(e.agentId,e.requestId,n)}close(e){this.active.get(e)?.abort(),this.active.delete(e)}};function de(e,t){e.provide("cordisInspect",t)}const pe=[{key:"layout",summary:"The outward layout face (`ctx.layout`): the panel transitions other plugins may trigger — and exactly what a test fake must supply.",description:"The outward layout face (`ctx.layout`): the panel transitions other plugins may trigger — and exactly what a test fake must supply. The attachPanels wiring hook stays on the concrete class (root-entry assembly only).",methods:[{signature:"toggleSidebar(): void",description:"Toggle the sidebar panel (closed ⟷ contract default width).",parameters:[]},{signature:"openDetails(): void",description:"Open the details panel (no-op when already open).",parameters:[]},{signature:"closeDetails(): void",description:"Close the details panel.",parameters:[]}]},{key:"locale",summary:"Dictionary registry plus locale preference.",description:"Dictionary registry plus locale preference. Lookup chain per key: the entry's namespace in the active locale -> that namespace's en fallback -> the shared common namespace (active, then en) -> the key itself (missing text stays visible, fail loud in the UI rather than blank). Reads go through getLocale; writes only through setLocale; continuous sync through the `locale/change` event, or through the LocaleFace getSnapshot/subscribe pair the render machinery consumes (installed via `ctx.slots.installLocale`).",methods:[{signature:"getLocale(): LocaleSnapshot",description:"Read the current immutable locale snapshot.",parameters:[],returns:"the current snapshot (stable reference until the next change)."},{signature:"getSnapshot(): LocaleSnapshot",description:"LocaleFace getSnapshot: the current snapshot (carries `revision`; stable reference between changes, uSES-safe).",parameters:[],returns:"the current snapshot."},{signature:"subscribe(fn: () => void): () => void",description:"LocaleFace subscribe: notified on every snapshot change (locale switch or dictionary registration — registrations bump the revision so already rendered outlets pick up late-arriving dictionaries).",parameters:[{name:"fn",description:"change callback."}],returns:"unsubscribe."},{signature:"setLocale(id: string): void",description:`Switch the active locale — the only user preference write entry.

The durable write happens even when the id already matches the active locale, because the active value may be a provisional browser-derived or fallback resolution that nothing has stored yet. Picking the language already on screen is still an explicit choice, and it must survive a different browser sharing the same DSH home. Only the render notification is conditional: republishing an unchanged locale would churn every subscriber for nothing.`,parameters:[{name:"id",description:"a registered locale id; unknown ids throw."}]},{signature:"register<N extends keyof LocaleNamespaceMap & string>(ns: N, dicts: Record<LocaleId, LocaleDictOf<N>>): () => void",description:"Register a declared namespace's dictionaries, all locales in one call — the typed form: each dictionary is checked against the namespace's LocaleNamespaceMap key union (a missing or extra key is a compile error), and every shipped locale is required (bilingual balance enforced at registration). Duplicate (ns, locale) throws (single occupant; a namespace's texts have one owner). Registration bumps the revision so mounted outlets pick up late-arriving dictionaries.",parameters:[{name:"ns",description:"a namespace merged into LocaleNamespaceMap."},{name:"dicts",description:"complete dictionaries keyed by locale id."}],returns:"disposer removing every locale registered by this call (idempotent)."},{signature:"register(ns: string, locale: string, dict: LocaleDict): () => void",description:"Single-locale untyped form for namespaces outside the merge table (dynamic composition, tests).",parameters:[{name:"ns",description:"namespace."},{name:"locale",description:"locale tag."},{name:"dict",description:"dictionary."}],returns:"disposer (idempotent)."},{signature:"bind<N extends keyof LocaleNamespaceMap & string>(ns: N): TranslateNS<N>",description:"Bind a declared namespace to a translate function typed to its dictionary key union (plus the shared common vocabulary) — the same key domain the framework-injected `t` seat carries. The returned reference is stable per namespace (repeat binds return the same function), so it can ride inject surfaces without breaking memoization.",parameters:[{name:"ns",description:"a namespace merged into LocaleNamespaceMap."}],returns:"the typed translate function (reads the active locale at call time)."},{signature:"bind(ns: string): Translate",description:"Untyped form for namespaces outside the merge table (dynamic composition, tests).",parameters:[{name:"ns",description:"namespace."}],returns:"the translate function."}]},{key:"sessions",summary:"The sessions-service face injected as `ctx.sessions`.",description:"The sessions-service face injected as `ctx.sessions`.",methods:[{signature:"open(id: SessionId): void",description:"Select a session as current.",parameters:[{name:"id",description:"session id (must exist in the list; unknown ids fail loud)."}]},{signature:"openSubagent(address: SubagentAddress): void",description:"Open a healthy catalog child through its exact direct-parent address.",parameters:[{name:"address",description:"catalog-derived parent and child ids."}]},{signature:"setSubagentCatalogOpen(parentSessionId: SessionId, open: boolean): void",description:"Mark whether a catalog menu is consuming live membership updates.",parameters:[{name:"parentSessionId",description:"catalog owner."},{name:"open",description:"current menu state."}]},{signature:"refreshSubagents(parentSessionId: SessionId): Promise<void>",description:"Refresh one direct-child catalog.",parameters:[{name:"parentSessionId",description:"catalog owner."}],returns:"completion of the current or newly started refresh."},{signature:"search( query: string, signal: AbortSignal, ): Promise<RpcResult<{ items: SessionSearchResultItem[]; hasMore: boolean }>>",description:"Search the Host's visible message-content index. Results stay request-local; the list snapshot remains the metadata authority.",parameters:[{name:"query",description:"non-blank literal phrase."},{name:"signal",description:"cancellation for a superseded search."}],returns:"bounded results, or a business/transport error."},{signature:"fork(opts: { sessionId: SessionId; atSeq?: number; increaseTitle?: boolean }): Promise<SessionId>",description:"Fork a session from a completed-turn prefix of the source; on resolution the child is in the list store and `open()` can target it.",parameters:[{name:"opts",description:"source session id, the optional event seq anchoring the cut (the boundary is the first turn/end at or after it; an in-log anchor in an open turn is unavailable rather than clipped backward), and whether to increment an inherited durable title before resolving."}],returns:"the child session id.",throws:["when the fork fails, or when a requested child-title rename fails after creation."]},{signature:"scope(id: SessionId): AgentContext | undefined",description:"Resolve an Agent-scoped context view (use-and-discard).",parameters:[{name:"id",description:"session id."}],returns:"scoped ctx, or undefined for a session neither listed nor already scoped."},{signature:"binding(id: SessionId): SessionBinding | undefined",description:"Resolve the stable session binding (scope-addressed assembly feed).",parameters:[{name:"id",description:"session id."}],returns:"binding, or undefined for a session neither listed nor already scoped."}]},{key:"slots",summary:"cordis Service layer of the slot system; see the module doc for the split with SlotCore.",description:"cordis Service layer of the slot system; see the module doc for the split with SlotCore.",methods:[{signature:"declare readonly register: SlotCore['register']",description:"The single registration API. The typed face IS the core's register (both overloads reused verbatim — one authority, no structural copy; see SlotCore.register for children declaration, store seat, inject face, load-time validation, and the unload cascade). This layer adds: disposal through the caller's ctx.effect (fiber unload = cascade), exclusive-factory minting (`store: createXxxStore` becomes a per-entry handle), the registrant diagnostics stamp, and store-instance lifecycle on the entry axis.\n\nDeclared here, implemented by prototype assignment below the class: it MUST stay a prototype method (never an instance arrow) — the cordis service proxy binds `this.ctx` to the CALLER's context at call time, which is what routes the effect (and the unload cascade) into the caller's fiber. An arrow property would freeze `this` to the service's own root ctx and silently break per-plugin disposal.",parameters:[]},{signature:"inject(key: keyof SlotMap & string, callback: () => SlotInjectionEffect): () => void",description:"Install an effect for each declaration lifetime of a slot. The callback runs synchronously when the declaration already exists; otherwise it runs inside the declaring `register()` call after the declaration is committed. Collapse disposes the effect and a later declaration runs it again. Callback effects are synchronous disposers; iterable effects install transactionally and dispose in reverse order. The controller belongs to the caller's fiber, so plugin unload cancels a pending wait and removes any active contribution.",parameters:[{name:"key",description:"declared SlotMap key to depend on."},{name:"callback",description:"creates one disposer or an iterable of disposers."}],returns:"idempotent disposer for the wait and active effect.",throws:["callback setup failures synchronously when the slot is already declared."]}]},{key:"theme",summary:"Theme registry and preference owner.",description:"Theme registry and preference owner. `light`/`dark` are built in (the base stylesheets carry both palettes); third-party themes register alias-layer overrides. Reads go through getTheme; preference writes only through setTheme; continuous sync only through the `theme/change` event. overrideTokens stacks partial token layers over the active theme without touching the registry. The service holds the `prefers-color-scheme` media query (environment sensing, not presentation) and re-emits when the OS scheme flips while the preference is `system`.",methods:[{signature:"getTheme(): ThemeSnapshot",description:"Read the current immutable theme snapshot.",parameters:[],returns:"the current snapshot (stable reference until the next change)."},{signature:"setTheme(id: string): void",description:"Switch the theme preference — the only user preference write entry. Built-in preferences are written through the settings scope and every accepted value emits `theme/change`.",parameters:[{name:"id",description:"a registered theme id or `system`; unknown ids throw."}]},{signature:"register(definition: ThemeDefinition): () => void",description:"Register a theme. Duplicate id throws (single occupant per id; the built-in pair counts; `system` is a preference, not a registrable id).",parameters:[{name:"definition",description:"theme id, colorScheme, and alias-token overrides."}],returns:"disposer. Disposing the theme backing the active preference resets the preference to the default so the UI never keeps tokens of an unregistered theme."},{signature:"overrideTokens(source: string, tokens: ThemeTokenOverrides): () => void",description:"Stack a token override layer on top of the active theme — the token-level analogue of slot shading: the base theme stays untouched, layers compose in seq order with later layers winning per-token, and removing a layer restores whatever it covered. Calling again with the same source replaces that source's whole layer and restacks it on top (effect re-registration semantics). Emits `theme/change` with the recomposed snapshot.",parameters:[{name:"source",description:"layer identity; one layer per source (dynamic packages pass their package id — the façade pins it, so it also names the layer's origin for inspection)."},{name:"tokens",description:"token-name → `{ light, dark }` value pairs. Validated at runtime (model-authored callers reach this boundary with untyped JS); a bare string value throws a teaching error."}],returns:"disposer removing exactly the layer this call created; a no-op once the source has re-overridden (the newer layer is not torn down)."}]},{key:"timer",summary:"Disposable timer helpers mixed into Cordis contexts.",description:"Disposable timer helpers mixed into Cordis contexts.",methods:[{signature:"timeout(callback: () => void, delay: number): () => void",description:"Run a callback once and return its disposer.",parameters:[]},{signature:"timeout(delay: number): Promise<void>",description:"Resolve after a delay; disposal rejects the pending promise.",parameters:[]},{signature:"interval(callback: () => void, delay: number): () => void",description:"Run a callback repeatedly and return its disposer.",parameters:[]},{signature:"interval<R = any>(delay: number): AsyncIterableIterator<void, R, void>",description:"Return an async iterator of timer ticks.",parameters:[]},{signature:"throttle<F extends (...args: any[]) => void>(callback: F, delay: number, noTrailing?: boolean): F & { dispose: () => void }",description:"Return a throttled function whose timer is disposed with the current fiber.",parameters:[]},{signature:"debounce<F extends (...args: any[]) => void>(callback: F, delay: number): F & { dispose: () => void }",description:"Return a debounced function whose timer is disposed with the current fiber.",parameters:[]}]},{key:"workspaces",summary:"The workspaces-service face injected as `ctx.workspaces`.",description:"The workspaces-service face injected as `ctx.workspaces`.",methods:[{signature:"connectWorkspace(workspaceId: WorkspaceId): Promise<SessionId>",description:"Connect a Workspace to its reusable or freshly created blank session.",parameters:[{name:"workspaceId",description:"target workspace."}],returns:"the connected session id."},{signature:"startSession(workspaceId?: WorkspaceId): void",description:"The New Session flow: connect the explicit, current-Session, or recent Workspace and open the resulting session; failures surface on the session list state.",parameters:[{name:"workspaceId",description:"explicit target; omitted inherits the current Session's Workspace before falling back to the recency projection."}]},{signature:"create(input: { path: string }): Promise<WorkspaceView>",description:"Register an existing path as a Workspace.",parameters:[{name:"input",description:"the Host create payload."}],returns:"the created or idempotently resolved Workspace."},{signature:"pickDirectory(): Promise<string | null>",description:"Open the Host's native directory picker.",parameters:[],returns:"the selected path, or null when the user cancelled."},{signature:"listDirectory(path?: string, signal?: AbortSignal): Promise<DirectoryListing>",description:"List one directory level through the Host's `browse` capability.",parameters:[{name:"path",description:"absolute directory to list; absent lists the Host home directory."},{name:"signal",description:"aborts the wire request (and the Host's scan) when the caller supersedes it."}],returns:"the level's listing with breadcrumb ancestry."},{signature:"createDirectory(path: string, name: string): Promise<string>",description:"Create one child directory through the Host's `browse` capability.",parameters:[{name:"path",description:"absolute existing parent directory."},{name:"name",description:"single non-blank path segment."}],returns:"the created directory's absolute path."},{signature:"openPath(path: string): Promise<void>",description:"Open a filesystem path with the Host operating system's default application.",parameters:[{name:"path",description:"absolute or host-resolvable path."}]},{signature:"rename(workspaceId: WorkspaceId, title: string): Promise<WorkspaceView>",description:"Rename a Workspace.",parameters:[{name:"workspaceId",description:"target workspace."},{name:"title",description:"the new display title."}],returns:"the updated Workspace view."},{signature:"delete(workspaceId: WorkspaceId): Promise<void>",description:"Delete a Workspace (its sessions fall back to the unaccounted group).",parameters:[{name:"workspaceId",description:"target workspace."}]},{signature:"insertSessionBefore(workspaceId: WorkspaceId, sessionId: SessionId, beforeSessionId?: SessionId): Promise<WorkspaceView>",description:"Move an accounted session within/into a Workspace's ordered list.",parameters:[{name:"workspaceId",description:"target workspace."},{name:"sessionId",description:"accounted session to move."},{name:"beforeSessionId",description:"accounted anchor to insert before; omitted appends."}],returns:"the updated Workspace view."},{signature:"archiveSession(sessionId: SessionId): Promise<void>",description:"Archive a session into the registry-global set (hidden from grouping surfaces; session log and accounting slot remain). Archiving the current session clears the selection into the New Session view state.",parameters:[{name:"sessionId",description:"session to archive."}]}]}],ue=[{name:"connection/reset",mode:"emit",signature:"'connection/reset'(): void",summary:"A connection generation was (re-)established.",description:"A connection generation was (re-)established. Wire-derived caches must treat their state as stale and repull (commands directory; the queue mirrors reset themselves through the session resync path).",parameters:[]},{name:"locale/change",mode:"emit",signature:"'locale/change'(snapshot: LocaleSnapshot): void",summary:"The active locale switched.",description:"The active locale switched. Dictionary registrations do NOT emit this event (listeners may re-register slots in response, and boot registers one namespace per package); continuous render refresh rides the LocaleFace revision instead.",parameters:[{name:"snapshot",description:"Current immutable locale snapshot."}]},{name:"slots/changed",mode:"emit",signature:"'slots/changed'(key: string): void",summary:"A slot's definition or registration set changed.",description:"A slot's definition or registration set changed.",parameters:[{name:"key",description:"the mutated SlotMap key."}]},{name:"theme/change",mode:"emit",signature:"'theme/change'(snapshot: ThemeSnapshot): void",summary:"Theme state changed (preference switched, registry updated, or the OS color scheme changed while the preference is `system`).",description:"Theme state changed (preference switched, registry updated, or the OS color scheme changed while the preference is `system`).",parameters:[{name:"snapshot",description:"Current immutable theme snapshot."}]}],N=[{name:"ActionsDecl",declaration:"export type ActionsDecl<T> = Record<string, (draft: T, ...params: any[]) => void>;"},{name:"AgentContext",declaration:`export type AgentContext = Omit<Context, 'remote'> & {
    readonly remote: TypertClientRemote & TypertRemoteScopeApi<'agent'>;
};`},{name:"AssistantBlock",declaration:`export type AssistantBlock = {
    kind: 'text';
    text: string;
} | {
    kind: 'reasoning';
    text: string;
} | {
    kind: 'image';
    attachment: ImageAttachmentRef;
} | {
    kind: 'tool-call';
    callId: string;
    name: string;
    argsRaw: string;
} | {
    kind: 'other';
    block: unknown;
};`},{name:"AssistantMessageNode",declaration:`export interface AssistantMessageNode {
    kind: 'assistant';
    seq: number;
    messageId?: MessageId;
    time: number;
    turn: number;
    step: number;
    blocks: readonly AssistantBlock[];
    usage?: unknown;
    provenance?: AssistantProvenanceView;
    requestConfig?: AssistantRequestConfig;
    timing?: AssistantTiming;
    interrupted?: true;
}`},{name:"AssistantProvenanceView",declaration:`export interface AssistantProvenanceView {
    provider: string;
    model: string;
}`},{name:"AssistantRequestConfig",declaration:`export interface AssistantRequestConfig {
    provider: string;
    model: string;
    purpose?: string;
    thinking?: string;
    reasoningEffort?: string;
    temperature?: number;
    maxTokens?: number;
    stop?: readonly string[];
}`},{name:"AssistantTiming",declaration:`export interface AssistantTiming {
    stepStartTime: number | null;
    firstTokenTime: number | null;
    completedTime: number;
}`},{name:"BakedActions",declaration:`export type BakedActions<T, A extends ActionsDecl<T>> = {
    [K in keyof A]: A[K] extends (draft: T, ...params: infer P) => void ? (...params: P) => void : never;
};`},{name:"BoundActions",declaration:"export type BoundActions<H> = H extends StoreHandle<infer T, infer A> ? BakedActions<T, A> : never;"},{name:"ChainKeysOf",declaration:"export type ChainKeysOf<S extends keyof SlotMap & string> = S extends unknown ? (SlotMap[S]['kind'] extends 'chain' ? S : never) : never;"},{name:"ChainRenderOpts",declaration:`export interface ChainRenderOpts {
    fallback?: ReactNode;
    overlay?: boolean;
}`},{name:"ChatConversationViewNode",declaration:`export interface ChatConversationViewNode extends ConversationViewNode {
    readonly target: 'chat';
    readonly anchorSeq: number;
    readonly location: ConversationLocation;
    readonly visibility: 'visible' | 'hidden';
}`},{name:"ChatLocationNodeIndex",declaration:`export interface ChatLocationNodeIndex {
    getTurn(turn: number): readonly string[];
    getStep(turn: number, step: number): readonly string[];
}`},{name:"ChatNodeStore",declaration:`export interface ChatNodeStore {
    get(key: string): ChatConversationViewNode | undefined;
    values(): readonly ChatConversationViewNode[];
}`},{name:"ChatSnapshot",declaration:`export interface ChatSnapshot {
    readonly order: readonly string[];
    readonly nodes: ChatNodeStore;
    readonly locations: ChatLocationNodeIndex;
    readonly timeline: ConversationTimelineSnapshot;
    readonly legacy: LegacyConversationSlice;
}`},{name:"ChildrenDecl",declaration:`export type ChildrenDecl = {
    [P in keyof SlotMap & string]?: SlotSpec<SlotMap[P]>;
};`},{name:"CommandNode",declaration:`export interface CommandNode {
    kind: 'command';
    seq: number;
    time: number;
    commandId: CommandId;
    name: string | null;
    args: string | null;
    outcome: {
        kind: 'success' | 'error';
        text?: string;
        sourceEventSeq?: number;
    } | null;
}`},{name:"CommonKeyOf",declaration:`export type CommonKeyOf = LocaleNamespaceMap extends {
    common: infer C;
} ? C & string : never;`},{name:"CompactionSummaryNode",declaration:`export interface CompactionSummaryNode {
    kind: 'compaction';
    seq: number;
    time: number;
    summary: string | null;
    summaryEventSeq: number | null;
    shadowedItemCount: number | null;
    shadowedTokenCount: number | null;
}`},{name:"ComposedProps",declaration:"export type ComposedProps<K extends keyof SlotMap & string, EntryKey extends EntryKeyOf<K>, S extends keyof SlotMap & string, H, I extends object, M = never, N = undefined> = PropsRuntime<K, EntryKey> & PropsRenderSlots<S> & PropsStore<H> & InjectFace<I> & MatchedShare<SlotMap[K], M> & PropsLocale<N>;"},{name:"ComposerPhase",declaration:"export type ComposerPhase = 'blank' | 'engaging' | 'active';"},{name:"ContextMessageNode",declaration:`export interface ContextMessageNode {
    kind: 'context';
    seq: number;
    time: number;
    content: readonly ContentBlock[];
    source: unknown;
    provenance: ContextProvenanceView;
    form: KnownContextForm | null;
}`},{name:"ContextProvenanceView",declaration:`export interface ContextProvenanceView {
    role: ContextRole;
    label: string | null;
}`},{name:"ContextRole",declaration:"export type ContextRole = 'inject' | 'recall';"},{name:"ConversationLocation",declaration:`export type ConversationLocation = {
    readonly kind: 'session';
} | {
    readonly kind: 'turn';
    readonly turn: TurnLocation;
} | {
    readonly kind: 'step';
    readonly turn: TurnLocation;
    readonly step: StepLocation;
} | {
    readonly kind: 'unresolved';
};`},{name:"ConversationLocationDataStore",declaration:`export interface ConversationLocationDataStore<DataMap extends object> {
    get<Key extends keyof DataMap & string>(key: Key): Readonly<DataMap[Key]> | undefined;
}`},{name:"ConversationNode",declaration:"export type ConversationNode = UserMessageNode | AssistantMessageNode | SteeringMessageNode | ContextMessageNode | ModelRetryNode | TurnErrorNode | TurnMaxTokensNode | ToolResultNode | CommandNode | CompactionSummaryNode | UnknownSurfaceNode;"},{name:"ConversationSnapshot",declaration:`export interface ConversationSnapshot {
    sessionId: SessionId;
    views: ConversationViewSnapshotStore;
    chat: ChatSnapshot;
    nodes: readonly ConversationNode[];
    turnTimings: ReadonlyMap<number, {
        readonly startTime: number;
        readonly endTime?: number;
    }>;
    turnEnds: ReadonlyMap<number, number>;
    partial: PartialAssistant | null;
    runningCalls: readonly RunningToolCall[];
    pending: readonly PendingInteraction[];
    queue: readonly QueuedMessage[];
    running: boolean;
    subagent: {
        address: SubagentAddress;
        parentAvailable: boolean;
    } | null;
    composerPhase: ComposerPhase;
    removed: boolean;
    openState: OpenState;
    openError: RpcError | null;
    hasMore: boolean;
    loadingOlder: boolean;
    promptError: PromptError | null;
    blank: boolean;
    lastAgentError: string | null;
}`},{name:"ConversationStepDataMap",declaration:`export interface ConversationStepDataMap {
}`},{name:"ConversationTimelineSnapshot",declaration:`export interface ConversationTimelineSnapshot {
    readonly turnOrder: readonly number[];
    readonly turns: ReadonlyMap<number, TurnLocation>;
}`},{name:"ConversationTurnDataMap",declaration:`export interface ConversationTurnDataMap {
}`},{name:"ConversationViewNode",declaration:`export interface ConversationViewNode {
    readonly key: string;
    readonly kind: string;
    readonly id: string;
    readonly target: string;
    readonly data: unknown;
}`},{name:"ConversationViewSnapshotMap",declaration:`export interface ConversationViewSnapshotMap {
}`},{name:"ConversationViewSnapshotStore",declaration:`export interface ConversationViewSnapshotStore {
    get<Target extends Extract<keyof ConversationViewSnapshotMap, string>>(target: Target): ConversationViewSnapshotMap[Target] | undefined;
}`},{name:"EntryKeyOf",declaration:`export type EntryKeyOf<K extends keyof SlotMap & string> = SlotMap[K] extends {
    kind: 'keyed';
    keyProps: infer P extends object;
} ? keyof P & string : string;`},{name:"GlobalStandardProps",declaration:`export interface GlobalStandardProps {
}`},{name:"HandleOf",declaration:"export type HandleOf<H> = H extends () => infer R ? R : H;"},{name:"HooksSources",declaration:"export type HooksSources = Record<string, HostObservable<unknown>>;"},{name:"HostObservable",declaration:`export interface HostObservable<T> {
    getSnapshot(): T;
    subscribe(fn: () => void): () => void;
}`},{name:"InjectFace",declaration:`export type InjectFace<I extends object> = I extends {
    hooks: infer HS extends HooksSources;
} ? Omit<I, 'hooks'> & PropsHooks<HS> : I;`},{name:"InjectParams",declaration:`export type InjectParams<K extends keyof SlotMap & string, H> = ScopeOf<K> extends 'session' ? ([
    H
] extends [
    StoreDecl
] ? [
    sessionId: SessionIdOf,
    actions: BoundActions<HandleOf<H>>
] : [
    sessionId: SessionIdOf
]) : ScopeOf<K> extends 'session-maybe' ? ([
    H
] extends [
    StoreDecl
] ? [
    sessionId: SessionIdOf | undefined,
    actions: BoundActions<HandleOf<H>> | undefined
] : [
    sessionId: SessionIdOf | undefined
]) : ([
    H
] extends [
    StoreDecl
] ? [
    actions: BoundActions<HandleOf<H>>
] : [
]);`},{name:"ISession",declaration:`export interface ISession {
    readonly sessionId: SessionId;
    readonly projections: ProjectionsFace;
    prompt(content: PromptContentPart[], mode: 'queue' | 'steer', signal?: AbortSignal): Promise<RpcResult<{
        accepted: true;
    }>>;
    readAttachment(attachmentId: AttachmentIdType): Promise<RpcResult<{
        attachment: ImageAttachmentRef;
        data: Uint8Array;
    }>>;
    updateQueue(itemId: MessageId, action: QueueAction): Promise<RpcResult<{
        accepted: true;
    }>>;
    cancel(): Promise<RpcResult<{
        accepted: true;
    }>>;
    rename(title: string): Promise<RpcResult<{
        title: string;
        seq: number;
    }>>;
    loadOlder(): Promise<void>;
    command(line: string): Promise<RemoteResult<{
        matched: boolean;
    }>>;
}`},{name:"KeyPropsOf",declaration:`export type KeyPropsOf<K extends keyof SlotMap & string, EntryKey extends EntryKeyOf<K>> = SlotMap[K] extends {
    kind: 'keyed';
    keyProps: infer P extends object;
} ? EntryKey extends keyof P ? P[EntryKey] extends object ? P[EntryKey] : never : never : object;`},{name:"KnownContextForm",declaration:"export type KnownContextForm = typeof KNOWN_FORMS[number];"},{name:"LegacyConversationSlice",declaration:`export interface LegacyConversationSlice {
    readonly nodes: readonly ConversationNode[];
    readonly turnTimings: ReadonlyMap<number, {
        readonly startTime: number;
        readonly endTime?: number;
    }>;
    readonly turnEnds: ReadonlyMap<number, number>;
    readonly partial: PartialAssistant | null;
    readonly runningCalls: readonly RunningToolCall[];
}`},{name:"LocaleDefinition",declaration:`export interface LocaleDefinition {
    id: LocaleId;
    label: string;
}`},{name:"LocaleDict",declaration:"export type LocaleDict = Record<string, string>;"},{name:"LocaleDictOf",declaration:"export type LocaleDictOf<N extends keyof LocaleNamespaceMap & string> = Record<LocaleNamespaceMap[N] & string, string>;"},{name:"LocaleId",declaration:"export type LocaleId = typeof LOCALE_IDS[number];"},{name:"LocaleKeysOf",declaration:"export type LocaleKeysOf<N extends keyof LocaleNamespaceMap & string> = (LocaleNamespaceMap[N] & string) | CommonKeyOf;"},{name:"LocaleNamespaceMap",declaration:`export interface LocaleNamespaceMap {
}`},{name:"LocaleSnapshot",declaration:`export interface LocaleSnapshot {
    active: LocaleId;
    locales: readonly LocaleDefinition[];
    revision: number;
}`},{name:"MatchedShare",declaration:`export type MatchedShare<E extends SlotEntryDef, M> = E['kind'] extends 'chain' ? {
    matched: M;
} : object;`},{name:"ModelRetryNode",declaration:`export type ModelRetryNode = LlmRetryEventData & {
    kind: 'model-retry';
    seq: number;
    time: number;
    retryState: 'scheduled' | 'started' | 'cancelled';
};`},{name:"ObservableSnapshot",declaration:`export interface ObservableSnapshot<T> {
    getSnapshot(): T;
    subscribe(fn: () => void): () => void;
}`},{name:"OpenState",declaration:"export type OpenState = 'cold' | 'loading' | 'open' | 'error';"},{name:"OwnerOf",declaration:`export type OwnerOf<K extends keyof SlotMap & string> = SlotMap[K] extends {
    owner: infer O extends object;
} ? O : object;`},{name:"PartialAssistant",declaration:`export interface PartialAssistant {
    turn: number;
    step: number;
    blocks: readonly AssistantBlock[];
}`},{name:"PendingInteraction",declaration:`export type PendingInteraction = {
    [K in PendingKind]: PendingWait<K>;
}[PendingKind];`},{name:"PendingKind",declaration:"export type PendingKind = keyof PendingPayloads;"},{name:"PendingPayloads",declaration:`export interface PendingPayloads {
    approval: Omit<Extract<MuxFrame, {
        type: 'approval/requested';
    }>, 'type' | 'sessionId'>;
    question: Omit<Extract<MuxFrame, {
        type: 'question/requested';
    }>, 'type' | 'sessionId'>;
}`},{name:"PendingWait",declaration:`export class PendingWait<K extends PendingKind = PendingKind> {
    readonly kind: K;
    readonly key: string;
    readonly sessionId: SessionId;
    readonly payload: PendingPayloads[K];
    constructor(kind: K, rpcId: RpcId, sessionId: SessionId, payload: PendingPayloads[K], respond: (message: ClientResponse) => Promise<RpcReceipt>);
    respond(result: ClientResponse['result']): Promise<RpcReceipt>;
    markSettled(): void;
}`},{name:"ProjectionsFace",declaration:`export interface ProjectionsFace {
    faceOf(key: string): ObservableSnapshot<unknown>;
}`},{name:"PromptError",declaration:`export interface PromptError {
    op: 'send' | 'stop';
    error: RpcError;
}`},{name:"PropsHooks",declaration:"export type PropsHooks<HS extends HooksSources> = {\n    [N in keyof HS & string as `use${Capitalize<N>}`]: SnapshotSelectorHook<HS[N] extends HostObservable<infer T> ? T : never>;\n};"},{name:"PropsLocale",declaration:`export type PropsLocale<N> = N extends keyof LocaleNamespaceMap & string ? {
    t: TranslateNS<N>;
} : object;`},{name:"PropsRenderSlots",declaration:`export type PropsRenderSlots<S extends keyof SlotMap & string> = {
    renderSlot: RenderSlotFn<Exclude<S, ChainKeysOf<S>>>;
    readonly __renders?: ((key: S) => void) | undefined;
} & ([
    ChainKeysOf<S>
] extends [
    never
] ? object : {
    renderSlotChain: <K extends ChainKeysOf<S>>(key: K, owner: OwnerOf<K>, opts?: ChainRenderOpts) => ReactNode;
}) & ('session' extends ScopeOf<S> ? {
    SessionProvider: SessionProviderComponent;
} : object);`},{name:"PropsRuntime",declaration:"export type PropsRuntime<K extends keyof SlotMap & string, EntryKey extends EntryKeyOf<K> = EntryKeyOf<K>> = OwnerOf<K> & KeyPropsOf<K, EntryKey> & SlotInjectFace<SlotInjectOf<K>> & (ScopeOf<K> extends 'session' ? SessionStandardProps : ScopeOf<K> extends 'session-maybe' ? SessionMaybeStandardProps : object) & GlobalStandardProps;"},{name:"PropsSlotHooks",declaration:"export type PropsSlotHooks<HS extends object> = {\n    [N in keyof HS & string as `use${Capitalize<N>}`]: BoundHookOf<HS[N]>;\n};"},{name:"PropsStore",declaration:`export type PropsStore<H> = H extends StoreHandle<infer T, infer A> ? {
    useStore: SnapshotSelectorHook<T>;
    actions: BakedActions<T, A>;
} : object;`},{name:"QueueAction",declaration:"export type QueueAction = Parameters<SessionFace['updateQueue']>[1];"},{name:"RunningToolCall",declaration:`export interface RunningToolCall {
    callId: string;
    name: string;
    argsRaw: string;
    turn: number;
    step: number;
    time: number;
    callView: ToolCallView | null;
    subCalls: readonly ToolCallBlock[];
}`},{name:"ScopeOf",declaration:"export type ScopeOf<K extends keyof SlotMap & string> = SlotMap[K]['scope'];"},{name:"SessionAreaProps",declaration:`export interface SessionAreaProps {
    empty?: (() => ReactNode) | undefined;
    children: (sessionId: SessionIdOf) => ReactNode;
}`},{name:"SessionBinding",declaration:`export interface SessionBinding {
    readonly sessionId: SessionId;
    readonly session: SessionFace;
    readonly ctx: AgentContext;
}`},{name:"SessionFace",declaration:"export type SessionFace = ISession & ObservableSnapshot<ConversationSnapshot>;"},{name:"SessionIdOf",declaration:`export type SessionIdOf = SessionStandardProps extends {
    sessionId: infer S;
} ? S : string;`},{name:"SessionMaybeStandardProps",declaration:`export interface SessionMaybeStandardProps {
}`},{name:"SessionProviderComponent",declaration:"export type SessionProviderComponent = (props: SessionAreaProps) => ReactNode;"},{name:"SessionSearchResultItem",declaration:`export interface SessionSearchResultItem {
    sessionId: SessionId;
    snippet: string;
}`},{name:"SessionStandardProps",declaration:`export interface SessionStandardProps {
}`},{name:"SlotComponent",declaration:"export type SlotComponent<P> = (props: P) => ReactNode;"},{name:"SlotCore",declaration:`export class SlotCore {
    constructor();
    register<K extends keyof SlotMap & string, const EntryKey extends EntryKeyOf<K> = EntryKeyOf<K>, const D extends ChildrenDecl = Record<never, never>, H extends StoreDecl | undefined = undefined, M = never, N extends (keyof LocaleNamespaceMap & string) | undefined = undefined, C extends SlotComponent<never> = SlotComponent<never>>(options: BaseOptions<K, EntryKey, D, H, M, N> & {
        inject?: undefined;
    }, component: C & SlotComponent<ComposedProps<K, NoInfer<EntryKey>, keyof NoInfer<D> & keyof SlotMap & string, HandleOf<NoInfer<H>>, object, NoInfer<M>, NoInfer<N>>> & RendersCheck<C, D>): () => void;
    register<K extends keyof SlotMap & string, I extends object, const EntryKey extends EntryKeyOf<K> = EntryKeyOf<K>, const D extends ChildrenDecl = Record<never, never>, H extends StoreDecl | undefined = undefined, M = never, N extends (keyof LocaleNamespaceMap & string) | undefined = undefined, C extends SlotComponent<never> = SlotComponent<never>>(options: BaseOptions<K, EntryKey, D, H, M, N> & {
        inject: (...args: InjectParams<K, H>) => I;
    }, component: C & SlotComponent<ComposedProps<K, NoInfer<EntryKey>, keyof NoInfer<D> & keyof SlotMap & string, HandleOf<NoInfer<H>>, I, NoInfer<M>, NoInfer<N>>> & RendersCheck<C, D>): () => void;
    register(options: ErasedOptions, component: unknown): () => void;
    isLive(entry: StoredEntry): boolean;
    entries(key: string): readonly StoredEntry[];
    entriesOfSlot(key /* …truncated — full shape in source */`},{name:"SlotEntryDef",declaration:`export interface SlotEntryDef {
    kind: SlotKind;
    scope: SlotScope;
    owner?: object;
    keyProps?: Record<string, object>;
    hookContext?: unknown;
    inject?: object;
}`},{name:"SlotInjectFace",declaration:`export type SlotInjectFace<I extends object> = I extends {
    hooks: infer HS extends object;
} ? Omit<I, 'hooks'> & PropsSlotHooks<HS> : I;`},{name:"SlotInjectOf",declaration:`export type SlotInjectOf<K extends keyof SlotMap & string> = SlotMap[K] extends {
    inject: infer Injected extends object;
} ? Injected : object;`},{name:"SlotKind",declaration:"export type SlotKind = 'single' | 'list' | 'keyed' | 'chain';"},{name:"SlotLabel",declaration:"export type SlotLabel = string | (() => string);"},{name:"SlotMap",declaration:`export interface SlotMap {
}`},{name:"SlotScope",declaration:"export type SlotScope = 'root' | 'session-maybe' | 'session';"},{name:"SlotSpec",declaration:`export type SlotSpec<E extends SlotEntryDef> = {
    kind: E['kind'];
    scope: E['scope'];
} & ('inject' extends keyof E ? E extends {
    inject: infer Injected extends object;
} ? {
    inject: Injected;
} : {
    inject?: object;
} : {
    inject?: never;
});`},{name:"SnapshotSelectorHook",declaration:"export type SnapshotSelectorHook<T> = <S>(sel: (s: T) => S, eq?: (a: S, b: S) => boolean) => S;"},{name:"SteeringMessageNode",declaration:`export interface SteeringMessageNode {
    kind: 'steering';
    messageId: MessageId;
    seq: number;
    time: number;
    content: readonly ContentBlock[];
    source: unknown;
}`},{name:"StepLocation",declaration:`export interface StepLocation {
    readonly turn: number;
    readonly step: number;
    readonly start: SessionEvent<'step/start'> | undefined;
    readonly end: SessionEvent<'step/end'> | undefined;
    readonly status: 'open' | 'closed' | 'unknown';
    readonly data: ConversationLocationDataStore<ConversationStepDataMap>;
}`},{name:"StoreDecl",declaration:"export type StoreDecl = StoreHandle<any, any> | StoreFactory;"},{name:"StoredEntry",declaration:`export interface StoredEntry {
    component: unknown;
    options: {
        key?: string;
        id?: string;
        order?: number;
        label?: SlotLabel;
        priority?: number;
    };
    select?: ((owner: never) => unknown) | undefined;
    inject?: ((...args: never[]) => Record<string, unknown>) | undefined;
    children?: Readonly<Record<string, SlotSpec<SlotEntryDef>>> | undefined;
    store?: StoreDecl | undefined;
    locale?: string | undefined;
    registrant?: string | undefined;
}`},{name:"StoreFactory",declaration:"export type StoreFactory = () => StoreHandle<any, any>;"},{name:"StoreHandle",declaration:`export interface StoreHandle<T, A extends ActionsDecl<T>> {
    readonly spec: StoreSpec<T, A>;
    create(scopeKey?: string): StoreInstance<T, A>;
}`},{name:"StoreInstance",declaration:`export interface StoreInstance<T, A extends ActionsDecl<T>> {
    readonly actions: BakedActions<T, A>;
    getSnapshot(): T;
    subscribe(fn: () => void): () => void;
    clearPersisted(): void;
}`},{name:"StoreSpec",declaration:`export interface StoreSpec<T, A extends ActionsDecl<T>> {
    init: () => T;
    persist?: string;
    actions: A;
}`},{name:"ThemeDefinition",declaration:`export interface ThemeDefinition {
    id: string;
    colorScheme: 'light' | 'dark';
    tokens: ThemeTokens;
}`},{name:"ThemePreference",declaration:"export type ThemePreference = typeof THEME_PREFERENCES[number];"},{name:"ThemeSnapshot",declaration:`export interface ThemeSnapshot {
    preference: ThemePreference;
    active: ThemeDefinition;
    themes: readonly ThemeDefinition[];
    revision: number;
}`},{name:"ThemeTokenModes",declaration:`export interface ThemeTokenModes {
    light: string;
    dark: string;
}`},{name:"ThemeTokenOverrides",declaration:"export type ThemeTokenOverrides = Record<string, ThemeTokenModes>;"},{name:"ThemeTokens",declaration:"export type ThemeTokens = Record<string, string>;"},{name:"ToolCallBlock",declaration:"export type ToolCallBlock = RunningToolCall | ToolResultNode;"},{name:"ToolResultNode",declaration:`export interface ToolResultNode {
    kind: 'tool-result';
    seq: number;
    time: number;
    callId: string;
    call: {
        name: string;
        argsRaw: string;
    } | null;
    callTime: number | null;
    content: readonly ContentBlock[];
    isError: boolean;
    error?: {
        name: string;
        code: string;
    };
    meta?: unknown;
    callView: ToolCallView | null;
    resultView: ToolResultView | null;
    subCalls: readonly ToolCallBlock[];
}`},{name:"Translate",declaration:"export type Translate<K extends string = string> = (key: K, params?: Record<string, unknown>) => string;"},{name:"TranslateNS",declaration:"export type TranslateNS<N extends keyof LocaleNamespaceMap & string> = Translate<LocaleKeysOf<N>>;"},{name:"TurnErrorNode",declaration:`export interface TurnErrorNode {
    kind: 'turn-error';
    seq: number;
    time: number;
    turn: number;
    step: number;
    message: string;
    code?: string;
}`},{name:"TurnLocation",declaration:`export interface TurnLocation {
    readonly turn: number;
    readonly start: SessionEvent<'turn/start'> | undefined;
    readonly end: SessionEvent<'turn/end'> | undefined;
    readonly status: 'open' | 'closed' | 'unknown';
    readonly steps: readonly StepLocation[];
    readonly data: ConversationLocationDataStore<ConversationTurnDataMap>;
}`},{name:"TurnMaxTokensNode",declaration:`export interface TurnMaxTokensNode {
    kind: 'turn-max-tokens';
    seq: number;
    time: number;
    turn: number;
    step: number;
}`},{name:"UnknownSurfaceNode",declaration:`export interface UnknownSurfaceNode {
    kind: 'unknown';
    seq: number;
    time: number;
    type: string;
    data: unknown;
}`},{name:"UserMessageNode",declaration:`export interface UserMessageNode {
    kind: 'user';
    seq: number;
    time: number;
    content: readonly ContentBlock[];
    source: unknown;
}`}];function W(e){const t=new Set;let n=[...e];for(;n.length>0;){const o=[];for(const i of N){if(t.has(i.name))continue;const s=new RegExp(`\b${i.name}\b`);n.some(r=>s.test(r))&&(t.add(i.name),o.push(i.declaration))}n=o}return N.filter(o=>t.has(o.name))}function he(e){return/^[A-Za-z_$][\w$]*$/.test(e)?`ctx.${e}`:`ctx[${JSON.stringify(e)}]`}function me(e,t=pe){if(e===void 0)return{mode:"catalog",services:t.map(o=>({key:o.key,description:o.summary,methods:o.methods.map(i=>({signature:i.signature}))}))};const n=t.find(o=>o.key===e);if(n===void 0)throw new Error(`no catalogued Service named "${e}"`);return{mode:"service",service:{key:n.key,description:n.description,access:{optional:{expression:`ctx.get(${JSON.stringify(n.key)})`,requiresUndefinedCheck:!0},hardDependency:{inject:[n.key],expression:he(n.key)}},methods:n.methods},referencedTypes:W(n.methods.map(o=>o.signature))}}function ge(e,t=ue){if(e===void 0)return{mode:"catalog",events:t.map(o=>({name:o.name,description:o.summary,mode:o.mode,signature:o.signature}))};const n=t.find(o=>o.name===e);if(n===void 0)throw new Error(`no catalogued Event named "${e}"`);return{mode:"event",event:{name:n.name,description:n.description,mode:n.mode,signature:n.signature,parameters:n.parameters},referencedTypes:W([n.signature])}}const ye=[{key:"conversation",kind:"single",scope:"session-maybe",summary:"The whole center column, across both the no-session hero and a live conversation.",doc:`The whole center column, across both the no-session hero and a live
conversation. OCCUPIED by ui-conversation's ConversationRoot, which
declares the session body, composer, and input seats inside it —
registering here replaces the entire conversation surface (and removes
every seat it declares) rather than adding to it.

Current-session-optional: the occupant owns both states without
changing its React identity, so it keeps its own state across a session
switch. It receives no owner props; session facts arrive through the
framework hooks of the \`session-maybe\` scope.`,registerOptions:[],ownerProps:[`/** Conversation owner share: business state and actions belong to the registrant. */
export interface ConvOwnerProps {}`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>","useSession: MaybeSnapshotSelectorHook<ConversationSnapshot>","sessionId: SessionId | undefined","useProjection: UseProjection","useInput: MaybeSnapshotSelectorHook<InputState>","inputActions: InputActions | undefined"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'root' (client-ui-layout), so it exists while that entry is mounted",occupants:["client-ui-conversation ConversationRoot"],replaceRisk:"shadows-shipped-ui",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('conversation', () => ctx.slots.register(
      { name: 'conversation' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-layout/src/client/index.ts:62"},{key:"conversation.chat.assistant-actions",kind:"list",scope:"session",summary:"Action strip attached to one finalized assistant message, rendered inside that message's IconActions row.",doc:`Action strip attached to one finalized assistant message, rendered
inside that message's IconActions row. The chat entry owns the render
site and passes the addressed message identity; contributors add
per-message actions without importing the conversation implementation.
Entries render by ascending \`order\`.`,registerOptions:[{name:"id",requirement:"required",type:"string",doc:"Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."},{name:"order",requirement:"optional",type:"number",doc:"Position among the entries, ascending (default 0)."},{name:"label",requirement:"optional",type:"string | (() => string)",doc:"Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."}],ownerProps:[`/**
 * Owner currency of the assistant-message action strip: the durable identity
 * of the one finalized message the contributed actions address. Only finalized
 * messages reach this slot, so the id is always present.
 */
export interface AssistantActionOwnerProps {
  /** Stable identity carried from the \`assistant/message\` event. */
  messageId: MessageId
}`],ownerPropsReferences:["MessageId"],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>","useSession: SnapshotSelectorHook<ConversationSnapshot>","sessionId: SessionId","useProjection: UseProjection","useInput: SnapshotSelectorHook<InputState>","inputActions: InputActions"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'conversation.chat.node' (client-ui-conversation), so it exists while that entry is mounted",occupants:["client-ui-message-feedback MessageFeedbackActions id 'feedback'"],replaceRisk:"none",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('conversation.chat.assistant-actions', () => ctx.slots.register(
      { name: 'conversation.chat.assistant-actions', id: 'my-entry', order: 100, label: 'My entry' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-conversation/src/client/contract/slots.ts:148"},{key:"conversation.chat.commandview",kind:"keyed",scope:"session",summary:"The chat view's per-command row hole: keyed dispatch on the command name (`command/run.name`; a run-less cross-window node has none and always lands on the fallback).",doc:"The chat view's per-command row hole: keyed dispatch on the command\nname (`command/run.name`; a run-less cross-window node has none and\nalways lands on the fallback). Declared by the chat view entry; the\nrender site dispatches via `entryKey: name` with GenericCommandCard as\nthe `fallback` — a slash command renders durably with zero\nregistration, and a domain upgrades by registering one row component.",registerOptions:[{name:"key",requirement:"required",type:"string",doc:"Your cell key: the entry renders where the owner dispatches this exact key. Registering an already-occupied key replaces that occupant."}],ownerProps:[`/**
 * Owner share of the per-command row slot: the frozen {@link CommandNode}
 * slice off the snapshot (cache-stable reference — memo premise). The node
 * carries the whole lifecycle (structured name/args, pairing id, and
 * outcome-or-executing). A successful domain command may also carry the
 * explicitly linked projection node needed to fold two log records into one
 * presentation row.
 */
export interface CommandRowOwnerProps {
  /** Folded command lifecycle node (run + optional done). */
  node: CommandNode
  /** Explicitly linked compaction checkpoint for the settled \`/compact\` presentation. */
  compaction?: CompactionSummaryNode
}`],ownerPropsReferences:["CommandNode","CompactionSummaryNode"],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>","useSession: SnapshotSelectorHook<ConversationSnapshot>","sessionId: SessionId","useProjection: UseProjection","useInput: SnapshotSelectorHook<InputState>","inputActions: InputActions"],keyDomain:"open: any string the owner dispatches (no compile-time key set), none are taken yet",hookContext:"",slotInject:"",declaredBy:"an entry in 'conversation.chat.node' (client-ui-conversation), so it exists while that entry is mounted",occupants:[],replaceRisk:"none",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('conversation.chat.commandview', () => ctx.slots.register(
      { name: 'conversation.chat.commandview', key: '<one key the owner dispatches>' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-conversation/src/client/contract/slots.ts:133"},{key:"conversation.chat.node",kind:"keyed",scope:"session",summary:"Final business node renderer, dispatched by `ChatConversationViewNode.kind`.",doc:"Final business node renderer, dispatched by `ChatConversationViewNode.kind`.",registerOptions:[{name:"key",requirement:"required",type:"string",doc:"Your cell key: the entry renders where the owner dispatches this exact key. Registering an already-occupied key replaces that occupant."}],ownerProps:[`/** Stable owner currency delivered to one keyed Chat business renderer. */
export interface ChatNodeOwnerProps {
  /** Selected Tool call, when the shared details store names one. */
  selectedCallId?: CallId | undefined
  /** Session workspace root; Tool summaries display paths relative to it. */
  cwd?: string | undefined
  openFile: (path: string) => void
  inspectCall: (callId: CallId) => void
  forkAt: (seq: number) => void
  /** Render a historical image group through the attachment slot. */
  renderMessageImages: RenderMessageImages
  fileMentions: (owner: TurnTailOwnerProps) => MarkdownFileMentions | undefined
}`],ownerPropsReferences:["MarkdownFileMentions","RenderMessageImages","TurnTailOwnerProps"],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>","useSession: SnapshotSelectorHook<ConversationSnapshot>","sessionId: SessionId","useProjection: UseProjection","useInput: SnapshotSelectorHook<InputState>","inputActions: InputActions"],keyDomain:"fixed by the owner's key table { [Kind in ChatNodeKind]: { node: ChatNode<Kind> } }, already taken: assistant-step, command, command-input, compaction, context, manual-compaction, model-retry, steering, tool-call, turn-error, turn-max-tokens, turn-tail, unknown, user, workflow-run",hookContext:"string",slotInject:"ChatNodeTurnDataInjected",declaredBy:"an entry in 'conversation.view' (client-ui-conversation), so it exists while that entry is mounted",occupants:["client-ui-conversation UserMessageNodeView key 'user'","client-ui-conversation UserMessageNodeView key 'steering'","client-ui-conversation ContextMessageNodeView key 'context'","client-ui-conversation AssistantNodeView key 'assistant-step'","client-ui-conversation CommandNodeView key 'command'","client-ui-conversation ManualCompactionNodeView key 'manual-compaction'","client-ui-conversation CompactionNodeView key 'compaction'","client-ui-conversation RetryNodeView key 'model-retry'","client-ui-conversation TurnErrorNodeView key 'turn-error'","client-ui-conversation TurnMaxTokensNodeView key 'turn-max-tokens'","client-ui-conversation TurnTailNodeView key 'turn-tail'","client-ui-conversation UnknownNodeView key 'unknown'","client-ui-goal GoalCommandInputView key 'command-input'","client-ui-tool ToolCallTree key 'tool-call'","client-ui-workflow-run WorkflowRunPanel key 'workflow-run'"],replaceRisk:"shadows-shipped-ui",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('conversation.chat.node', () => ctx.slots.register(
      { name: 'conversation.chat.node', key: '<one key the owner dispatches>' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-conversation/src/client/contract/slots.ts:115"},{key:"conversation.chat.turnTail",kind:"chain",scope:"session",summary:"The completed Turn Node's extension chain, rendered before that Node's IconActions.",doc:`The completed Turn Node's extension chain, rendered before that Node's
IconActions. Entries derive a match from the engine-owned Turn and
closing seq before mounting, so presentation components never mount
only to return null; an all-declined chain renders nothing.`,registerOptions:[{name:"select",requirement:"required",type:"(owner) => unknown | null",doc:"Pure routing selector. Entries are tried in ascending order; the first non-null result wins and arrives as the component's `matched` prop. All-null falls through to the owner's fallback."}],ownerProps:[`/**
 * Owner currency of the chat view's turn-tail hole: the engine-owned Turn and
 * the closing assistant's anchor. Registrants read their own typed Turn data
 * and open files through the same opener the tool rows use.
 */
export interface TurnTailOwnerProps {
  /** Engine-owned closing Turn boundary. */
  turn: TurnLocation
  /** The closing assistant's seq — the anchor the tail renders under. */
  seq: number
  /**
   * Open a filesystem path through the Host (tool-row semantics; the chat
   * view resolves relative paths against the session cwd).
   */
  openFile: (path: string) => void
}`],ownerPropsReferences:["TurnLocation"],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>","useSession: SnapshotSelectorHook<ConversationSnapshot>","sessionId: SessionId","useProjection: UseProjection","useInput: SnapshotSelectorHook<InputState>","inputActions: InputActions"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'conversation.chat.node' (client-ui-conversation), so it exists while that entry is mounted",occupants:["client-ui-deliverables ProducedFiles"],replaceRisk:"none",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('conversation.chat.turnTail', () => ctx.slots.register(
      { name: 'conversation.chat.turnTail', select: owner => null },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-conversation/src/client/contract/slots.ts:140"},{key:"conversation.composer",kind:"chain",scope:"session",summary:"The composer takeover chain: entries are selector-routed replacements of the default InputBar.",doc:`The composer takeover chain: entries are selector-routed replacements
of the default InputBar. Declared by this package's 'conversation'
entry; the owner dispatches the ComposerChainProps currency and
routing lives in entry selectors — new takeover kinds register with
zero owner changes.`,registerOptions:[{name:"select",requirement:"required",type:"(owner) => unknown | null",doc:"Pure routing selector. Entries are tried in ascending order; the first non-null result wins and arrives as the component's `matched` prop. All-null falls through to the owner's fallback."}],ownerProps:[`/**
 * Composer chain currency: what ConversationRoot dispatches at its
 * renderSlotChain site. The owner declares the currency only — never a
 * per-entry contract; takeover packages narrow it in their own selectors
 * (\`interactions.find(i => i.kind === ...)\`), so new takeover kinds register
 * with zero owner changes.
 */
export interface ComposerChainProps {
  interactions: readonly PendingInteraction[]
  /** Current conversation facts for feature-owned takeover selectors. */
  session: ConversationSnapshot | undefined
}`],ownerPropsReferences:["ConversationSnapshot","PendingInteraction"],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>","useSession: SnapshotSelectorHook<ConversationSnapshot>","sessionId: SessionId","useProjection: UseProjection","useInput: SnapshotSelectorHook<InputState>","inputActions: InputActions"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'conversation' (client-ui-conversation), so it exists while that entry is mounted",occupants:["client-ui-conversation ApprovalPanel","client-ui-subagent SubagentReadOnlyComposer","client-ui-user-questions QuestionComposer"],replaceRisk:"none",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('conversation.composer', () => ctx.slots.register(
      { name: 'conversation.composer', select: owner => null },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-conversation/src/client/contract/slots.ts:171"},{key:"conversation.composer.bar",kind:"single",scope:"session-maybe",summary:"The default composer body: a single slot rendered as the composer chain's fallback (a real entry, not a chain rider, so a takeover election hides rather than unmounts it and the textarea DOM survives).",doc:`The default composer body: a single slot rendered as the composer
chain's fallback (a real entry, not a chain rider, so a
takeover election hides rather than unmounts it and the textarea DOM
survives). Session-maybe: the bar stays mounted across the
no-session/session transition — the no-workspace hero renders the SAME
textarea DOM as a read-only Workspace-picker trigger instead of a
parallel inert tree — with the machine hooks absent until a session is
current. InputBar registers
here from this package's apply; its machine state arrives through the
standard provide channel (useInput + inputActions), the keyboard
command face through its own inject.`,registerOptions:[],ownerProps:[`/**
 * Owner share of the composer-bar slot: ConversationRoot's layout-phase
 * inputs plus the input-region child-slot content it renders (the region
 * slots stay declared/rendered by the conversation entry; the bar hosts the
 * results as chrome).
 */
export interface ComposerBarOwnerProps {
  /** Hero = empty-state centered card; composer = resident bottom bar. */
  variant: 'hero' | 'composer'
  /**
   * A block another plugin raised for this session: the bar refuses input and
   * shows the blocker's reason as the placeholder, but — unlike \`disabled\` —
   * keeps the model seat live. Every block this contract has is one the user
   * clears by choosing a model, so locking that seat too would leave the
   * composer telling them to do the one thing it prevents.
   */
  blocked?: { readonly reason: string }
  /**
   * Inert no-workspace state: the bar locks message actions while preserving
   * its normal DOM so the Workspace pick transitions in place.
   */
  disabled?: boolean
  /** Whether the shared Workspace picker menu is expanded, regardless of which trigger opened it. */
  workspacePickerOpen?: boolean
  /** Open the existing Workspace picker from the inert textarea. */ /* …truncated — full shape in source */`],ownerPropsReferences:["Workspace"],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>","useSession: MaybeSnapshotSelectorHook<ConversationSnapshot>","sessionId: SessionId | undefined","useProjection: UseProjection","useInput: MaybeSnapshotSelectorHook<InputState>","inputActions: InputActions | undefined"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'conversation' (client-ui-conversation), so it exists while that entry is mounted",occupants:["client-ui-conversation InputBar"],replaceRisk:"shadows-shipped-ui",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('conversation.composer.bar', () => ctx.slots.register(
      { name: 'conversation.composer.bar' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-conversation/src/client/contract/slots.ts:245"},{key:"conversation.composer.dock",kind:"list",scope:"session",summary:"The band under the composer card, inside the bar's width column — the seat for an ambient readout about the conversation (the shipped stats line lives here).",doc:"The band under the composer card, inside the bar's width column — the\nseat for an ambient readout about the conversation (the shipped stats\nline lives here). Same InputZone owner share as the other\nregions. Anything the user must click belongs in the tool row instead\n(`conversation.input.left` / `.right`); anything needing its own line\nabove the card belongs in `conversation.input.dock`.",registerOptions:[{name:"id",requirement:"required",type:"string",doc:"Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."},{name:"order",requirement:"optional",type:"number",doc:"Position among the entries, ascending (default 0)."},{name:"label",requirement:"optional",type:"string | (() => string)",doc:"Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."}],ownerProps:[`/**
 * The input-region slot currency: dock/left/right entries read
 * the conversation snapshot and the live input state as owner props (both
 * are point-in-time snapshots — the dispatching skeleton re-renders on
 * either store's change, so entries stay current without subscribing).
 */
export interface InputZone {
  readonly session: ConversationSnapshot
  readonly input: InputState
}`],ownerPropsReferences:["ConversationSnapshot","InputState"],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>","useSession: SnapshotSelectorHook<ConversationSnapshot>","sessionId: SessionId","useProjection: UseProjection","useInput: SnapshotSelectorHook<InputState>","inputActions: InputActions"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'conversation' (client-ui-conversation), so it exists while that entry is mounted",occupants:["client-ui-conversation StatsLine id 'stats'"],replaceRisk:"none",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register(
      { name: 'conversation.composer.dock', id: 'my-entry', order: 100, label: 'My entry' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-conversation/src/client/contract/slots.ts:214"},{key:"conversation.details.tool",kind:"single",scope:"session",summary:"The body of the details panel for the tool call the user selected — one occupant, so taking it means rendering every tool's output, not just the ones you know.",doc:"The body of the details panel for the tool call the user selected —\none occupant, so taking it means rendering every tool's output, not just\nthe ones you know. The owner passes a frozen `block` whose two lifecycle\nforms must both be handled: branch on `'kind' in block` (a settled\n`ToolResultNode` has it, a still-running call does not), and treat\n`cwd` as display-only, for shortening workspace-rooted paths.\nA per-tool renderer belongs in the keyed `tool.call.toolview` seat\ninstead; this one is the whole panel.",registerOptions:[],ownerProps:[`/** Owner currency of the details panel's Tool output renderer. */
export interface DetailsToolOwnerProps {
  /** Frozen selected call slice. */
  block: ToolCallBlock
  /** Session workspace root for card cwd and relative-path display. */
  cwd?: string | undefined
}`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>","useSession: SnapshotSelectorHook<ConversationSnapshot>","sessionId: SessionId","useProjection: UseProjection","useInput: SnapshotSelectorHook<InputState>","inputActions: InputActions"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'details' (client-ui-conversation), so it exists while that entry is mounted",occupants:["client-ui-tool ToolDetails"],replaceRisk:"shadows-shipped-ui",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('conversation.details.tool', () => ctx.slots.register(
      { name: 'conversation.details.tool' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-conversation/src/client/contract/slots.ts:163"},{key:"conversation.hero.agentPreset",kind:"single",scope:"root",summary:"The agent-preset chip beside the workspace picker on the new-session screen.",doc:`The agent-preset chip beside the workspace picker on the new-session
screen. Root scope: no session exists yet, so the choice is staged for
the next one rather than applied to a current one.`,registerOptions:[],ownerProps:[`/** Owner share of the hero agent-preset chip: the shell supplies nothing. */
export interface HeroAgentPresetOwnerProps {
  /** Marker field: the chip owns its own roster, staging, and menu state. */
  children?: never
}`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'conversation' (client-ui-conversation), so it exists while that entry is mounted",occupants:["client-ui-agent-preset AgentPresetSeat"],replaceRisk:"shadows-shipped-ui",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('conversation.hero.agentPreset', () => ctx.slots.register(
      { name: 'conversation.hero.agentPreset' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-conversation/src/client/contract/slots.ts:189"},{key:"conversation.hero.brand.mark",kind:"single",scope:"root",summary:"Brand mark leading the blank-session headline.",doc:"Brand mark leading the blank-session headline. Declared by this\npackage's `conversation` entry; the shell supplies a fish fallback.",registerOptions:[],ownerProps:[`/** Presentation props supplied to the blank-session brand-mark occupant. */
export interface HeroBrandMarkOwnerProps {
  /** Requested square edge in pixels. */
  size: number
  /** Host CSS class for preserving the default hero mark color and hover motion. */
  className?: string | undefined
}`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'conversation' (client-ui-conversation), so it exists while that entry is mounted",occupants:["client-ui-brand-official OfficialBrandMark"],replaceRisk:"shadows-shipped-ui",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('conversation.hero.brand.mark', () => ctx.slots.register(
      { name: 'conversation.hero.brand.mark' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-conversation/src/client/contract/slots.ts:183"},{key:"conversation.hero.workspace",kind:"single",scope:"root",summary:"The hero-phase Workspace picker hole: rendered by ConversationRoot while the session is blank (picking another workspace switches to that workspace's blank session, draft carried).",doc:`The hero-phase Workspace picker hole: rendered by ConversationRoot
while the session is blank (picking another workspace switches to that
workspace's blank session, draft carried). Root scope: the picker
reads the global workspace list.`,registerOptions:[],ownerProps:[`/** Owner share common to the hero / New-Session Workspace pickers. */
export interface EmptyWorkspaceOwnerProps {
  open: boolean
  anchorRef?: RefObject<HTMLElement>
  /** Currently active workspace (renders a trailing check in the picker list). */
  selectedId?: WorkspaceId | undefined
  onPick: (workspaceId: WorkspaceId) => void
  onClose: () => void
}`],ownerPropsReferences:["Workspace"],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'conversation' (client-ui-conversation), so it exists while that entry is mounted",occupants:["client-ui-workspace WorkspacePicker"],replaceRisk:"shadows-shipped-ui",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('conversation.hero.workspace', () => ctx.slots.register(
      { name: 'conversation.hero.workspace' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-conversation/src/client/contract/slots.ts:178"},{key:"conversation.hero.workspace.directoryFlow",kind:"single",scope:"root",summary:"Directory-flow hole under the conversation empty-state picker (declared by the WorkspacePicker entry).",doc:"Directory-flow hole under the conversation empty-state picker (declared by the WorkspacePicker entry).",registerOptions:[],ownerProps:[`/**
 * Owner share of the directory-flow holes: the complete conversation between
 * the trigger surface and the picking interaction. The occupant reads \`open\`
 * to run/render its interaction and reports exactly one outcome per open.
 */
export interface DirectoryFlowOwnerProps {
  /** True while a picking interaction is requested; flipping back to false withdraws the request. */
  open: boolean
  /** True while the owner adopts a picked path (\`createWorkspace\` in flight); occupants disable their commit affordances. */
  busy: boolean
  /** The operator picked a directory (absolute host path); the owner adopts it. */
  onPicked: (path: string) => void
  /** The operator dismissed the interaction; the owner just closes the flow. */
  onCancel: () => void
  /** The interaction itself failed (chooser missing, listing denied); the owner shows its error surface. */
  onError: (message: string) => void
}`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'conversation.hero.workspace' (client-ui-workspace), so it exists while that entry is mounted",occupants:["client-ui-directory-picker-browse BrowseDirectoryFlow","client-ui-directory-picker-native NativeDirectoryFlow"],replaceRisk:"shadows-shipped-ui",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('conversation.hero.workspace.directoryFlow', () => ctx.slots.register(
      { name: 'conversation.hero.workspace.directoryFlow' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-workspace/src/client/contract/slots.ts:57"},{key:"conversation.input.attachments",kind:"single",scope:"session-maybe",summary:"Optional draft-image rail, drop target, and preview surface inside the composer.",doc:"Optional draft-image rail, drop target, and preview surface inside the composer.",registerOptions:[],ownerProps:[`/** Input state handed to the optional attachment presentation plugin. */
export interface ComposerAttachmentsOwnerProps {
  /** Browser-owned draft images in input order. */
  attachments: readonly ComposerAttachment[]
  /** Whether a document-level file drop may add images now. */
  canAcceptDrop: boolean
  /** Add one dropped batch through the composer's validation path. */
  onAddImages: (files: readonly File[]) => void
  /** Remove one draft image through the conversation service. */
  onRemoveImage: (id: DraftAttachmentId) => void
  /** Display-ready limits for the drop invitation. */
  dropLimits?: { readonly count: number; readonly size: string } | undefined
}`],ownerPropsReferences:["ComposerAttachment","DraftAttachmentId"],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>","useSession: MaybeSnapshotSelectorHook<ConversationSnapshot>","sessionId: SessionId | undefined","useProjection: UseProjection","useInput: MaybeSnapshotSelectorHook<InputState>","inputActions: InputActions | undefined"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'conversation.composer.bar' (client-ui-conversation), so it exists while that entry is mounted",occupants:["client-ui-attachment ComposerAttachments"],replaceRisk:"shadows-shipped-ui",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('conversation.input.attachments', () => ctx.slots.register(
      { name: 'conversation.input.attachments' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-conversation/src/client/contract/slots.ts:247"},{key:"conversation.input.dock",kind:"list",scope:"session",summary:"A full-width row of its own, stacked above the composer card — the seat for anything that needs a line to itself (queue rows, a todo strip, a goal bar).",doc:"A full-width row of its own, stacked above the composer card — the seat\nfor anything that needs a line to itself (queue rows, a todo strip, a\ngoal bar). Pick this over the three seats below when your content wraps\nor carries prose; pick `conversation.composer.dock` for an ambient\nreadout under the card, and `conversation.input.left` /\n`.right` for a small control INSIDE the card's tool row.\nRead only `session`/`input` off the owner share (InputZone) —\nboth are point-in-time snapshots re-rendered for you, never subscribe.",registerOptions:[{name:"id",requirement:"required",type:"string",doc:"Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."},{name:"order",requirement:"optional",type:"number",doc:"Position among the entries, ascending (default 0)."},{name:"label",requirement:"optional",type:"string | (() => string)",doc:"Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."}],ownerProps:[`/**
 * The input-region slot currency: dock/left/right entries read
 * the conversation snapshot and the live input state as owner props (both
 * are point-in-time snapshots — the dispatching skeleton re-renders on
 * either store's change, so entries stay current without subscribing).
 */
export interface InputZone {
  readonly session: ConversationSnapshot
  readonly input: InputState
}`],ownerPropsReferences:["ConversationSnapshot","InputState"],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>","useSession: SnapshotSelectorHook<ConversationSnapshot>","sessionId: SessionId","useProjection: UseProjection","useInput: SnapshotSelectorHook<InputState>","inputActions: InputActions"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'conversation' (client-ui-conversation), so it exists while that entry is mounted",occupants:["client-ui-conversation QueueDock id 'queue'","client-ui-conversation TodoDock id 'todo'","client-ui-goal GoalDock id 'goal'"],replaceRisk:"none",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('conversation.input.dock', () => ctx.slots.register(
      { name: 'conversation.input.dock', id: 'my-entry', order: 100, label: 'My entry' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-conversation/src/client/contract/slots.ts:205"},{key:"conversation.input.left",kind:"list",scope:"session",summary:"The left end of the tool row INSIDE the composer card, after the resident chrome (access mode, plan, attach) — the seat for a small always-visible control.",doc:`The left end of the tool row INSIDE the composer card, after the
resident chrome (access mode, plan, attach) — the seat for a small
always-visible control. Entries sit beside that chrome, never replace
it. Same InputZone owner share; use \`.right\` for a control that
belongs next to the send button, and the docks for anything taller than
one row.`,registerOptions:[{name:"id",requirement:"required",type:"string",doc:"Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."},{name:"order",requirement:"optional",type:"number",doc:"Position among the entries, ascending (default 0)."},{name:"label",requirement:"optional",type:"string | (() => string)",doc:"Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."}],ownerProps:[`/**
 * The input-region slot currency: dock/left/right entries read
 * the conversation snapshot and the live input state as owner props (both
 * are point-in-time snapshots — the dispatching skeleton re-renders on
 * either store's change, so entries stay current without subscribing).
 */
export interface InputZone {
  readonly session: ConversationSnapshot
  readonly input: InputState
}`],ownerPropsReferences:["ConversationSnapshot","InputState"],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>","useSession: SnapshotSelectorHook<ConversationSnapshot>","sessionId: SessionId","useProjection: UseProjection","useInput: SnapshotSelectorHook<InputState>","inputActions: InputActions"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'conversation' (client-ui-conversation), so it exists while that entry is mounted",occupants:[],replaceRisk:"none",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('conversation.input.left', () => ctx.slots.register(
      { name: 'conversation.input.left', id: 'my-entry', order: 100, label: 'My entry' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-conversation/src/client/contract/slots.ts:223"},{key:"conversation.input.model",kind:"single",scope:"session",summary:"The named model-select seat at the right end of the composer tool row, left of the send button — one occupant, so taking it means rendering the whole model affordance yourself.",doc:`The named model-select seat at the right end of the composer tool row,
left of the send button — one occupant, so taking it means rendering the
whole model affordance yourself. Same \`locked\`-only owner share and same
renders-nothing-while-empty contract as the plan seat. Note the composer
deliberately keeps this seat LIVE while it refuses text for a
model-related block: every such block is one the user clears by picking
a model here.`,registerOptions:[],ownerProps:[`/**
 * Owner share of the two named composer control seats (plan / model): the
 * bar passes its disable state; the filling entry owns everything else.
 */
export interface InputControlOwnerProps {
  /** Session-removed lock (the bar's chrome disable state). */
  locked: boolean
}`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>","useSession: SnapshotSelectorHook<ConversationSnapshot>","sessionId: SessionId","useProjection: UseProjection","useInput: SnapshotSelectorHook<InputState>","inputActions: InputActions"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'conversation.composer.bar' (client-ui-conversation), so it exists while that entry is mounted",occupants:["client-ui-model-selection ModelSelect"],replaceRisk:"shadows-shipped-ui",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('conversation.input.model', () => ctx.slots.register(
      { name: 'conversation.input.model' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-conversation/src/client/contract/slots.ts:271"},{key:"conversation.input.overlay",kind:"list",scope:"session",summary:"The InputBar floating overlay anchor: MenuView (this package) and the popupSelect shell (ui-commands) contribute list entries; each reads its own store and renders null while closed.",doc:`The InputBar floating overlay anchor: MenuView (this package) and the
popupSelect shell (ui-commands) contribute list entries; each reads its
own store and renders null while closed. Declared (children table) by
ui-conversation's composer entry; the anchor hides with the input
under a takeover.`,registerOptions:[{name:"id",requirement:"required",type:"string",doc:"Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."},{name:"order",requirement:"optional",type:"number",doc:"Position among the entries, ascending (default 0)."},{name:"label",requirement:"optional",type:"string | (() => string)",doc:"Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."}],ownerProps:[],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>","useSession: SnapshotSelectorHook<ConversationSnapshot>","sessionId: SessionId","useProjection: UseProjection","useInput: SnapshotSelectorHook<InputState>","inputActions: InputActions"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'conversation' (client-ui-conversation), so it exists while that entry is mounted",occupants:["client-ui-commands PopupSelectView id 'command-popup'","client-ui-input-trigger MenuView id 'slash-menu'"],replaceRisk:"none",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('conversation.input.overlay', () => ctx.slots.register(
      { name: 'conversation.input.overlay', id: 'my-entry', order: 100, label: 'My entry' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-input-trigger/src/client/slots.ts:24"},{key:"conversation.input.plan",kind:"single",scope:"session",summary:"The named plan-status seat in the composer tool row, immediately right of the access-mode control — one occupant, so taking it means rendering the plan affordance yourself.",doc:`The named plan-status seat in the composer tool row, immediately right
of the access-mode control — one occupant, so taking it means rendering
the plan affordance yourself. The owner passes only \`locked\` (see
InputControlOwnerProps): honour it by refusing interaction, and
take everything else from the framework session kit or your own inject.
Unoccupied, the seat renders nothing at all — the bar paints no
placeholder, so an absent plan plugin costs no layout.`,registerOptions:[],ownerProps:[`/**
 * Owner share of the two named composer control seats (plan / model): the
 * bar passes its disable state; the filling entry owns everything else.
 */
export interface InputControlOwnerProps {
  /** Session-removed lock (the bar's chrome disable state). */
  locked: boolean
}`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>","useSession: SnapshotSelectorHook<ConversationSnapshot>","sessionId: SessionId","useProjection: UseProjection","useInput: SnapshotSelectorHook<InputState>","inputActions: InputActions"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'conversation.composer.bar' (client-ui-conversation), so it exists while that entry is mounted",occupants:["client-ui-plan PlanChip"],replaceRisk:"shadows-shipped-ui",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('conversation.input.plan', () => ctx.slots.register(
      { name: 'conversation.input.plan' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-conversation/src/client/contract/slots.ts:261"},{key:"conversation.input.right",kind:"list",scope:"session",summary:"The right end of the same tool row, before the primary send button — the seat for a control the user reaches on the way to sending (the model select sits in its own named seat just left of here).",doc:`The right end of the same tool row, before the primary send button —
the seat for a control the user reaches on the way to sending (the
model select sits in its own named seat just left of here). Same
InputZone owner share and the same one-row height budget as
\`conversation.input.left\`.`,registerOptions:[{name:"id",requirement:"required",type:"string",doc:"Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."},{name:"order",requirement:"optional",type:"number",doc:"Position among the entries, ascending (default 0)."},{name:"label",requirement:"optional",type:"string | (() => string)",doc:"Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."}],ownerProps:[`/**
 * The input-region slot currency: dock/left/right entries read
 * the conversation snapshot and the live input state as owner props (both
 * are point-in-time snapshots — the dispatching skeleton re-renders on
 * either store's change, so entries stay current without subscribing).
 */
export interface InputZone {
  readonly session: ConversationSnapshot
  readonly input: InputState
}`],ownerPropsReferences:["ConversationSnapshot","InputState"],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>","useSession: SnapshotSelectorHook<ConversationSnapshot>","sessionId: SessionId","useProjection: UseProjection","useInput: SnapshotSelectorHook<InputState>","inputActions: InputActions"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'conversation' (client-ui-conversation), so it exists while that entry is mounted",occupants:[],replaceRisk:"none",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('conversation.input.right', () => ctx.slots.register(
      { name: 'conversation.input.right', id: 'my-entry', order: 100, label: 'My entry' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-conversation/src/client/contract/slots.ts:231"},{key:"conversation.message.images",kind:"single",scope:"session",summary:"Optional renderer for one consecutive group of durable message images.",doc:"Optional renderer for one consecutive group of durable message images.",registerOptions:[],ownerProps:[`/** Historical image group handed to the optional attachment presentation plugin. */
export interface MessageImagesOwnerProps {
  /** Consecutive image blocks rendered as one gallery. */
  images: readonly { readonly attachment: ImageAttachmentRef }[]
  /** Session-authorized durable image loader. */
  loadImage: (attachment: ImageAttachmentRef) => Promise<string>
  /** Message-side alignment. */
  align: 'start' | 'end'
}`],ownerPropsReferences:["ImageAttachmentRef","Message"],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>","useSession: SnapshotSelectorHook<ConversationSnapshot>","sessionId: SessionId","useProjection: UseProjection","useInput: SnapshotSelectorHook<InputState>","inputActions: InputActions"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'conversation.view' (client-ui-conversation), so it exists while that entry is mounted",occupants:["client-ui-attachment MessageImages"],replaceRisk:"shadows-shipped-ui",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('conversation.message.images', () => ctx.slots.register(
      { name: 'conversation.message.images' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-conversation/src/client/contract/slots.ts:124"},{key:"conversation.session",kind:"single",scope:"session",summary:"The entire body of one session: taking this seat means rendering that session's conversation yourself.",doc:`The entire body of one session: taking this seat means rendering that
session's conversation yourself. The occupant also owns the per-session
draft mirror and the active view ring, so a replacement inherits both
duties and an empty one leaves a blank session pane — nothing here
degrades gracefully. To ADD rather than replace, take a seat inside the
flow instead: \`conversation.view\` for a whole tab, the input regions for
composer chrome.`,registerOptions:[],ownerProps:[],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>","useSession: SnapshotSelectorHook<ConversationSnapshot>","sessionId: SessionId","useProjection: UseProjection","useInput: SnapshotSelectorHook<InputState>","inputActions: InputActions"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'conversation' (client-ui-conversation), so it exists while that entry is mounted",occupants:["client-ui-conversation ConversationSession"],replaceRisk:"shadows-shipped-ui",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('conversation.session', () => ctx.slots.register(
      { name: 'conversation.session' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-conversation/src/client/contract/slots.ts:71"},{key:"conversation.session.header",kind:"single",scope:"session",summary:"The strip above the session's scrollport: title, view tabs, and the action row.",doc:`The strip above the session's scrollport: title, view tabs, and the
action row. Taking this seat means rendering all three yourself, and it
also collapses \`conversation.session.header.actions\` — that additive
seat is declared by whoever occupies this one, so replacing the header
takes every action entry down with it.`,registerOptions:[],ownerProps:[],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>","useSession: SnapshotSelectorHook<ConversationSnapshot>","sessionId: SessionId","useProjection: UseProjection","useInput: SnapshotSelectorHook<InputState>","inputActions: InputActions"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'conversation' (client-ui-conversation), so it exists while that entry is mounted",occupants:["client-ui-conversation ConversationSessionHeader"],replaceRisk:"shadows-shipped-ui",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('conversation.session.header', () => ctx.slots.register(
      { name: 'conversation.session.header' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-conversation/src/client/contract/slots.ts:79"},{key:"conversation.session.header.actions",kind:"list",scope:"session",summary:"One button in the session header's action row — the additive way to put a per-session control beside the title without replacing the header.",doc:"One button in the session header's action row — the additive way to put\na per-session control beside the title without replacing the header.\nEntries render by ascending `order`; negative values are reserved for\nstatic session context that precedes interactive actions. The owner\npasses nothing: everything a control needs comes from the framework\nsession kit (`sessionId`, `useSession`, `useInput`, `inputActions`) and\nfrom the registrant's own inject face, so an empty owner share means\nself-sufficient, not starved.",registerOptions:[{name:"id",requirement:"required",type:"string",doc:"Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."},{name:"order",requirement:"optional",type:"number",doc:"Position among the entries, ascending (default 0)."},{name:"label",requirement:"optional",type:"string | (() => string)",doc:"Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."}],ownerProps:[`/** Header actions derive their state from the standard session/global kit. */
export interface ConversationHeaderActionOwnerProps {}`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>","useSession: SnapshotSelectorHook<ConversationSnapshot>","sessionId: SessionId","useProjection: UseProjection","useInput: SnapshotSelectorHook<InputState>","inputActions: InputActions"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'conversation.session.header' (client-ui-conversation), so it exists while that entry is mounted",occupants:["client-ui-agent-preset AgentPresetLabel id 'agent-preset'","client-ui-jobs JobListAction id 'job-list'"],replaceRisk:"none",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('conversation.session.header.actions', () => ctx.slots.register(
      { name: 'conversation.session.header.actions', id: 'my-entry', order: 100, label: 'My entry' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-conversation/src/client/contract/slots.ts:100"},{key:"conversation.session.header.lineage",kind:"single",scope:"session",summary:"One breadcrumb title and its lineage controls.",doc:`One breadcrumb title and its lineage controls. The render site keeps
the ordinary title as fallback; an occupant receives plain title data
and may replace a subagent title with one combined navigation control.`,registerOptions:[],ownerProps:[`/** Plain breadcrumb data handed to the optional lineage renderer. */
export interface ConversationHeaderLineageOwnerProps {
  /** Session represented by this breadcrumb title. */
  lineageSessionId: SessionId
  /** Display title available to a renderer that combines the title with a control. */
  displayTitle: string
  /** Navigate to an ancestor title when its combined control is clicked. */
  openTitle?: () => void
}`],ownerPropsReferences:["SessionId"],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>","useSession: SnapshotSelectorHook<ConversationSnapshot>","sessionId: SessionId","useProjection: UseProjection","useInput: SnapshotSelectorHook<InputState>","inputActions: InputActions"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'conversation.session.header' (client-ui-conversation), so it exists while that entry is mounted",occupants:["client-ui-subagent SubagentHeaderLineage"],replaceRisk:"shadows-shipped-ui",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('conversation.session.header.lineage', () => ctx.slots.register(
      { name: 'conversation.session.header.lineage' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-conversation/src/client/contract/slots.ts:85"},{key:"conversation.session.header.utilities",kind:"list",scope:"session",summary:"Right-aligned Session utilities kept outside the title-adjacent action group, so an optional utility cannot reorder session context or lineage.",doc:`Right-aligned Session utilities kept outside the title-adjacent action
group, so an optional utility cannot reorder session context or lineage.`,registerOptions:[{name:"id",requirement:"required",type:"string",doc:"Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."},{name:"order",requirement:"optional",type:"number",doc:"Position among the entries, ascending (default 0)."},{name:"label",requirement:"optional",type:"string | (() => string)",doc:"Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."}],ownerProps:[`/** Header actions derive their state from the standard session/global kit. */
export interface ConversationHeaderActionOwnerProps {}`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>","useSession: SnapshotSelectorHook<ConversationSnapshot>","sessionId: SessionId","useProjection: UseProjection","useInput: SnapshotSelectorHook<InputState>","inputActions: InputActions"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'conversation.session.header' (client-ui-conversation), so it exists while that entry is mounted",occupants:["session-log-export SessionLogDownloadHeaderAction id 'session-log-download'"],replaceRisk:"none",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('conversation.session.header.utilities', () => ctx.slots.register(
      { name: 'conversation.session.header.utilities', id: 'my-entry', order: 100, label: 'My entry' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-conversation/src/client/contract/slots.ts:105"},{key:"conversation.view",kind:"list",scope:"session",summary:"The conversation view ring: one list entry per view tab (chat here; trajectory/waterfall from ui-trajectory), rendered one-at-a-time by the session body via `only: <active id>`.",doc:`The conversation view ring: one list entry per view tab (chat here;
trajectory/waterfall from ui-trajectory), rendered one-at-a-time by
the session body via \`only: <active id>\`. Declared by this package's
body entry (declaring is claiming). Session scope: views read the
conversation snapshot through the standard kit.`,registerOptions:[{name:"id",requirement:"required",type:"string",doc:"Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."},{name:"order",requirement:"optional",type:"number",doc:"Position among the entries, ascending (default 0)."},{name:"label",requirement:"optional",type:"string | (() => string)",doc:"Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."}],ownerProps:[`/**
 * View-slot owner share: the cross-view inspect handoff (otherwise views need
 * nothing from the render site — sessionId and the snapshot hook arrive as
 * framework-standard props; tool rows go through each view's own declared
 * toolview hole).
 */
export interface ConvViewOwnerProps {
  /** One-shot inspect request from another view (chat's Inspect button); null when idle. */
  inspect?: { callId: CallId } | null
  /** Acknowledge the inspect request once applied (clears the store field). */
  onInspectDone?: () => void
}`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>","useSession: SnapshotSelectorHook<ConversationSnapshot>","sessionId: SessionId","useProjection: UseProjection","useInput: SnapshotSelectorHook<InputState>","inputActions: InputActions"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'conversation.session' (client-ui-conversation), so it exists while that entry is mounted",occupants:["client-ui-conversation ChatView id 'chat'","client-ui-trajectory TrajectoryView id 'trajectory'"],replaceRisk:"none",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('conversation.view', () => ctx.slots.register(
      { name: 'conversation.view', id: 'my-entry', order: 100, label: 'My entry' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-conversation/src/client/contract/slots.ts:113"},{key:"details",kind:"single",scope:"session",summary:"The right details column, shown when the layout opens it.",doc:`The right details column, shown when the layout opens it. OCCUPIED by
ui-conversation's DetailsPanel, which declares the tool-details seat
inside it — registering here replaces the column and takes that seat
with it. Absent an occupant the column renders nothing.

No owner props: the framework injects the session id and hooks for the
\`session\` scope, and \`ctx.layout\` owns whether the column is open.`,registerOptions:[],ownerProps:[`/** Details owner share: empty — sessionId arrives as a framework-standard prop. */
export interface DetailsOwnerProps {}`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>","useSession: SnapshotSelectorHook<ConversationSnapshot>","sessionId: SessionId","useProjection: UseProjection","useInput: SnapshotSelectorHook<InputState>","inputActions: InputActions"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'root' (client-ui-layout), so it exists while that entry is mounted",occupants:["client-ui-conversation DetailsPanel"],replaceRisk:"shadows-shipped-ui",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('details', () => ctx.slots.register(
      { name: 'details' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-layout/src/client/index.ts:72"},{key:"root",kind:"single",scope:"root",summary:"The built-in render-tree root hole (seeded by SlotCore): the one slot the shell itself renders, and the ancestor of every other seat.",doc:`The built-in render-tree root hole (seeded by SlotCore): the one slot the
shell itself renders, and the ancestor of every other seat. OCCUPIED by
ui-layout's AppFrame, which declares the sidebar, conversation, details,
and shell.overlay seats inside it.

DO NOT register here. This is a single slot, so a second entry does not
sit beside the frame — it shadows it, and a dynamically registered entry
is assigned a lower priority than the shipped one, which makes it the
winner: the page would render your component alone, with every seat the
frame declares gone. For a surface of your own that floats over the whole
app, register into \`shell.overlay\` instead (a list slot: additive, and
click-through until your entry opts into pointer events).`,registerOptions:[],ownerProps:[`/** Root owner share: the shell supplies nothing — the frame is inject-assembled. */
export interface RootOwnerProps { children?: never }`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"the runtime itself (built in; always present)",occupants:["client-ui-layout AppFrame"],replaceRisk:"shadows-shipped-ui",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('root', () => ctx.slots.register(
      { name: 'root' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/runtime/src/client/slots.ts:41"},{key:"settings.action",kind:"list",scope:"root",summary:"Optional actions rendered in the content-column header before Close.",doc:`Optional actions rendered in the content-column header before Close.
Registrants own visibility, behavior, copy, and failure presentation;
the shell supplies only the ordered render site.`,registerOptions:[{name:"id",requirement:"required",type:"string",doc:"Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."},{name:"order",requirement:"optional",type:"number",doc:"Position among the entries, ascending (default 0)."},{name:"label",requirement:"optional",type:"string | (() => string)",doc:"Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."}],ownerProps:[`/** Owner share of the header title seat (the shell supplies nothing). */
export interface SettingsHeaderOwnerProps {
  /** Marker field: header owner props are intentionally empty. */
  children?: never
}`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'sidebar.settings' (client-ui-settings-general), so it exists while that entry is mounted",occupants:["client-ui-settings-general SettingsDocumentAction id 'open-document'"],replaceRisk:"none",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('settings.action', () => ctx.slots.register(
      { name: 'settings.action', id: 'my-entry', order: 100, label: 'My entry' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-settings/src/client/contract/slots.ts:35"},{key:"settings.close",kind:"single",scope:"root",summary:"The close button's visually-hidden label text (the button itself — icon, geometry, focus — is shell chrome).",doc:`The close button's visually-hidden label text (the button itself —
icon, geometry, focus — is shell chrome). Absent contribution leaves
the button without an accessible name (broken-composition state).`,registerOptions:[],ownerProps:[`/** Owner share of the header title seat (the shell supplies nothing). */
export interface SettingsHeaderOwnerProps {
  /** Marker field: header owner props are intentionally empty. */
  children?: never
}`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'sidebar.settings' (client-ui-settings-general), so it exists while that entry is mounted",occupants:["client-ui-settings-general CloseLabel"],replaceRisk:"shadows-shipped-ui",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('settings.close', () => ctx.slots.register(
      { name: 'settings.close' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-settings/src/client/contract/slots.ts:41"},{key:"settings.general.item",kind:"list",scope:"root",summary:"One preference row inside the General section — the additive seat for a single setting that needs no page of its own (a whole page is `settings.section`), contributed by the feature plugin that owns the preference (locale → Language, ui-theme → Appearance, ui-conversation → Composer Enter).",doc:"One preference row inside the General section — the additive seat for a\nsingle setting that needs no page of its own (a whole page is\n`settings.section`), contributed by the feature plugin that owns the\npreference (locale → Language, ui-theme → Appearance, ui-conversation →\nComposer Enter). Options: `id` (row key), `order` (row position). The\nsection column only stacks rows, so a row draws its own internals,\nincluding its label: nothing projects a `label` here and the owner passes\nno props at all — copy, current value, and the write path are all yours,\nthrough your own inject face and `host.call`. Declared at runtime by\nui-settings-general's General entry; the type lives here with every other\nsettings slot type, because this package is the settings domain's base\nlayer and every registrant already depends on it for `ctx.settingsScope`.",registerOptions:[{name:"id",requirement:"required",type:"string",doc:"Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."},{name:"order",requirement:"optional",type:"number",doc:"Position among the entries, ascending (default 0)."},{name:"label",requirement:"optional",type:"string | (() => string)",doc:"Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."}],ownerProps:[`/** Owner share of a General preference row (the section supplies nothing). */
export interface SettingsGeneralItemOwnerProps {
  /** Marker field: item owner props are intentionally empty. */
  children?: never
}`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'settings.section' (client-ui-settings-general), so it exists while that entry is mounted",occupants:["client-locale LanguageRow id 'language'","client-ui-agent-preset AgentPresetRow id 'agent-preset'","client-ui-conversation EnterBehaviorRow id 'composer-enter'","client-ui-permission-presets PermissionRow id 'permission'","client-ui-theme AppearanceRow id 'appearance'"],replaceRisk:"none",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('settings.general.item', () => ctx.slots.register(
      { name: 'settings.general.item', id: 'my-entry', order: 100, label: 'My entry' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-settings/src/client/contract/slots.ts:88"},{key:"settings.header",kind:"single",scope:"root",summary:"The panel title text seat.",doc:`The panel title text seat. Content renders inside the nav heading row;
the dialog's accessible name points at that node via aria-labelledby.
Absent contribution leaves the heading empty.`,registerOptions:[],ownerProps:[`/** Owner share of the header title seat (the shell supplies nothing). */
export interface SettingsHeaderOwnerProps {
  /** Marker field: header owner props are intentionally empty. */
  children?: never
}`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'sidebar.settings' (client-ui-settings-general), so it exists while that entry is mounted",occupants:["client-ui-settings-general HeaderContent"],replaceRisk:"shadows-shipped-ui",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('settings.header', () => ctx.slots.register(
      { name: 'settings.header' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-settings/src/client/contract/slots.ts:29"},{key:"settings.onboarding",kind:"list",scope:"root",summary:"Root-scoped onboarding steps contributed by settings features.",doc:`Root-scoped onboarding steps contributed by settings features. The
shell mounts one ordered step at a time; the active registrant either
completes itself or keeps ownership until the user completes its sole
path. Registrants own readiness, copy, dialog behavior, AND visible
chrome: a step wraps its visible content in its modal surface (including
\`#root\` inert ownership) and renders null while private facts are still
loading. The shell paints no chrome of its own, so a mounted-but-deciding
step shows and blocks nothing.`,registerOptions:[{name:"id",requirement:"required",type:"string",doc:"Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."},{name:"order",requirement:"optional",type:"number",doc:"Position among the entries, ascending (default 0)."},{name:"label",requirement:"optional",type:"string | (() => string)",doc:"Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."}],ownerProps:[`/** Owner share of the currently active settings-backed onboarding step. */
export interface SettingsOnboardingOwnerProps {
  /** Stable id of the step currently selected by the coordinator. */
  stepId: string
  /** Complete or skip this step and transfer ownership to the next entry. */
  complete: () => void
  /** Open the settings panel directly on one registered section. */
  openSection: (id: string) => void
}`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'sidebar.settings' (client-ui-settings-general), so it exists while that entry is mounted",occupants:["client-ui-settings-models WelcomeNotice id 'welcome-notice'","client-ui-settings-models DeepSeekOnboardingDialog id 'deepseek-official'"],replaceRisk:"none",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('settings.onboarding', () => ctx.slots.register(
      { name: 'settings.onboarding', id: 'my-entry', order: 100, label: 'My entry' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-settings/src/client/contract/slots.ts:73"},{key:"settings.plugin.item",kind:"keyed",scope:"root",summary:"One plugin's card inside the plugin configuration section (see module JSDoc).",doc:"One plugin's card inside the plugin configuration section (see module JSDoc).",registerOptions:[{name:"key",requirement:"required",type:"string",doc:"Your cell key: the entry renders where the owner dispatches this exact key. Registering an already-occupied key replaces that occupant."}],ownerProps:[`/** Owner share of a plugin card (the section supplies nothing). */
export interface SettingsPluginItemOwnerProps {
  /** Marker field: card owner props are intentionally empty. */
  children?: never
}`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>"],keyDomain:"open: any string the owner dispatches (no compile-time key set), none are taken yet",hookContext:"",slotInject:"",declaredBy:"an entry in 'settings.plugins.tab' (client-ui-settings-plugins), so it exists while that entry is mounted",occupants:["client-ui-settings-plugins BashCard","client-ui-settings-plugins AgentLoopCard","client-ui-settings-plugins WebSearchCard"],replaceRisk:"none",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('settings.plugin.item', () => ctx.slots.register(
      { name: 'settings.plugin.item', key: '<one key the owner dispatches>' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-settings-plugins/src/client/slot-contract.ts:19"},{key:"settings.plugins.tab",kind:"list",scope:"root",summary:"One page inside the Plugins settings section.",doc:"One page inside the Plugins settings section. The section owner renders\nlocalized entry labels as tabs and mounts each contribution inside its\ncorresponding tab panel. Options: `id` (tab key), `order` (tab order),\nand `label` (registrant-localized tab text). Declared at runtime by the\nfeature that owns the Plugins section; the type lives here so inventory\nand configuration plugins collaborate without depending on one another.",registerOptions:[{name:"id",requirement:"required",type:"string",doc:"Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."},{name:"order",requirement:"optional",type:"number",doc:"Position among the entries, ascending (default 0)."},{name:"label",requirement:"optional",type:"string | (() => string)",doc:"Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."}],ownerProps:[`/** Owner share of a Plugins tab (the section supplies nothing). */
export interface SettingsPluginsTabOwnerProps {
  /** Marker field: tab owner props are intentionally empty. */
  children?: never
}`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'settings.section' (client-ui-settings-plugins), so it exists while that entry is mounted",occupants:["client-ui-settings-plugin-inventory PluginInventorySettingsTab id 'all'","client-ui-settings-plugins ConfigurablePluginsTab id 'configurable'"],replaceRisk:"none",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register(
      { name: 'settings.plugins.tab', id: 'my-entry', order: 100, label: 'My entry' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-settings/src/client/contract/slots.ts:62"},{key:"settings.section",kind:"list",scope:"root",summary:"One settings page per list entry.",doc:"One settings page per list entry. Registrant options carry the nav\nidentity: `id` (section key, drives `only` filtering), `order` (nav\nposition), `label` (registrant-localized display text — the registrant\nre-registers with fresh text on locale change, so the shell never\nsubscribes locale state; the ledger bump doubles as the shell's\nre-render trigger). Sections render inside the panel content column.\n(`settings.general.item`, declared by ui-settings-general's General\nentry, is typed in the locale package — the common dependency of every\nitem registrant; the shell neither declares nor renders it.)",registerOptions:[{name:"id",requirement:"required",type:"string",doc:"Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."},{name:"order",requirement:"optional",type:"number",doc:"Position among the entries, ascending (default 0)."},{name:"label",requirement:"optional",type:"string | (() => string)",doc:"Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."}],ownerProps:[`/**
 * Owner share of a settings section entry. The shell owns modal visibility
 * and navigation; a section's data arrives through its own inject faces and
 * stores. \`close\` is the one shell affordance a section receives, for flows
 * that leave settings altogether (starting a session from a section) — the
 * onboarding coordinator's \`openSection\`/\`complete\` precedent, inverted.
 */
export interface SettingsSectionOwnerProps {
  /** Close the settings panel (the shell owns the open state). */
  close: () => void
}`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'sidebar.settings' (client-ui-settings-general), so it exists while that entry is mounted",occupants:["client-ui-agent-preset AgentPresetSection id 'agent-presets'","client-ui-settings-general GeneralSection id 'general'","client-ui-settings-models ModelsSection id 'models'","client-ui-settings-plugins PluginsSettingsSection id 'plugins'"],replaceRisk:"none",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('settings.section', () => ctx.slots.register(
      { name: 'settings.section', id: 'my-entry', order: 100, label: 'My entry' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-settings/src/client/contract/slots.ts:53"},{key:"settings.trigger",kind:"single",scope:"root",summary:"The sidebar-foot trigger row content: icon + label, supplied as slot content (the accessible name comes from the content — rail state renders the label visually hidden).",doc:`The sidebar-foot trigger row content: icon + label, supplied as slot
content (the accessible name comes from the content — rail state
renders the label visually hidden). The shell renders the button
chrome and owns open state. Absent contribution degrades to an
icon-only button without an accessible name (broken-composition state;
the shipped composition always registers the seat).`,registerOptions:[],ownerProps:[`/** Owner share of the trigger content seat: the sidebar column state. */
export interface SettingsTriggerOwnerProps {
  /** Whether the sidebar renders wide content (false = 56px rail, icon only). */
  wide: boolean
}`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'sidebar.settings' (client-ui-settings-general), so it exists while that entry is mounted",occupants:["client-ui-settings-general TriggerContent"],replaceRisk:"shadows-shipped-ui",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('settings.trigger', () => ctx.slots.register(
      { name: 'settings.trigger' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-settings/src/client/contract/slots.ts:23"},{key:"shell.overlay",kind:"list",scope:"root",summary:"Frame-wide floating layer, above every column and outside their scroll containers.",doc:`Frame-wide floating layer, above every column and outside their scroll
containers. Deliberately generic and unowned by any feature: a badge, a
toast stack or a status pill all belong here, and entries order among
themselves. The layer itself is click-through — entries opt back into
pointer events — so an occupant never blocks the app underneath.

This is the additive seat for a frame-wide surface of your own: a fresh
\`id\` is added beside the shipped entries instead of replacing them.`,registerOptions:[{name:"id",requirement:"required",type:"string",doc:"Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."},{name:"order",requirement:"optional",type:"number",doc:"Position among the entries, ascending (default 0)."},{name:"label",requirement:"optional",type:"string | (() => string)",doc:"Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."}],ownerProps:[],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'root' (client-ui-layout), so it exists while that entry is mounted",occupants:[],replaceRisk:"none",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('shell.overlay', () => ctx.slots.register(
      { name: 'shell.overlay', id: 'my-entry', order: 100, label: 'My entry' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-layout/src/client/index.ts:83"},{key:"sidebar",kind:"single",scope:"root",summary:"The whole left column.",doc:`The whole left column. OCCUPIED by ui-sidebar's SidebarRoot, which
declares the workspace and settings seats inside it — registering here
replaces the navigation column outright rather than adding to it, and
the seats it declares disappear with it. To add something to the
sidebar, register into one of those inner seats instead.

The occupant receives the frame's live column state (collapsed, width)
and is expected to render the compact control rail while collapsed.`,registerOptions:[],ownerProps:[`/** Sidebar owner share: live column state from the frame's concession solve. */
export interface SidebarOwnerProps {
  /** True when the sidebar is closed (the column renders the compact control rail). */
  collapsed: boolean
  /** Rendered column width in px (SIDEBAR_COLLAPSED when collapsed). */
  width: number
}`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'root' (client-ui-layout), so it exists while that entry is mounted",occupants:["client-ui-sidebar SidebarRoot"],replaceRisk:"shadows-shipped-ui",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('sidebar', () => ctx.slots.register(
      { name: 'sidebar' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-layout/src/client/index.ts:49"},{key:"sidebar.brand.mark",kind:"single",scope:"root",summary:"Brand mark rendered in the expanded brand row and collapsed rail.",doc:"Brand mark rendered in the expanded brand row and collapsed rail.\nDeclared by this package's `sidebar` entry; deployments may replace\nthe shell's fish fallback without replacing the surrounding controls.",registerOptions:[],ownerProps:[`/** Geometry supplied to the sidebar brand-mark occupant. */
export interface SidebarBrandMarkOwnerProps {
  /** Requested square edge in pixels. */
  size: number
}`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'sidebar' (client-ui-sidebar), so it exists while that entry is mounted",occupants:["client-ui-brand-official OfficialBrandMark"],replaceRisk:"shadows-shipped-ui",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('sidebar.brand.mark', () => ctx.slots.register(
      { name: 'sidebar.brand.mark' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-sidebar/src/client/contract/slots.ts:23"},{key:"sidebar.brand.name",kind:"single",scope:"root",summary:"Brand name rendered beside the expanded mark.",doc:"Brand name rendered beside the expanded mark. Declared by this\npackage's `sidebar` entry; the shell supplies a generic text fallback.",registerOptions:[],ownerProps:[`/** Empty owner share for the sidebar brand-name occupant. */
export interface SidebarBrandNameOwnerProps {
  /** Marker field: the occupant owns its own content and width. */
  children?: never
}`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'sidebar' (client-ui-sidebar), so it exists while that entry is mounted",occupants:["client-ui-brand-official OfficialBrandName"],replaceRisk:"shadows-shipped-ui",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('sidebar.brand.name', () => ctx.slots.register(
      { name: 'sidebar.brand.name' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-sidebar/src/client/contract/slots.ts:28"},{key:"sidebar.footer.action",kind:"list",scope:"root",summary:"Optional actions beside Settings at the sidebar foot.",doc:`Optional actions beside Settings at the sidebar foot. Declared by this
package's 'sidebar' entry; each action receives only the column state.`,registerOptions:[{name:"id",requirement:"required",type:"string",doc:"Your cell key. Use an id of your own: a fresh id is added beside the shipped entries, while reusing a shipped id puts you in THAT cell and replaces it. Owners that filter by id address you by it."},{name:"order",requirement:"optional",type:"number",doc:"Position among the entries, ascending (default 0)."},{name:"label",requirement:"optional",type:"string | (() => string)",doc:"Display text where the owner projects one (nav rows, tabs). A thunk is re-read on every projection, so localized text follows the active locale without re-registering."}],ownerProps:[`/** Owner share of an action rendered beside Settings at the sidebar foot. */
export interface SidebarFooterActionOwnerProps {
  /** Whether the sidebar renders wide content (false = 56px rail). */
  wide: boolean
}`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'sidebar' (client-ui-sidebar), so it exists while that entry is mounted",occupants:["client-ui-cordis CordisPanel id 'cordis-panel'"],replaceRisk:"none",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register(
      { name: 'sidebar.footer.action', id: 'my-entry', order: 100, label: 'My entry' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-sidebar/src/client/contract/slots.ts:46"},{key:"sidebar.settings",kind:"single",scope:"root",summary:"The settings seat at the sidebar foot.",doc:`The settings seat at the sidebar foot. Declared by this package's
'sidebar' entry; ui-settings registers its trigger row + modal panel.
The sidebar passes only its column state — it holds no settings state.`,registerOptions:[],ownerProps:[`/**
 * Owner share of the sidebar settings seat: the column display state the
 * occupant's trigger row must render against (wide row vs rail icon).
 */
export interface SidebarSettingsOwnerProps {
  /** Whether the sidebar renders wide content (false = 56px rail). */
  wide: boolean
}`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'sidebar' (client-ui-sidebar), so it exists while that entry is mounted",occupants:["client-ui-settings-general SettingsRoot"],replaceRisk:"shadows-shipped-ui",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('sidebar.settings', () => ctx.slots.register(
      { name: 'sidebar.settings' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-sidebar/src/client/contract/slots.ts:41"},{key:"sidebar.workspaces",kind:"single",scope:"root",summary:"The workspace/session browsing region: section header, search, the grouped/flat session list, and every workspace dialog.",doc:`The workspace/session browsing region: section header, search, the
grouped/flat session list, and every workspace dialog. Declared by this
package's 'sidebar' entry (declaring is claiming); ui-workspace
registers the browser.`,registerOptions:[],ownerProps:[`/**
 * Owner share of the browser hole — the only facts crossing the shell/region
 * boundary. Business data and actions arrive through the region's own inject.
 */
export interface SidebarSectionOwnerProps {
  /** Shell fold-state output: wide renders the full browser, rail the icon column. */
  wide: boolean
  /** Rail icons request expansion; the browser rides the wide flip for focus. */
  expandSidebar: () => void
}`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'sidebar' (client-ui-sidebar), so it exists while that entry is mounted",occupants:["client-ui-workspace WorkspaceBrowser"],replaceRisk:"shadows-shipped-ui",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('sidebar.workspaces', () => ctx.slots.register(
      { name: 'sidebar.workspaces' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-sidebar/src/client/contract/slots.ts:35"},{key:"sidebar.workspaces.directoryFlow",kind:"single",scope:"root",summary:"Directory-flow hole under the sidebar browsing region (declared by the WorkspaceBrowser entry).",doc:"Directory-flow hole under the sidebar browsing region (declared by the WorkspaceBrowser entry).",registerOptions:[],ownerProps:[`/**
 * Owner share of the directory-flow holes: the complete conversation between
 * the trigger surface and the picking interaction. The occupant reads \`open\`
 * to run/render its interaction and reports exactly one outcome per open.
 */
export interface DirectoryFlowOwnerProps {
  /** True while a picking interaction is requested; flipping back to false withdraws the request. */
  open: boolean
  /** True while the owner adopts a picked path (\`createWorkspace\` in flight); occupants disable their commit affordances. */
  busy: boolean
  /** The operator picked a directory (absolute host path); the owner adopts it. */
  onPicked: (path: string) => void
  /** The operator dismissed the interaction; the owner just closes the flow. */
  onCancel: () => void
  /** The interaction itself failed (chooser missing, listing denied); the owner shows its error surface. */
  onError: (message: string) => void
}`],ownerPropsReferences:[],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>"],keyDomain:"",hookContext:"",slotInject:"",declaredBy:"an entry in 'sidebar.workspaces' (client-ui-workspace), so it exists while that entry is mounted",occupants:["client-ui-directory-picker-browse BrowseDirectoryFlow","client-ui-directory-picker-native NativeDirectoryFlow"],replaceRisk:"shadows-shipped-ui",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('sidebar.workspaces.directoryFlow', () => ctx.slots.register(
      { name: 'sidebar.workspaces.directoryFlow' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-workspace/src/client/contract/slots.ts:59"},{key:"tool.call.toolview",kind:"keyed",scope:"session",summary:"Keyed atomic Tool call view, dispatched by the wire Tool name.",doc:`Keyed atomic Tool call view, dispatched by the wire Tool name. Register
with \`key: '<tool name>'\` to own how one tool's calls render inside a
turn — the key domain is open (any wire tool name, including a tool your
own package registered), so there is no compile-time key set to pick
from and a typo simply never renders.

A key the shipped composition already covers is replaced, not shared;
an unclaimed key falls back to the generic tool row, so registering is
additive for your own tool and a takeover for a shipped one. The owner
passes the call's identity, its frozen running-or-settled node, and the
expansion state (see ToolCallOwnerProps), so the view stays a pure
function of what the turn already knows.`,registerOptions:[{name:"key",requirement:"required",type:"string",doc:"Your cell key: the entry renders where the owner dispatches this exact key. Registering an already-occupied key replaces that occupant."}],ownerProps:[`/** Standard owner currency supplied to every atomic Tool view. */
export interface ToolCallOwnerProps {
  /** Tool call identity, stable across running and settled forms. */
  callId: string
  /** Wire Tool name and keyed dispatch value. */
  toolName: string
  /** Frozen running call or settled result node. */
  block: ToolCallBlock
  /** Session workspace root for relative summaries. */
  cwd?: string | undefined
  /** Host account home; POSIX home-rooted summaries display as \`~\`. */
  home?: string | undefined
  /** Open a Tool argument path through the Host. */
  openFile: (path: string) => void
  /** Inspect this call in the trajectory view when available. */
  inspect?: (() => void) | undefined
}`],ownerPropsReferences:["Wire"],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>","useSession: SnapshotSelectorHook<ConversationSnapshot>","sessionId: SessionId","useProjection: UseProjection","useInput: SnapshotSelectorHook<InputState>","inputActions: InputActions"],keyDomain:"open: any string the owner dispatches (no compile-time key set), already taken: ask_user_question, bash, cordis_define, cordis_run, cordis_stop, cordis_undefine, edit, glob, grep, read, skill, todo_write, web_fetch, web_search, write",hookContext:"",slotInject:"",declaredBy:"an entry in 'conversation.chat.node' (client-ui-tool), so it exists while that entry is mounted",occupants:["client-ui-skill SkillRow key 'skill'","client-ui-tool AskQuestionRow key 'ask_user_question'","client-ui-tool BashRow key 'bash'","client-ui-tool FileMutationRow key 'edit'","client-ui-tool FileMutationRow key 'write'","client-ui-tool ReadRow key 'read'","client-ui-tool SearchRow key 'grep'","client-ui-tool SearchRow key 'glob'","client-ui-tool TodoRow key 'todo_write'","client-ui-tool WebRow key 'web_search'","client-ui-tool WebRow key 'web_fetch'","client-ui-cordis CordisDefineRow key 'cordis_define'","client-ui-cordis CordisRunRow key 'cordis_run'","client-ui-cordis CordisActionRow key 'cordis_stop'","client-ui-cordis CordisActionRow key 'cordis_undefine'"],replaceRisk:"shadows-shipped-ui",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('tool.call.toolview', () => ctx.slots.register(
      { name: 'tool.call.toolview', key: '<one key the owner dispatches>' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/client/ui-tool/src/client/contract/slots.ts:24"},{key:"tool.view.cordis",kind:"keyed",scope:"session",summary:"Interactive Package-owned region rendered inside the latest eligible `cordis_run` card in the conversation flow.",doc:"Interactive Package-owned region rendered inside the latest eligible\n`cordis_run` card in the conversation flow. Use it for controls and other\nUI the user can interact with. Dynamic Client code registers with\n`key: 'self'`; the Guard binds that key to the current Plugin and Package.",registerOptions:[{name:"key",requirement:"required",type:"string",doc:"Your cell key: the entry renders where the owner dispatches this exact key. Registering an already-occupied key replaces that occupant."}],ownerProps:[`/** Owner currency delivered to a dynamic Package's business view. */
export interface CordisToolViewOwnerProps {
  readonly pluginId: CordisDynamicPluginId
  readonly packageId: CordisDynamicPackageId
  readonly pluginRunId: CordisDynamicPluginRunId
}`],ownerPropsReferences:["CordisDynamicPackageId","CordisDynamicPluginId","CordisDynamicPluginRunId"],standardProps:["useSessions: SnapshotSelectorHook<SessionListState>","useWorkspaces: SnapshotSelectorHook<import('./workspaces/service.ts').WorkspaceListState>","useSession: SnapshotSelectorHook<ConversationSnapshot>","sessionId: SessionId","useProjection: UseProjection","useInput: SnapshotSelectorHook<InputState>","inputActions: InputActions"],keyDomain:"open: any string the owner dispatches (no compile-time key set), none are taken yet",hookContext:"",slotInject:"",declaredBy:"an entry in 'tool.call.toolview' (client-ui-cordis), so it exists while that entry is mounted",occupants:[],replaceRisk:"none",example:`return {
  inject: ['slots'],
  apply(ctx) {
    ctx.slots.inject('tool.view.cordis', () => ctx.slots.register(
      { name: 'tool.view.cordis', key: '<one key the owner dispatches>' },
      () => React.createElement('div', null, 'hello'),
    ))
  },
}`,source:"packages/extensions/ui-cordis/src/client/slots.ts:31"}],ke={type:"object",properties:{},additionalProperties:!1},fe={description:"JSON data owned by this inspect provider."},we=B("service","Exact Service key. Omit it for the compact Service and method-signature directory."),ve=B("event","Exact Event name. Omit it for the compact Event and listener-signature directory."),Se={description:"Compact Service directory, or one exact Service contract with only its referenced type declarations."},be={description:"Compact Event directory, or one exact Event contract with only its referenced type declarations."},xe={description:"Compact purpose/topology trees. With root, selected also contains that Slot's full contract and live occupants."},Ie={type:"object",properties:{root:{type:"string",description:"Exact live Slot key. When supplied, selected contains the full contract for this Slot."}},additionalProperties:!1},Pe=[{name:"ctx",description:"Restricted Cordis Context. Prefer ctx.get(name) with an undefined check; use inject only for hard dependencies.",signatures:["ctx.get(name: string): unknown | undefined","ctx.on(name: string, listener: Function): () => void","ctx.provide(name: string, value: unknown): () => void","ctx.effect(callback: Function, label?: string): () => void"]},{name:"React",description:"React runtime exposed without JSX transformation.",signatures:["React.createElement(type, props, ...children): ReactElement","React.useState(initial)","React.useEffect(effect, deps)"]},{name:"host",description:"Package-private JSON RPC from Client to this Package's Host half.",signatures:["host.call(method: string, args?: JsonValue): Promise<JsonValue>"]},{name:"styles",description:"Package-owned stylesheet insertion cleaned up with the Client run.",signatures:["styles.insert(css: string): () => void"]},{name:"console",description:"Package-tagged browser logging.",signatures:["console.log(...values): void","console.error(...values): void"]}];function Ce(e){return[x("Service","Progressive Client Service discovery: compact capability/signature directory, then one exact coding contract.","listService",t=>me(K(t,"service")),we,Se),x("Event","Progressive Client Event discovery: compact listener directory, then one exact event contract.","listEvents",t=>ge(K(t,"event")),ve,be),x("Builtin","Plain-JavaScript symbols available to a dynamic Client half.","listBuiltins",()=>({builtins:[...Pe],referencedTypes:[]})),{manifest:{id:"Slots",description:"Progressive live Slot inspection: compact purpose/topology trees plus one exact Slot contract.",methods:[{name:"listSubTree",description:"Return compact live Slot trees for navigation. With root, also return the selected Slot's full contract and occupants.",inputSchema:Ie,outputSchema:xe}]},query(t,n){if(t!=="listSubTree")throw new Error(`unknown Slots inspect method "${t}"`);const o=e.get("slots");if(o===void 0)throw new Error("Client Slots service is not running");const i=typeof n=="object"&&n!==null&&!Array.isArray(n)&&typeof n.root=="string"?n.root:void 0,s=o.snapshot(i),r=s[0];return Promise.resolve({...i===void 0?{}:{requestedRoot:{name:i,available:s.length>0}},trees:s.map($),...i===void 0||r===void 0?{}:{selected:Re(r)},referencedTypes:[]})}},x("Theme","Current theme token names and light/dark override requirements.","listTokens",()=>{const t=e.get("theme");if(t===void 0)throw new Error("Client Theme service is not running");return{tokens:t.exportInspectTokens(),referencedTypes:[]}})]}function x(e,t,n,o,i=ke,s=fe){return{manifest:{id:e,description:t,methods:[{name:n,description:t,inputSchema:i,outputSchema:s}]},async query(r,a){if(r!==n)throw new Error(`unknown ${e} inspect method "${r}"`);return await o(a)}}}function B(e,t){return{type:"object",properties:{[e]:{type:"string",description:t}},additionalProperties:!1}}function K(e,t){if(e==null||Array.isArray(e)||typeof e!="object")return;const n=e[t];return typeof n=="string"?n:void 0}const F=new Map(ye.map(e=>[e.key,e])),_=new Map([["tool.view.cordis",{description:"fixed by the dynamic Client Guard",values:[{value:"self",description:"The only accepted key. The Guard binds it to this Package's pluginId and packageId."}]}]]);function $(e){const t=F.get(e.name),n=t===void 0?void 0:_.get(t.key);return{name:e.name,kind:e.kind,scope:e.scope,...t===void 0?{}:{purpose:t.summary,replaceRisk:t.replaceRisk,...t.registerOptions.length===0?{}:{registration:t.registerOptions.map(o=>({name:o.name,type:o.type,required:o.requirement==="required"}))},...t.keyDomain===""?{}:{keyDomain:n?.description??t.keyDomain,...n===void 0?{}:{allowedKeys:n.values.map(o=>({...o}))}}},children:e.children.map($)}}function Re(e){const t=F.get(e.name);return{name:e.name,kind:e.kind,scope:e.scope,...e.declaredBy===void 0?{}:{declaredBy:e.declaredBy},occupants:e.occupants.map(n=>({...n})),...t===void 0?{}:{catalog:Te(t)}}}function Te(e){const t=_.get(e.key);return{description:e.doc,registration:e.registerOptions.map(n=>({name:n.name,type:n.type,required:n.requirement==="required",description:n.doc})),ownerProps:[...e.ownerProps],ownerPropsReferences:[...e.ownerPropsReferences],standardProps:[...e.standardProps],keyDomain:t?.description??e.keyDomain,...t===void 0?{}:{allowedKeys:t.values.map(n=>({...n}))},hookContext:e.hookContext,slotInject:e.slotInject,replaceRisk:e.replaceRisk}}var U=class extends P.Service{constructor(e){super(e,"timer"),e.mixin("timer",["timeout","interval","throttle","debounce","setTimeout","setInterval"])}setTimeout(e,t){return this.timeout(e,t)}setInterval(e,t){return this.interval(e,t)}timeout(...e){const t=typeof e[0]=="function"?e.shift():void 0,n=e[0];if(t!==void 0){const a=this.ctx.effect(()=>{const c=globalThis.setTimeout(()=>{a(),t()},n);return()=>{globalThis.clearTimeout(c)}},"ctx.timeout()");return a}const{promise:o,resolve:i,reject:s}=Promise.withResolvers(),r=this.ctx.effect(()=>{const a=globalThis.setTimeout(i,n);return()=>{globalThis.clearTimeout(a),s(new Error("Context has been disposed"))}},"ctx.timeout()");return o.finally(()=>{r()})}interval(...e){const t=typeof e[0]=="function"?e.shift():void 0,n=e[0];if(t!==void 0)return this.ctx.effect(()=>{const r=globalThis.setInterval(t,n);return()=>{globalThis.clearInterval(r)}},"ctx.interval()");let o,i;const s=this.ctx.effect(()=>{const r=globalThis.setInterval(()=>{i?.resolve({done:!1,value:void 0})},n);return()=>{globalThis.clearInterval(r),o===void 0&&(o={kind:"throw",reason:new Error("Context has been disposed")},i?.reject(o.reason))}},"ctx.interval()");return{next:()=>o===void 0?(i=Promise.withResolvers()).promise:o.kind==="return"?Promise.resolve({done:!0,value:o.value}):Promise.reject(o.reason),return:r=>(o===void 0&&(o={kind:"return",value:r}),i?.resolve({done:!0,value:r}),s(),Promise.resolve({done:!0,value:r})),throw:r=>(o===void 0&&(o={kind:"throw",reason:r}),i?.reject(r),s(),Promise.resolve({done:!0,value:void 0})),[Symbol.asyncIterator](){return this}}}schedule(e,t,n=!1){let o;const i=this.ctx.effect(()=>()=>{n=!0,globalThis.clearTimeout(o)},e),s=(...r)=>{globalThis.clearTimeout(o),o=t(r,n)};return s.dispose=i,s}throttle(e,t,n){let o=-1/0;const i=(...s)=>{o=Date.now(),e(...s)};return this.schedule("ctx.throttle()",(s,r)=>{const a=t-Date.now()+o;if(a<=0)i(...s);else if(!r)return globalThis.setTimeout(i,a,...s)},n)}debounce(e,t){return this.schedule("ctx.debounce()",(n,o)=>{if(!o)return globalThis.setTimeout(e,t,...n)})}};function je(e){new U(e)}function Oe(e,t,n){const o=`host.call("${t}") on ${e}`;return n.code==="plugin-not-running"?`${o} found no active Host half — the Plugin is stopped or was removed.`:n.code==="stale-run"?`${o} belongs to an activation that has already been replaced.`:n.code==="method-not-found"?`${o} is not registered: the host half must declare it with harness.handle("${t}", fn).`:`${o} failed inside the host handler: ${n.message}`}function He(e,t,n){const o=new Error(Oe(e,t,n));return n.stack!==void 0&&(o.stack=`${o.stack??o.message}
Host stack:
${n.stack}`),o}function V(e,t,n){return`host.call("${t}") on ${e} did not complete: ${n instanceof Error?n.message:String(n)}
Both directions carry JSON only: pass plain JSON data as the argument — or omit it, and the handler receives null — and answer from harness.handle("${t}", fn) with JSON (\`return null\` when there is nothing to report).`}const Ae="cordis-client-runner",Ee=["loader","modules","slots","remote","remote.dynamicCordisRunner"];function De(e){je(e);const t=new q({sync:async s=>{const r=await e.remote.dynamicCordisRunner.syncInspectManifest(s);if(!r.ok)throw new Error(`${r.error.code}: ${r.error.message}`)},resolve:async(s,r,a)=>{const c=await e.remote.dynamicCordisRunner.resolveInspectQuery(s,r,a);if(!c.ok)throw new Error(`${c.error.code}: ${c.error.message}`)}});de(e,t);for(const s of Ce(e))e.effect(()=>t.register(s),`cordis-client-runner: inspect ${s.manifest.id}`);e.on("connection/reset",()=>{t.publish()});const n=new E({ctx:e,loader:e.loader,modules:e.get("modules"),slots:e.get("slots"),invoke:async(s,r,a,c)=>{const l=await e.remote.dynamicCordisRunner.invoke(s,r,a,c).catch(d=>{throw new Error(V(s,a,d))});if(!l.ok)throw new Error(V(s,a,`${l.error.code}: ${l.error.message}`));const u=l.value;if(u.ok)return u.value;throw He(s,a,u)},reportRenderFailure:(s,r,a,c)=>{e.remote.dynamicCordisRunner.reportRenderFailure(s,r,a,c).then(l=>{l.ok||console.error(`[cordis-client-runner] reporting a render failure of ${r} failed:`,l.error)},l=>{console.error(`[cordis-client-runner] reporting a render failure of ${r} failed:`,l)})},reportGuardFailure:(s,r,a,c)=>{e.remote.dynamicCordisRunner.reportClientGuardFailure(s,r,a,c).then(l=>{l.ok||console.error(`[cordis-client-runner] reporting a guard failure of ${r} failed:`,l.error)},l=>{console.error(`[cordis-client-runner] reporting a guard failure of ${r} failed:`,l)})}}),o=new M({runner:n,host:{runHostHalf:async(s,r,a,c,l,u)=>{const d=await e.remote.dynamicCordisRunner.runHostHalf(s,r,a,c,l,u);return d.ok?d.value:{ok:!1,message:`${d.error.code}: ${d.error.message}`}},getClientCode:async(s,r,a)=>{const c=await e.remote.dynamicCordisRunner.getClientCode(s,r,a);if(!c.ok)throw new Error(`${c.error.code}: ${c.error.message}`);return c.value},resolveRequestRun:async(s,r)=>{const a=await e.remote.dynamicCordisRunner.resolveRequestRun(s,r);if(!a.ok)throw new Error(`${a.error.code}: ${a.error.message}`);return a.value},settleUserRun:async(s,r,a)=>{const c=await e.remote.dynamicCordisRunner.settleUserRun(s,r,a);if(!c.ok)throw new Error(`${c.error.code}: ${c.error.message}`);return c.value}}}),i={activeRuns:o.activeRuns,lastRunError:o.lastRunError,renderFailures:n.renderFailures,reconcileApprovals:s=>{o.reconcileApprovals(s)},approve:(s,r)=>o.approve(s,r),decline:s=>o.decline(s),startUserRun:s=>o.startUserRun(s),subscribe:s=>n.subscribe(s),getSnapshot:()=>n.getSnapshot(),isLoaded:s=>n.isLoaded(s)};e.provide("dynamicCordisRunner",i),e.effect(()=>()=>{n.dispose()},"cordis-client-runner: dynamic package runner"),e.remote.$on("cordis/request-run",s=>{o.open(s)}),e.remote.$on("cordis/request-run-resolved",s=>{o.close(s.requestId)}),e.remote.$on("cordis/dynamic-retract",s=>{n.retract(s.pluginId,s.pluginRunId)}),e.remote.$on("cordis/inspect-query",s=>{t.query(s).catch(r=>{console.error(`[cordis-client-runner] inspect query ${s.provider}.${s.method} failed:`,r)})}),e.remote.$on("cordis/inspect-query-resolved",s=>{t.close(s.requestId)})}return p.ClientCordisInspectRegistry=q,p.ClientTimerService=U,p.CordisRunOrchestrator=M,p.DynamicCordisPackageRunner=E,p.DynamicCordisStyles=R,p.apply=De,p.dynamicCordisContext=A,p.evaluateClientHalf=j,p.inject=Ee,p.isDynamicCordisPlugin=T,p.name=Ae,w.exports}})),z}var G=Ne();const We=Me(G),Ke=qe({__proto__:null,default:We},[G]);export{Ke as c};
