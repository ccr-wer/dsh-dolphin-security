window.__ModuleLoader__.load({
	id: "@dsh-web/network",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		"use strict";
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __export = (target, all) => {
		  for (var name in all)
		    __defProp(target, name, { get: all[name], enumerable: true });
		};
		var __copyProps = (to, from, except, desc) => {
		  if (from && typeof from === "object" || typeof from === "function") {
		    for (let key of __getOwnPropNames(from))
		      if (!__hasOwnProp.call(to, key) && key !== except)
		        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
		  }
		  return to;
		};
		var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

		// packages/dsh-web-network/src/client.tsx
		var client_exports = {};
		__export(client_exports, {
		  apply: () => apply,
		  default: () => client_default,
		  inject: () => inject
		});
		module.exports = __toCommonJS(client_exports);
		var import_react = require("react");
		var import_jsx_runtime = require("react/jsx-runtime");
		var BRIDGE = "__DSH_WEB_NETWORK__";
		function network() {
		  return globalThis[BRIDGE];
		}
		var STYLE = `
		.dsh-web-network{display:flex;flex-direction:column;gap:1.1rem;padding:.5rem 0 1.5rem}
		.dsh-web-network h3{margin:0;font-size:15px;font-weight:500}
		.dsh-web-network p{margin:0;font-size:13px;line-height:1.65;opacity:.72}
		.dsh-web-network code{font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;
		 background:var(--dsw-alias-markdown-code-block,rgba(127,127,127,.12));border-radius:.25rem;padding:.05rem .3rem}
		.dsh-web-network-field{display:flex;flex-direction:column;gap:.4rem}
		.dsh-web-network-field label{font-size:13px;font-weight:500}
		.dsh-web-network-row{display:flex;gap:.5rem;flex-wrap:wrap;align-items:center}
		.dsh-web-network-row input[type=text]{flex:1;min-width:18rem;padding:.45rem .6rem;border-radius:.5rem;
		 border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.4));background:transparent;color:inherit;
		 font:13px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace}
		.dsh-web-network button{font:inherit;font-size:13px;padding:.4rem .8rem;border-radius:.5rem;cursor:pointer;
		 border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.4));background:transparent;color:inherit}
		.dsh-web-network button:disabled{opacity:.5;cursor:default}
		.dsh-web-network-toggle{display:flex;gap:.6rem;align-items:flex-start;cursor:pointer}
		.dsh-web-network-toggle input{margin-top:.25rem}
		.dsh-web-network-toggle span{font-size:13px;line-height:1.6}
		.dsh-web-network-warn{font-size:13px;line-height:1.65;padding:.6rem .75rem;border-radius:.5rem;
		 border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.35));
		 background:var(--dsw-alias-markdown-code-block,rgba(127,127,127,.08))}
		.dsh-web-network-status{font:12px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;
		 padding:.5rem .6rem;border-radius:.5rem;background:var(--dsw-alias-markdown-code-block,rgba(127,127,127,.12))}
		.dsh-web-network-status[data-error]{color:var(--dsw-alias-state-error-primary,#d33)}
		.dsh-web-network-list{margin:0;padding-left:1.1rem;font:12px/1.7 ui-monospace,SFMono-Regular,Menlo,monospace;opacity:.8}
		`;
		function NetworkSection() {
		  const bridge = network();
		  const [enabled, setEnabled] = (0, import_react.useState)(() => bridge?.config().enabled ?? false);
		  const [template, setTemplate] = (0, import_react.useState)(() => bridge?.config().template ?? "");
		  const [status, setStatus] = (0, import_react.useState)(void 0);
		  const [busy, setBusy] = (0, import_react.useState)(false);
		  const [used, setUsed] = (0, import_react.useState)(() => bridge?.proxied() ?? []);
		  (0, import_react.useEffect)(() => {
		    const timer = setInterval(() => {
		      setUsed(network()?.proxied() ?? []);
		    }, 2e3);
		    return () => {
		      clearInterval(timer);
		    };
		  }, []);
		  const apply2 = (0, import_react.useCallback)((next) => {
		    const api = network();
		    if (api === void 0) {
		      setStatus({ text: "The network policy is not available in this build.", error: true });
		      return;
		    }
		    const applied = api.setConfig(next);
		    setEnabled(applied.enabled);
		    if (next.template !== void 0) setTemplate(applied.template);
		    setStatus({ text: applied.enabled ? `Saved. Blocked requests retry through ${applied.template}.` : "Saved. Blocked requests now fail instead of being retried." });
		  }, []);
		  const test = (0, import_react.useCallback)(async () => {
		    const api = network();
		    if (api === void 0) return;
		    setBusy(true);
		    setStatus({ text: "Testing\u2026" });
		    try {
		      const result = await api.test(template.trim());
		      setStatus({ text: result.detail, error: !result.ok });
		    } finally {
		      setBusy(false);
		    }
		  }, [template]);
		  if (bridge === void 0) {
		    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-web-network", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "This build publishes no network policy, so there is nothing to configure here." }) });
		  }
		  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-network", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-network-field", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "CORS proxy" }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
		        "This page runs entirely in your browser, so it reaches a host only if that host sends CORS headers. Most do \u2014 the npm registry, DeepSeek, Anthropic, Google, OpenRouter. Some do not: OpenAI, NVIDIA, Cerebras and ",
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "codeload.github.com" }),
		        " all refuse a browser outright, and a request to them fails with ",
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "Failed to fetch" }),
		        " however it is written."
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "When that happens, the request can be retried once through a proxy. The direct attempt is always made first, so a host that answers a browser never goes through one." }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
		        "One thing this does not reach: commands the agent runs. Those leave from the runtime's own worker, which the page cannot intercept, so the shell tool is instead ",
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "told" }),
		        " what is configured here \u2014 and it is told at page load, so a change below reaches the model on the next reload."
		      ] })
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { className: "dsh-web-network-toggle", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		        "input",
		        {
		          type: "checkbox",
		          checked: enabled,
		          onChange: (event) => {
		            apply2({ enabled: event.target.checked });
		          }
		        }
		      ),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Retry a blocked request through the proxy below" })
		    ] }),
		    !enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-network-warn", children: [
		      "The default model is off with it. ",
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "opencode.ai/zen" }),
		      " \u2014 which serves the free tier this page starts on \u2014 refuses browsers like the rest, so with no proxy it cannot be reached. Pick a provider that answers a browser in Settings \u2192 Models, or turn the retry back on."
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-network-field", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", { htmlFor: "dsh-web-network-template", children: "Proxy URL" }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-network-row", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		          "input",
		          {
		            id: "dsh-web-network-template",
		            type: "text",
		            value: template,
		            spellCheck: false,
		            placeholder: bridge.defaults.template,
		            onChange: (event) => {
		              setTemplate(event.target.value);
		            },
		            onKeyDown: (event) => {
		              if (event.key === "Enter") apply2({ template: template.trim() });
		            }
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: busy, onClick: () => {
		          apply2({ template: template.trim() });
		        }, children: "Save" }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: busy, onClick: () => {
		          void test();
		        }, children: "Test" }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		          "button",
		          {
		            type: "button",
		            disabled: busy,
		            onClick: () => {
		              apply2({ template: bridge.defaults.template });
		            },
		            children: "Reset"
		          }
		        )
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "{url}" }),
		        " is replaced with the target address and ",
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "{encoded}" }),
		        " with its percent-encoded form, so both a prefix proxy (",
		        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", { children: [
		          "https://host/",
		          "{url}"
		        ] }),
		        ") and one taking a query parameter (",
		        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("code", { children: [
		          "https://host/?url=",
		          "{encoded}"
		        ] }),
		        ") work. The default is",
		        " ",
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: bridge.defaults.template }),
		        "; ",
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: bridge.defaults.alternative }),
		        " was measured to work the same way."
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
		        "Both of those public proxies buffer: a proxied reply arrives whole when the model finishes rather than a word at a time. The answer is the same, the wait just looks like nothing is happening. A proxy that streams fixes it, which is the reason to run your own \u2014 a Cloudflare Worker forwarding the request and returning ",
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "response.body" }),
		        " unread is enough, and it is also the only way this traffic stops passing through a stranger."
		      ] })
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-network-warn", children: [
		      "A proxy sees the whole request \u2014 the URL, the headers, and the body. That includes the API key on a model request routed through it. Only a host that refuses browsers is ever proxied, and no cookies are sent, but if you would not hand this traffic to the operator of",
		      " ",
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: template.trim() === "" ? bridge.defaults.template : template.trim() }),
		      ", turn the retry off above or point it at a proxy you run."
		    ] }),
		    used.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-network-field", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Proxied this session" }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Hosts that refused this browser directly and were reached through the proxy instead." }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { className: "dsh-web-network-list", children: used.map((origin) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: origin }, origin)) })
		    ] }),
		    status !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-web-network-status", ...status.error === true ? { "data-error": "" } : {}, children: status.text })
		  ] });
		}
		var inject = ["slots"];
		function apply(ctx) {
		  if (document.getElementById("dsh-web-network-style") === null) {
		    const style = document.createElement("style");
		    style.id = "dsh-web-network-style";
		    style.textContent = STYLE;
		    document.head.append(style);
		  }
		  const slots = ctx.get("slots");
		  if (slots === void 0) return;
		  slots.inject("settings.section", () => slots.register({
		    name: "settings.section",
		    id: "network",
		    order: 12,
		    label: () => "Network"
		  }, NetworkSection));
		}
		var client_default = { apply, inject };

		return module.exports;
	}
});
