window.__ModuleLoader__.load({
	id: "@dsh-web/files",
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

		// packages/dsh-web-files/src/client.tsx
		var client_exports = {};
		__export(client_exports, {
		  apply: () => apply,
		  default: () => client_default,
		  inject: () => inject
		});
		module.exports = __toCommonJS(client_exports);
		var import_react = require("react");
		var import_jsx_runtime = require("react/jsx-runtime");
		var BRIDGE = "__DSH_WEB_FILES__";
		function files() {
		  return globalThis[BRIDGE];
		}
		var OPEN_EVENT = "dsh-web:open-path";
		function parentOf(path, home) {
		  if (path === home || !path.startsWith(`${home}/`)) return home;
		  const cut = path.lastIndexOf("/");
		  return cut <= home.length ? home : path.slice(0, cut);
		}
		function crumbs(path, home) {
		  const rows = [{ name: "~", path: home }];
		  if (!path.startsWith(`${home}/`)) return rows;
		  let walked = home;
		  for (const segment of path.slice(home.length + 1).split("/")) {
		    walked = `${walked}/${segment}`;
		    rows.push({ name: segment, path: walked });
		  }
		  return rows;
		}
		function baseName(path) {
		  return path.slice(path.lastIndexOf("/") + 1);
		}
		function looksTextual(bytes) {
		  const window2 = bytes.subarray(0, 4096);
		  return !window2.includes(0);
		}
		function download(name, bytes) {
		  const blob = new Blob([bytes.slice().buffer], { type: "application/octet-stream" });
		  const url = URL.createObjectURL(blob);
		  const anchor = document.createElement("a");
		  anchor.href = url;
		  anchor.download = name;
		  document.body.append(anchor);
		  anchor.click();
		  anchor.remove();
		  setTimeout(() => {
		    URL.revokeObjectURL(url);
		  }, 1e4);
		}
		function FilesPanel({ open, target, onClose }) {
		  const bridge = files();
		  const home = bridge?.home() ?? "/";
		  const [cwd, setCwd] = (0, import_react.useState)(() => bridge?.root() ?? "/");
		  const [entries, setEntries] = (0, import_react.useState)([]);
		  const [viewing, setViewing] = (0, import_react.useState)(void 0);
		  const [notice, setNotice] = (0, import_react.useState)(void 0);
		  const [backing, setBacking] = (0, import_react.useState)(void 0);
		  const [busy, setBusy] = (0, import_react.useState)(false);
		  const [picked, setPicked] = (0, import_react.useState)(/* @__PURE__ */ new Set());
		  const upload = (0, import_react.useRef)(null);
		  const refresh = (0, import_react.useCallback)(async (directory) => {
		    const api = files();
		    if (api === void 0) {
		      setNotice({ text: "The filesystem bridge is not available in this build.", error: true });
		      return;
		    }
		    setBusy(true);
		    try {
		      setEntries(await api.list(directory));
		      setCwd(directory);
		      setPicked(/* @__PURE__ */ new Set());
		      setNotice(void 0);
		    } catch (error) {
		      setEntries([]);
		      setNotice({ text: `${directory}: ${error instanceof Error ? error.message : String(error)}`, error: true });
		    } finally {
		      setBusy(false);
		    }
		  }, []);
		  const show = (0, import_react.useCallback)(async (path) => {
		    const api = files();
		    if (api === void 0) return;
		    setBusy(true);
		    try {
		      const bytes = await api.read(path);
		      setViewing({
		        path,
		        bytes,
		        ...looksTextual(bytes) ? { text: new TextDecoder().decode(bytes) } : {}
		      });
		    } catch (error) {
		      setNotice({ text: `${path}: ${error instanceof Error ? error.message : String(error)}`, error: true });
		    } finally {
		      setBusy(false);
		    }
		  }, []);
		  (0, import_react.useEffect)(() => {
		    if (!open) return;
		    void files()?.backing().then(setBacking, () => void 0);
		    void refresh(cwd);
		  }, [open, refresh]);
		  (0, import_react.useEffect)(() => {
		    if (!open || target === void 0) return;
		    const api = files();
		    if (api === void 0) return;
		    void (async () => {
		      const directory = parentOf(target, home);
		      const listed = await api.list(directory).catch(() => void 0);
		      if (listed === void 0) {
		        await refresh(target);
		        return;
		      }
		      const row = listed.find((entry) => entry.path === target);
		      if (row?.directory === true || row === void 0) {
		        await refresh(row === void 0 ? directory : target);
		        return;
		      }
		      setEntries(listed);
		      setCwd(directory);
		      setNotice(void 0);
		      await show(target);
		    })();
		  }, [open, target, home, refresh, show]);
		  const save = (0, import_react.useCallback)(async (paths) => {
		    const api = files();
		    if (api === void 0 || paths.length === 0) return;
		    setBusy(true);
		    try {
		      const only = paths.length === 1 ? paths[0] : void 0;
		      if (only !== void 0 && !only.directory) {
		        download(baseName(only.path), await api.read(only.path));
		        return;
		      }
		      const name = only === void 0 ? `${baseName(cwd) || "workspace"}.zip` : `${baseName(only.path)}.zip`;
		      download(name, await api.archive(paths.map((entry) => entry.path), cwd));
		    } catch (error) {
		      setNotice({ text: error instanceof Error ? error.message : String(error), error: true });
		    } finally {
		      setBusy(false);
		    }
		  }, [cwd]);
		  const put = (0, import_react.useCallback)(async (list) => {
		    const api = files();
		    if (api === void 0 || list === null || list.length === 0) return;
		    setBusy(true);
		    try {
		      for (const file of Array.from(list)) {
		        await api.write(`${cwd}/${file.name}`, new Uint8Array(await file.arrayBuffer()));
		      }
		      setNotice({ text: `Uploaded ${String(list.length)} file${list.length === 1 ? "" : "s"} into ${cwd}.` });
		      await refresh(cwd);
		    } catch (error) {
		      setNotice({ text: error instanceof Error ? error.message : String(error), error: true });
		    } finally {
		      setBusy(false);
		    }
		  }, [cwd, refresh]);
		  const remove = (0, import_react.useCallback)(async (entry) => {
		    const api = files();
		    if (api === void 0) return;
		    if (!globalThis.confirm(`Delete ${entry.name}${entry.directory ? " and everything in it" : ""}?`)) return;
		    try {
		      await api.remove(entry.path);
		      if (viewing?.path === entry.path) setViewing(void 0);
		      await refresh(cwd);
		    } catch (error) {
		      setNotice({ text: error instanceof Error ? error.message : String(error), error: true });
		    }
		  }, [cwd, refresh, viewing]);
		  const makeDirectory = (0, import_react.useCallback)(async () => {
		    const api = files();
		    if (api === void 0) return;
		    const name = globalThis.prompt("New folder name");
		    if (name === null || name.trim() === "") return;
		    try {
		      await api.mkdir(`${cwd}/${name.trim()}`);
		      await refresh(cwd);
		    } catch (error) {
		      setNotice({ text: error instanceof Error ? error.message : String(error), error: true });
		    }
		  }, [cwd, refresh]);
		  if (!open) return null;
		  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
		    "div",
		    {
		      className: "dsh-web-files",
		      onDragOver: (event) => {
		        event.preventDefault();
		      },
		      onDrop: (event) => {
		        event.preventDefault();
		        void put(event.dataTransfer.files);
		      },
		      children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-files-bar", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-web-files-title", children: "Files" }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-web-files-hint", children: backing === "page" ? "the page\u2019s own filesystem \u2014 the runtime did not start" : "the same workspace the agent and the terminal share" }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: onClose, children: "Close" })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-files-tools", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: cwd === home, onClick: () => {
		            void refresh(parentOf(cwd, home));
		          }, children: "Up" }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", { className: "dsh-web-files-crumbs", "aria-label": "Path", children: crumbs(cwd, home).map((crumb, index, all) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => {
		              void refresh(crumb.path);
		            }, children: crumb.name }),
		            index < all.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "aria-hidden": "true", children: "/" })
		          ] }, crumb.path)) }),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { className: "dsh-web-files-actions", children: [
		            picked.size > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		              "button",
		              {
		                type: "button",
		                disabled: busy,
		                onClick: () => {
		                  void save(entries.filter((entry) => picked.has(entry.path)));
		                },
		                children: `Download ${String(picked.size)} selected`
		              }
		            ),
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: busy, onClick: () => {
		              upload.current?.click();
		            }, children: "Upload\u2026" }),
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: busy, onClick: () => {
		              void makeDirectory();
		            }, children: "New folder" }),
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: busy, onClick: () => {
		              void refresh(cwd);
		            }, children: "Refresh" }),
		            /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		              "input",
		              {
		                ref: upload,
		                type: "file",
		                multiple: true,
		                hidden: true,
		                onChange: (event) => {
		                  void put(event.target.files);
		                  event.target.value = "";
		                }
		              }
		            )
		          ] })
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-files-body", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", { className: "dsh-web-files-list", children: [
		            entries.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { className: "dsh-web-files-all", children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [
		              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		                "input",
		                {
		                  type: "checkbox",
		                  checked: picked.size === entries.length && entries.length > 0,
		                  "aria-label": "Select everything here",
		                  onChange: (event) => {
		                    setPicked(event.target.checked ? new Set(entries.map((entry) => entry.path)) : /* @__PURE__ */ new Set());
		                  }
		                }
		              ),
		              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: picked.size === 0 ? "Select" : `${String(picked.size)} of ${String(entries.length)}` })
		            ] }) }),
		            entries.length === 0 && !busy && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { className: "dsh-web-files-empty", children: "This directory is empty." }),
		            entries.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { ...viewing?.path === entry.path ? { "data-open": "" } : {}, children: [
		              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		                "input",
		                {
		                  type: "checkbox",
		                  checked: picked.has(entry.path),
		                  "aria-label": `Select ${entry.name}`,
		                  onChange: (event) => {
		                    setPicked((current) => {
		                      const next = new Set(current);
		                      if (event.target.checked) next.add(entry.path);
		                      else next.delete(entry.path);
		                      return next;
		                    });
		                  }
		                }
		              ),
		              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
		                "button",
		                {
		                  type: "button",
		                  className: "dsh-web-files-name",
		                  onClick: () => {
		                    void (entry.directory ? refresh(entry.path) : show(entry.path));
		                  },
		                  children: [
		                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { "aria-hidden": "true", children: entry.directory ? "\u{1F4C1}" : "\u{1F4C4}" }),
		                    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-web-files-label", children: entry.name })
		                  ]
		                }
		              ),
		              /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		                "button",
		                {
		                  type: "button",
		                  title: entry.directory ? `Download ${entry.name} as a zip` : `Download ${entry.name}`,
		                  onClick: () => {
		                    void save([entry]);
		                  },
		                  children: "\u2193"
		                }
		              ),
		              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", title: `Delete ${entry.name}`, onClick: () => {
		                void remove(entry);
		              }, children: "\u2715" })
		            ] }, entry.path))
		          ] }),
		          viewing !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-files-viewer", children: [
		            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-files-viewer-bar", children: [
		              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-web-files-title", children: baseName(viewing.path) }),
		              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-web-files-hint", children: `${String(viewing.bytes.length)} bytes` }),
		              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => {
		                download(baseName(viewing.path), viewing.bytes);
		              }, children: "Download" }),
		              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => {
		                setViewing(void 0);
		              }, children: "Close" })
		            ] }),
		            viewing.text === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dsh-web-files-notice", children: "This file is not text. Download it to open it elsewhere." }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", { className: "dsh-web-files-text", children: viewing.text })
		          ] })
		        ] }),
		        notice !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dsh-web-files-notice", ...notice.error === true ? { "data-error": "" } : {}, children: notice.text })
		      ]
		    }
		  );
		}
		function FilesIcon() {
		  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		    "svg",
		    {
		      className: "dsh-web-files-action-icon",
		      width: "16",
		      height: "16",
		      viewBox: "0 0 16 16",
		      fill: "none",
		      stroke: "currentColor",
		      strokeWidth: "1.3",
		      strokeLinecap: "round",
		      strokeLinejoin: "round",
		      "aria-hidden": "true",
		      children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M1.7 4.2a1.6 1.6 0 0 1 1.6-1.6h2.4l1.4 1.7h5.6a1.6 1.6 0 0 1 1.6 1.6v6a1.6 1.6 0 0 1-1.6 1.6H3.3a1.6 1.6 0 0 1-1.6-1.6z" })
		    }
		  );
		}
		function FilesAction({ open, onToggle, wide }) {
		  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
		    "button",
		    {
		      type: "button",
		      className: "dsh-web-files-action",
		      ...wide ? {} : { "data-rail": "" },
		      ...open ? { "data-open": "" } : {},
		      "aria-expanded": open,
		      "aria-label": "Files",
		      onClick: onToggle,
		      title: "Browse, upload and download this workspace's files",
		      children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilesIcon, {}),
		        wide && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-web-files-action-label", children: "Files" })
		      ]
		    }
		  );
		}
		var STYLE = `
		/* Surface tokens, with fallbacks that agree with each other. A fallback is
		   the value used when the token is missing, so pairing a hard-coded dark
		   background with a token-resolved foreground is how a panel ends up as dark
		   text on dark. That is what happened here: --dsw-alias-bg-l1 is not a token
		   this surface defines, so the background fell back to a dark literal while
		   the text colour resolved from a real token and followed the light theme.
		   Canvas and CanvasText are the system pair, and they move together. */
		.dsh-web-files{position:fixed;left:0;right:0;bottom:0;height:min(58vh,36rem);z-index:60;display:flex;
		 flex-direction:column;background:var(--dsw-alias-bg-layer-1,Canvas);color:var(--dsw-alias-label-primary,CanvasText);
		 border-top:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.3));box-shadow:0 -8px 32px rgba(0,0,0,.18);
		 font:13px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
		.dsh-web-files-bar,.dsh-web-files-viewer-bar{display:flex;align-items:center;gap:.75rem;padding:.4rem .75rem;flex:none;
		 border-bottom:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.2))}
		.dsh-web-files-title{font-weight:600}
		.dsh-web-files-hint{color:var(--dsw-alias-label-secondary,inherit);opacity:.8;flex:1;overflow:hidden;
		 text-overflow:ellipsis;white-space:nowrap;font-size:12px}
		.dsh-web-files button{font:inherit;background:transparent;color:inherit;border-radius:.35rem;padding:.15rem .5rem;
		 cursor:pointer;border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.4))}
		.dsh-web-files button:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12))}
		.dsh-web-files button:disabled{opacity:.45;cursor:default}
		.dsh-web-files-tools{display:flex;align-items:center;gap:.5rem;padding:.4rem .75rem;flex:none;flex-wrap:wrap;
		 border-bottom:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.2))}
		.dsh-web-files-crumbs{display:flex;align-items:center;gap:.2rem;flex:1;overflow:hidden;white-space:nowrap}
		.dsh-web-files-crumbs button{border:none;padding:.1rem .25rem}
		.dsh-web-files-crumbs button:hover{text-decoration:underline}
		.dsh-web-files-actions{display:flex;gap:.4rem;margin-left:auto}
		.dsh-web-files-body{flex:1;min-height:0;display:flex}
		.dsh-web-files-list{flex:1;min-width:14rem;max-width:32rem;overflow:auto;margin:0;padding:.25rem;list-style:none;
		 border-right:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.2))}
		.dsh-web-files-list:last-child{max-width:none;border-right:none}
		.dsh-web-files-list li{display:flex;align-items:center;gap:.25rem;border-radius:.4rem;padding:.05rem .25rem}
		.dsh-web-files-list li:hover,.dsh-web-files-list li[data-open]{
		 background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.14))}
		.dsh-web-files-list li button{border:none;padding:.2rem .35rem}
		.dsh-web-files-list li input[type=checkbox]{flex:none;margin:0 .15rem;cursor:pointer}
		.dsh-web-files-all{color:var(--dsw-alias-label-secondary,inherit);font-size:12px}
		.dsh-web-files-all label{display:flex;align-items:center;gap:.45rem;cursor:pointer;padding:.1rem .15rem}
		.dsh-web-files-all input[type=checkbox]{cursor:pointer}
		.dsh-web-files-name{flex:1;display:flex;align-items:center;gap:.45rem;overflow:hidden;text-align:left}
		.dsh-web-files-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
		.dsh-web-files-empty{color:var(--dsw-alias-label-secondary,inherit);opacity:.8;padding:.5rem}
		.dsh-web-files-viewer{flex:2;min-width:0;display:flex;flex-direction:column}
		.dsh-web-files-text{flex:1;margin:0;padding:.6rem .75rem;overflow:auto;white-space:pre-wrap;word-break:break-word;
		 background:var(--dsw-alias-markdown-code-block,transparent);
		 font:12px/1.6 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
		.dsh-web-files-notice{padding:.6rem .75rem;margin:0;color:var(--dsw-alias-label-secondary,inherit);font-size:12px}
		.dsh-web-files-notice[data-error]{color:var(--dsw-alias-state-error-primary,#d33)}
		.dsh-web-files-action{box-sizing:border-box;display:flex;align-items:center;gap:8px;flex:0 0 calc(100% + 8px);
		 width:calc(100% + 8px);height:34px;margin:4px -4px;padding:6px 2px 6px 10px;border:none;border-radius:12px;
		 background:0 0;color:var(--dsw-alias-label-primary,inherit);font-family:inherit;font-size:14px;line-height:22px;
		 cursor:pointer;overflow:hidden}
		.dsh-web-files-action:hover,.dsh-web-files-action[data-open]{
		 background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12))}
		.dsh-web-files-action-icon{flex:none}
		.dsh-web-files-action-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
		.dsh-web-files-action[data-rail]{flex:0 0 36px;justify-content:center;gap:0;width:36px;height:36px;
		 margin:4px 0;padding:0;border-radius:50%}
		/* The same opening the terminal's action needs, for the same reason: the
		   foot's action line is one nowrap row, so without it two actions sit side by
		   side instead of stacking. Stated here too so this plugin stacks correctly
		   when it is the only one composed. */
		:has(> .dsh-web-files-action),:has(> * > .dsh-web-files-action){flex-wrap:wrap}
		`;
		var inject = ["slots"];
		function apply(ctx) {
		  if (document.getElementById("dsh-web-files-chrome") === null) {
		    const style = document.createElement("style");
		    style.id = "dsh-web-files-chrome";
		    style.textContent = STYLE;
		    document.head.append(style);
		  }
		  let open = false;
		  let target;
		  const listeners = /* @__PURE__ */ new Set();
		  const announce = () => {
		    for (const listener of listeners) listener();
		  };
		  const setOpen = (next, path) => {
		    open = next;
		    target = path;
		    announce();
		  };
		  const useShared = () => {
		    const [, force] = (0, import_react.useState)(0);
		    (0, import_react.useEffect)(() => {
		      const listener = () => {
		        force((count) => count + 1);
		      };
		      listeners.add(listener);
		      return () => {
		        listeners.delete(listener);
		      };
		    }, []);
		    return { open, target };
		  };
		  const slots = ctx.get("slots");
		  if (slots === void 0) return;
		  slots.inject("shell.overlay", () => slots.register(
		    { name: "shell.overlay", id: "web-files" },
		    function Overlay() {
		      const shared = useShared();
		      const close = (0, import_react.useCallback)(() => {
		        setOpen(false);
		      }, []);
		      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { "data-dsh-web-files-slot": "", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilesPanel, { open: shared.open, target: shared.target, onClose: close }) });
		    }
		  ));
		  slots.inject("sidebar.footer.action", () => slots.register(
		    { name: "sidebar.footer.action", id: "web-files", order: -1 },
		    function Action({ wide }) {
		      const shared = useShared();
		      const toggle = (0, import_react.useCallback)(() => {
		        setOpen(!open);
		      }, []);
		      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilesAction, { open: shared.open, onToggle: toggle, wide });
		    }
		  ));
		  const onOpenPath = (event) => {
		    const path = event.detail?.path;
		    if (typeof path === "string" && path !== "") setOpen(true, path);
		  };
		  window.addEventListener(OPEN_EVENT, onOpenPath);
		  globalThis.__DSH_FILES__ = {
		    open: (path) => {
		      setOpen(true, path);
		    },
		    close: () => {
		      setOpen(false);
		    },
		    isOpen: () => open
		  };
		  ctx.on("dispose", () => {
		    window.removeEventListener(OPEN_EVENT, onOpenPath);
		  });
		}
		var client_default = { apply, inject };

		return module.exports;
	}
});
