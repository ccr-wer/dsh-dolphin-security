window.__ModuleLoader__.load({
	id: "@dsh-web/plugin-install",
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

		// packages/dsh-web-plugins/src/client.tsx
		var client_exports = {};
		__export(client_exports, {
		  apply: () => apply,
		  default: () => client_default,
		  inject: () => inject
		});
		module.exports = __toCommonJS(client_exports);
		var import_react = require("react");
		var import_jsx_runtime = require("react/jsx-runtime");
		var BRIDGE = "__DSH_WEB_PLUGINS__";
		function installer() {
		  return globalThis[BRIDGE];
		}
		var STYLE = `
		.dsh-web-install{display:flex;flex-direction:column;gap:.6rem;padding:.75rem 0}
		.dsh-web-install-row{display:flex;gap:.5rem;flex-wrap:wrap;align-items:center}
		.dsh-web-install-row input[type=text]{flex:1;min-width:14rem;padding:.4rem .55rem;border-radius:.4rem;
		 border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.4));background:transparent;color:inherit;font:inherit}
		.dsh-web-install button{font:inherit;padding:.35rem .75rem;border-radius:.4rem;cursor:pointer;
		 border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.4));background:transparent;color:inherit}
		.dsh-web-install button:disabled{opacity:.5;cursor:default}
		.dsh-web-install-note{opacity:.6;font-size:12px;line-height:1.6}
		.dsh-web-install-status{font:12px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;
		 padding:.5rem .6rem;border-radius:.4rem;background:var(--dsw-alias-markdown-code-block,rgba(127,127,127,.12))}
		.dsh-web-install-status[data-error]{color:var(--dsw-alias-state-error-primary,#d33)}
		.dsh-web-roster{display:flex;flex-direction:column;gap:.5rem;padding:.75rem 0}
		.dsh-web-roster-row{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;padding:.5rem .6rem;border-radius:.5rem;
		 border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.25))}
		.dsh-web-roster-name{font-weight:600}
		.dsh-web-roster-version{opacity:.6;font-size:12px}
		.dsh-web-roster-note{opacity:.6;font-size:12px;flex:1;min-width:8rem}
		.dsh-web-roster-state{font-size:12px;padding:.1rem .45rem;border-radius:999px;
		 border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.4))}
		.dsh-web-roster-state[data-enabled]{color:var(--dsw-alias-state-success-primary,#2a7);border-color:currentColor}
		.dsh-web-roster-actions{display:flex;gap:.4rem;margin-left:auto}
		`;
		function InstallPanel() {
		  const [spec, setSpec] = (0, import_react.useState)("");
		  const [status, setStatus] = (0, import_react.useState)(void 0);
		  const [busy, setBusy] = (0, import_react.useState)(false);
		  const file = (0, import_react.useRef)(null);
		  const run = (0, import_react.useCallback)(async (source) => {
		    const api = installer();
		    if (api === void 0) {
		      setStatus({ text: "The installer is not available in this build.", error: true });
		      return;
		    }
		    if (source.trim() === "") return;
		    setBusy(true);
		    setStatus({ text: `Installing ${source}\u2026` });
		    try {
		      const entry = await api.install(source.trim());
		      setSpec("");
		      setStatus({
		        text: `Installed ${entry.name}@${entry.version}.${entry.patch === void 0 ? " It declares no composition layer." : ""} Reload to apply \u2014 composition is fixed at boot.`
		      });
		    } catch (error) {
		      setStatus({ text: error instanceof Error ? error.message : String(error), error: true });
		    } finally {
		      setBusy(false);
		    }
		  }, []);
		  const onPick = (0, import_react.useCallback)(async () => {
		    const picked = file.current?.files?.[0];
		    if (picked === void 0) return;
		    const api = installer();
		    if (api === void 0) return;
		    setStatus({ text: `Reading ${picked.name}\u2026` });
		    const staged = api.stage(picked.name, await picked.arrayBuffer());
		    if (file.current !== null) file.current.value = "";
		    await run(staged);
		  }, [run]);
		  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-install", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-install-row", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		        "input",
		        {
		          type: "text",
		          value: spec,
		          placeholder: "package, tarball URL, owner/repo, or /path",
		          "aria-label": "Plugin source",
		          onChange: (event) => {
		            setSpec(event.target.value);
		          },
		          onKeyDown: (event) => {
		            if (event.key === "Enter") void run(spec);
		          }
		        }
		      ),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: busy, onClick: () => {
		        void run(spec);
		      }, children: "Install" }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: busy, onClick: () => {
		        file.current?.click();
		      }, children: "From file\u2026" }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		        "input",
		        {
		          ref: file,
		          type: "file",
		          hidden: true,
		          accept: ".tgz,.tar.gz,application/gzip,application/x-gzip",
		          onChange: () => {
		            void onPick();
		          }
		        }
		      )
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "dsh-web-install-note", children: [
		      "Accepts an npm name, a tarball URL, ",
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "owner/repo#ref" }),
		      ", or a path in this filesystem \u2014 the same sources ",
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "dsh plugin add" }),
		      " takes on a machine."
		    ] }),
		    status !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-web-install-status", ...status.error === true ? { "data-error": "" } : {}, children: status.text })
		  ] });
		}
		function InstalledPanel() {
		  const [installed, setInstalled] = (0, import_react.useState)([]);
		  const [status, setStatus] = (0, import_react.useState)(void 0);
		  const [changed, setChanged] = (0, import_react.useState)(false);
		  const [busy, setBusy] = (0, import_react.useState)(void 0);
		  const refresh = (0, import_react.useCallback)(() => {
		    setInstalled(installer()?.list() ?? []);
		  }, []);
		  (0, import_react.useEffect)(refresh, [refresh]);
		  const act = (0, import_react.useCallback)(async (plugin, verb) => {
		    const api = installer();
		    if (api === void 0) {
		      setStatus({ text: "The installer is not available in this build.", error: true });
		      return;
		    }
		    if (verb === "remove" && !globalThis.confirm(`Remove ${plugin.name}? Its files are deleted from this browser.`)) {
		      return;
		    }
		    setBusy(plugin.name);
		    try {
		      await api[verb](plugin.name);
		      setChanged(true);
		      setStatus({
		        text: verb === "remove" ? `Removed ${plugin.name}. Reload to apply \u2014 the composition is fixed at boot.` : `${plugin.name} is now ${verb}d. Reload to apply \u2014 the composition is fixed at boot.`
		      });
		    } catch (error) {
		      setStatus({ text: error instanceof Error ? error.message : String(error), error: true });
		    } finally {
		      setBusy(void 0);
		      refresh();
		    }
		  }, [refresh]);
		  const header = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-install-row", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-web-install-note", children: installed.length === 0 ? "Nothing installed yet" : `${String(installed.length)} installed` }),
		    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: refresh, children: "Refresh" })
		  ] });
		  if (installed.length === 0) {
		    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-install dsh-web-roster", children: [
		      header,
		      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "dsh-web-install-note", children: [
		        "Nothing installed here yet. This lists the plugins ",
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("em", { children: "you" }),
		        " add; the ones this build ships are composed at build time and appear under Plugin list."
		      ] })
		    ] });
		  }
		  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-install dsh-web-roster", children: [
		    header,
		    installed.map((plugin) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-roster-row", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-web-roster-name", children: plugin.name }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-web-roster-version", children: plugin.version }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-web-roster-state", ...plugin.enabled ? { "data-enabled": "" } : {}, children: plugin.enabled ? "Enabled" : "Disabled" }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-web-roster-note", children: plugin.patch === void 0 ? "a plain dependency \u2014 it declares no composition layer, so there is nothing to turn on" : plugin.hasClient ? "host rows and a browser surface" : "host rows" }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsh-web-roster-actions", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		          "button",
		          {
		            type: "button",
		            disabled: busy !== void 0 || plugin.patch === void 0,
		            title: plugin.patch === void 0 ? "This package adds no rows to the composition." : void 0,
		            onClick: () => {
		              void act(plugin, plugin.enabled ? "disable" : "enable");
		            },
		            children: plugin.enabled ? "Disable" : "Enable"
		          }
		        ),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: busy !== void 0, onClick: () => {
		          void act(plugin, "remove");
		        }, children: "Remove" })
		      ] })
		    ] }, plugin.name)),
		    status !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-web-install-status", ...status.error === true ? { "data-error": "" } : {}, children: status.text }),
		    changed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-install-row", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => {
		        location.reload();
		      }, children: "Reload now" }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-web-install-note", children: "Until then this page is still running the composition it booted with." })
		    ] })
		  ] });
		}
		var inject = ["slots"];
		function apply(ctx) {
		  if (document.getElementById("dsh-web-install-style") === null) {
		    const style = document.createElement("style");
		    style.id = "dsh-web-install-style";
		    style.textContent = STYLE;
		    document.head.append(style);
		  }
		  const slots = ctx.get("slots");
		  if (slots === void 0) return;
		  const tabs = [
		    { id: "web-plugin-installed", order: 4, label: "Installed", component: InstalledPanel },
		    { id: "web-plugin-install", order: 5, label: "Add a plugin", component: InstallPanel }
		  ];
		  for (const tab of tabs) {
		    slots.inject("settings.plugins.tab", () => slots.register(
		      { name: "settings.plugins.tab", id: tab.id, order: tab.order, label: () => tab.label },
		      tab.component
		    ));
		  }
		}
		var client_default = { apply, inject };

		return module.exports;
	}
});
