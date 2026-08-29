window.__ModuleLoader__.load({
	id: "@dsh-web/terminal",
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

		// packages/dsh-web-terminal/src/client.tsx
		var client_exports = {};
		__export(client_exports, {
		  apply: () => apply,
		  default: () => client_default,
		  inject: () => inject
		});
		module.exports = __toCommonJS(client_exports);
		var import_react = require("react");
		var import_jsx_runtime = require("react/jsx-runtime");
		var BRIDGE = "__DSH_WEB_RUNTIME__";
		function bridge() {
		  return globalThis[BRIDGE];
		}
		function TerminalPanel({ open, onClose }) {
		  const host = (0, import_react.useRef)(null);
		  const started = (0, import_react.useRef)(false);
		  const fitter = (0, import_react.useRef)(void 0);
		  const emulator = (0, import_react.useRef)(void 0);
		  const gone = (0, import_react.useRef)(false);
		  const [message, setMessage] = (0, import_react.useState)(void 0);
		  (0, import_react.useEffect)(() => () => {
		    gone.current = true;
		    emulator.current?.dispose();
		  }, []);
		  (0, import_react.useEffect)(() => {
		    if (!open) return;
		    const frame = requestAnimationFrame(() => {
		      fitter.current?.fit();
		      const terminal = emulator.current;
		      if (terminal !== void 0) terminal.refresh(0, Math.max(0, terminal.rows - 1));
		    });
		    return () => {
		      cancelAnimationFrame(frame);
		    };
		  }, [open]);
		  (0, import_react.useEffect)(() => {
		    if (!open || started.current || host.current === null) return;
		    const runtime = bridge();
		    if (runtime === void 0) {
		      setMessage("The runtime bridge is not available in this build.");
		      return;
		    }
		    const reason = runtime.unavailable();
		    if (reason !== void 0) {
		      setMessage(reason);
		      return;
		    }
		    started.current = true;
		    let terminal;
		    void (async () => {
		      const { Terminal, FitAddon, styles } = await runtime.terminal();
		      if (gone.current) return;
		      if (document.getElementById("dsh-web-terminal-style") === null) {
		        const style = document.createElement("style");
		        style.id = "dsh-web-terminal-style";
		        style.textContent = styles;
		        document.head.append(style);
		      }
		      terminal = new Terminal({
		        // The shell is not behind a line discipline, so a bare newline arrives
		        // without the carriage return a tty would have added.
		        convertEol: true,
		        cursorBlink: true,
		        fontSize: 12.5,
		        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
		        theme: { background: "#0d1017", foreground: "#dfe3ea", cursor: "#7fd1a0" }
		      });
		      const fit = new FitAddon();
		      fitter.current = fit;
		      emulator.current = terminal;
		      terminal.loadAddon(fit);
		      terminal.open(host.current);
		      fit.fit();
		      globalThis.__DSH_TERMINAL__ = {
		        text: () => {
		          const buffer = terminal.buffer.active;
		          const lines = [];
		          for (let i = 0; i < buffer.length; i++) lines.push(buffer.getLine(i)?.translateToString(true) ?? "");
		          return lines.join("\n");
		        },
		        send: (text) => {
		          void writer?.write(text);
		        }
		      };
		      terminal.write("\x1B[38;5;108mStarting the runtime\u2026\x1B[0m\r\n");
		      let writer;
		      try {
		        await runtime.boot((step) => {
		          terminal.write(`\x1B[38;5;244m${step}\u2026\x1B[0m\r
		`);
		        });
		        const shell = await runtime.startShell({ cols: terminal.cols, rows: terminal.rows });
		        void shell.output.pipeTo(new WritableStream({
		          write(chunk) {
		            terminal.write(chunk);
		          }
		        })).catch(() => void 0);
		        writer = shell.input.getWriter();
		        terminal.onData((data) => {
		          void writer?.write(data);
		        });
		        terminal.onResize((size) => {
		          shell.resize(size);
		        });
		        const resize = () => {
		          fit.fit();
		        };
		        window.addEventListener("resize", resize);
		        await shell.exit;
		        window.removeEventListener("resize", resize);
		        terminal.write("\r\n\x1B[38;5;244m[the shell exited \u2014 reload to start a new one]\x1B[0m\r\n");
		      } catch (error) {
		        terminal.write(`\r
		\x1B[31m${error instanceof Error ? error.message : String(error)}\x1B[0m\r
		`);
		        started.current = false;
		      }
		    })();
		  }, [open]);
		  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-terminal", ...open ? { "data-open": "" } : { hidden: true }, children: [
		    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-terminal-bar", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-web-terminal-title", children: "Terminal" }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-web-terminal-hint", children: "the same runtime the agent runs in" }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: onClose, children: "Close" })
		    ] }),
		    message === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-web-terminal-screen", ref: host }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dsh-web-terminal-notice", children: message })
		  ] });
		}
		function TerminalIcon() {
		  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
		    "svg",
		    {
		      className: "dsh-web-terminal-action-icon",
		      width: "16",
		      height: "16",
		      viewBox: "0 0 16 16",
		      fill: "none",
		      stroke: "currentColor",
		      strokeWidth: "1.3",
		      strokeLinecap: "round",
		      strokeLinejoin: "round",
		      "aria-hidden": "true",
		      children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "1.6", y: "2.6", width: "12.8", height: "10.8", rx: "2.6" }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M4.8 6.3 6.9 8l-2.1 1.7" }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M8.8 10.2h2.6" })
		      ]
		    }
		  );
		}
		function TerminalAction({ open, onToggle, wide }) {
		  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
		    "button",
		    {
		      type: "button",
		      className: "dsh-web-terminal-action",
		      ...wide ? {} : { "data-rail": "" },
		      ...open ? { "data-open": "" } : {},
		      "aria-expanded": open,
		      "aria-label": "Terminal",
		      onClick: onToggle,
		      title: "Open a shell in this workspace (Ctrl+`)",
		      children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TerminalIcon, {}),
		        wide && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-web-terminal-action-label", children: "Terminal" })
		      ]
		    }
		  );
		}
		var STYLE = `
		.dsh-web-terminal[hidden]{display:none}
		.dsh-web-terminal{position:fixed;left:0;right:0;bottom:0;height:min(52vh,32rem);z-index:60;display:flex;
		 flex-direction:column;background:#0d1017;border-top:1px solid rgba(127,127,127,.3);box-shadow:0 -8px 32px rgba(0,0,0,.35)}
		.dsh-web-terminal-bar{display:flex;align-items:center;gap:.75rem;padding:.4rem .75rem;color:#dfe3ea;flex:none;
		 border-bottom:1px solid rgba(127,127,127,.2);font:12px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif}
		.dsh-web-terminal-title{font-weight:600}
		.dsh-web-terminal-hint{opacity:.55;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
		.dsh-web-terminal-bar button{font:inherit;background:transparent;border:1px solid rgba(127,127,127,.4);color:inherit;
		 border-radius:.35rem;padding:.15rem .5rem;cursor:pointer}
		.dsh-web-terminal-screen{flex:1;min-height:0;padding:.35rem .5rem}
		.dsh-web-terminal-notice{padding:1rem;color:#9aa3b2;font:12px/1.7 ui-monospace,SFMono-Regular,Menlo,monospace}
		.dsh-web-terminal-action{box-sizing:border-box;display:flex;align-items:center;gap:8px;flex:0 0 calc(100% + 8px);
		 width:calc(100% + 8px);height:34px;margin:4px -4px;padding:6px 2px 6px 10px;border:none;border-radius:12px;
		 background:0 0;color:var(--dsw-alias-label-primary,inherit);font-family:inherit;font-size:14px;line-height:22px;
		 cursor:pointer;overflow:hidden}
		.dsh-web-terminal-action:hover,.dsh-web-terminal-action[data-open]{
		 background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12))}
		.dsh-web-terminal-action-icon{flex:none}
		.dsh-web-terminal-action-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
		.dsh-web-terminal-action[data-rail]{flex:0 0 36px;justify-content:center;gap:0;width:36px;height:36px;
		 margin:4px 0;padding:0;border-radius:50%}
		/* The foot's action line is one nowrap row, so a second action would sit
		   beside this one. Opening the line is what puts each action on a row of its
		   own, under the terminal and above Settings \u2014 the two shapes cover the slot
		   renderer's wrapper being present or not, and nothing else in the tree has
		   this element as a child or grandchild. */
		:has(> .dsh-web-terminal-action),:has(> * > .dsh-web-terminal-action){flex-wrap:wrap}
		`;
		var inject = ["slots"];
		function apply(ctx) {
		  if (document.getElementById("dsh-web-terminal-chrome") === null) {
		    const style = document.createElement("style");
		    style.id = "dsh-web-terminal-chrome";
		    style.textContent = STYLE;
		    document.head.append(style);
		  }
		  let open = false;
		  const listeners = /* @__PURE__ */ new Set();
		  const setOpen = (next) => {
		    open = next;
		    for (const listener of listeners) listener();
		  };
		  const useOpen = () => {
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
		    return open;
		  };
		  const slots = ctx.get("slots");
		  if (slots === void 0) return;
		  slots.inject("shell.overlay", () => slots.register(
		    { name: "shell.overlay", id: "web-terminal" },
		    function Overlay() {
		      const isOpen = useOpen();
		      const close = (0, import_react.useCallback)(() => {
		        setOpen(false);
		      }, []);
		      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { "data-dsh-web-terminal-slot": "", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TerminalPanel, { open: isOpen, onClose: close }) });
		    }
		  ));
		  slots.inject("sidebar.footer.action", () => slots.register(
		    { name: "sidebar.footer.action", id: "web-terminal" },
		    function Action({ wide }) {
		      const isOpen = useOpen();
		      const toggle = (0, import_react.useCallback)(() => {
		        setOpen(!open);
		      }, []);
		      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TerminalAction, { open: isOpen, onToggle: toggle, wide });
		    }
		  ));
		  const onKey = (event) => {
		    if (event.ctrlKey && event.key === "`") {
		      setOpen(!open);
		      event.preventDefault();
		    }
		  };
		  window.addEventListener("keydown", onKey);
		  ctx.on("dispose", () => {
		    window.removeEventListener("keydown", onKey);
		  });
		}
		var client_default = { apply, inject };

		return module.exports;
	}
});
