window.__ModuleLoader__.load({
	id: "@dsh-web/runtime",
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

		// packages/dsh-web-runtime/src/client.tsx
		var client_exports = {};
		__export(client_exports, {
		  apply: () => apply,
		  default: () => client_default,
		  inject: () => inject
		});
		module.exports = __toCommonJS(client_exports);
		var import_react = require("react");
		var import_jsx_runtime = require("react/jsx-runtime");
		var BRIDGE = "__DSH_WEB_MACHINE__";
		function bridge() {
		  return globalThis[BRIDGE];
		}
		function size(bytes) {
		  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
		  return `${Math.max(1, Math.round(bytes / 1024)).toString()} KB`;
		}
		function consoleLabel(kind) {
		  if (kind === "serial") return "shell";
		  if (kind === "dos") return "DOS prompt";
		  return "graphical";
		}
		function Screen({ live }) {
		  const host = (0, import_react.useRef)(null);
		  const [step, setStep] = (0, import_react.useState)("Starting the machine\u2026");
		  const [failed, setFailed] = (0, import_react.useState)(void 0);
		  const [focused, setFocused] = (0, import_react.useState)(false);
		  (0, import_react.useEffect)(() => {
		    const machine = bridge();
		    if (machine === void 0 || host.current === null) return;
		    let release;
		    let gone = false;
		    void (async () => {
		      try {
		        await machine.boot((next) => {
		          if (!gone) setStep(next);
		        });
		        if (gone || host.current === null) return;
		        const disposer = await machine.adoptScreen(host.current);
		        if (gone) {
		          disposer();
		          return;
		        }
		        release = disposer;
		        setStep("");
		      } catch (error) {
		        if (!gone) setFailed(error instanceof Error ? error.message : String(error));
		      }
		    })();
		    return () => {
		      gone = true;
		      release?.();
		    };
		  }, []);
		  const onKey = (0, import_react.useCallback)((event) => {
		    const machine = bridge();
		    if (machine === void 0) return;
		    if (machine.key(event.nativeEvent.code, event.type === "keydown")) event.preventDefault();
		  }, []);
		  const capture = (0, import_react.useCallback)((on) => {
		    setFocused(on);
		  }, []);
		  if (failed !== void 0) {
		    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dsh-web-runtime-notice", children: failed });
		  }
		  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-runtime-stage", children: [
		    /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		      "div",
		      {
		        className: "dsh-web-runtime-screen",
		        ...focused ? { "data-focused": "" } : {},
		        ref: host,
		        tabIndex: 0,
		        role: "application",
		        "aria-label": "The machine's screen",
		        onFocus: () => {
		          capture(true);
		        },
		        onBlur: () => {
		          capture(false);
		        },
		        onKeyDown: onKey,
		        onKeyUp: onKey,
		        onClick: () => {
		          host.current?.focus();
		        }
		      }
		    ),
		    step !== "" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dsh-web-runtime-step", children: step }),
		    /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dsh-web-runtime-hint", children: live ? focused ? "The keyboard is going to the machine. Click outside to give it back." : "Click the screen to type at the machine." : "This session is not running an emulated machine." })
		  ] });
		}
		function MachineRow({
		  title,
		  detail,
		  tags,
		  chosen,
		  onChoose,
		  children
		}) {
		  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-runtime-row", ...chosen ? { "data-chosen": "" } : {}, children: [
		    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { type: "button", className: "dsh-web-runtime-pick", onClick: onChoose, "aria-pressed": chosen, children: [
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-web-runtime-name", children: title }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-web-runtime-tags", children: tags.map((tag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: tag }, tag)) }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-web-runtime-detail", children: detail })
		    ] }),
		    children
		  ] });
		}
		function RuntimePanel({ open, onClose }) {
		  const machine = bridge();
		  const [chosen, setChosen] = (0, import_react.useState)(() => machine?.selection() ?? { kind: "node" });
		  const [disks, setDisks] = (0, import_react.useState)([]);
		  const [host, setHost] = (0, import_react.useState)(() => machine?.imageHost() ?? "");
		  const [saved, setSaved] = (0, import_react.useState)(false);
		  const [problem, setProblem] = (0, import_react.useState)(void 0);
		  const active = machine?.selection() ?? { kind: "node" };
		  const status = machine?.status();
		  const guests = machine?.guests() ?? [];
		  const refreshDisks = (0, import_react.useCallback)(() => {
		    void machine?.disks().then(setDisks).catch(() => void 0);
		  }, [machine]);
		  (0, import_react.useEffect)(() => {
		    if (open) refreshDisks();
		  }, [open, refreshDisks]);
		  const choose = (0, import_react.useCallback)((next) => {
		    setChosen(next);
		    setSaved(false);
		  }, []);
		  const apply2 = (0, import_react.useCallback)(() => {
		    machine?.select(chosen);
		    if (host.trim() !== "") machine?.setImageHost(host.trim());
		    setSaved(true);
		  }, [machine, chosen, host]);
		  const openDisk = (0, import_react.useCallback)(async (guest, file) => {
		    if (file === void 0 || machine === void 0) return;
		    setProblem(void 0);
		    try {
		      await machine.storeDisk(guest, file);
		    } catch (error) {
		      setProblem(`${file.name} could not be kept: ${error instanceof Error ? error.message : String(error)}`);
		      return;
		    }
		    refreshDisks();
		  }, [machine, refreshDisks]);
		  const same = active.kind === chosen.kind && (active.kind !== "v86" || chosen.kind !== "v86" || active.image === chosen.image);
		  const storedHost = machine?.imageHost() ?? "";
		  const typedHost = host.trim() === "" ? "" : host.trim().endsWith("/") ? host.trim() : `${host.trim()}/`;
		  const hostChanged = typedHost !== "" && typedHost !== storedHost;
		  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-runtime", ...open ? { "data-open": "" } : { hidden: true }, children: [
		    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-runtime-bar", children: [
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-web-runtime-title", children: "Runtime" }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-web-runtime-now", children: active.kind === "node" ? "running the Node container" : `running ${guests.find((guest) => guest.id === active.image)?.name ?? active.image}` }),
		      status?.running === true && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => {
		        void machine?.restart().then(() => {
		          location.reload();
		        });
		      }, children: "Restart machine" }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: onClose, children: "Close" })
		    ] }),
		    /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-runtime-body", children: [
		      !same && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-runtime-apply", children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: apply2, children: "Use this machine" }),
		        saved && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
		          "Saved. It applies on the next load \u2014",
		          " ",
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsh-web-runtime-link", onClick: () => {
		            location.reload();
		          }, children: "reload now" }),
		          "."
		        ] })
		      ] }),
		      open && active.kind === "v86" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Screen, { live: true }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Machine" }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dsh-web-runtime-lede", children: "One session runs on one machine, and which one decides what tools the assistant is given. A change applies the next time this page loads." }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		          MachineRow,
		          {
		            title: "Node container",
		            detail: "WebContainers: Node 22, npm, a real CPython with pip, and a POSIX filesystem shared with the assistant's file tools. The default.",
		            tags: ["shell", "nothing to download"],
		            chosen: chosen.kind === "node",
		            onChoose: () => {
		              choose({ kind: "node" });
		            }
		          }
		        ),
		        guests.map((guest) => {
		          const stored = disks.find((disk) => disk.guest === guest.id);
		          const ready = guest.bundled || stored !== void 0;
		          return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		            MachineRow,
		            {
		              title: guest.name,
		              detail: `${guest.summary} Boots in ${guest.boots}.`,
		              tags: [
		                consoleLabel(guest.console),
		                stored === void 0 ? size(guest.transfer) : `${size(stored.size)} on this device`,
		                ...ready ? [] : ["not on the default host"]
		              ],
		              chosen: chosen.kind === "v86" && chosen.image === guest.id,
		              onChoose: () => {
		                choose({ kind: "v86", image: guest.id });
		              },
		              children: (!guest.bundled || stored !== void 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsh-web-runtime-disk", children: stored === void 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
		                  "The default image host does not serve ",
		                  guest.files.join(", "),
		                  ". Point the image host below at one that does, or open the disk image from this computer:"
		                ] }),
		                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		                  "input",
		                  {
		                    type: "file",
		                    "aria-label": `Disk image for ${guest.name}`,
		                    onChange: (event) => {
		                      void openDisk(guest.id, event.currentTarget.files?.[0]);
		                    }
		                  }
		                )
		              ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
		                  "Using ",
		                  stored.name,
		                  " from this computer (",
		                  size(stored.size),
		                  "), kept in this browser."
		                ] }),
		                /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		                  "button",
		                  {
		                    type: "button",
		                    onClick: () => {
		                      void machine?.forgetDisk(guest.id).then(refreshDisks);
		                    },
		                    children: "Forget it"
		                  }
		                )
		              ] }) })
		            },
		            guest.id
		          );
		        })
		      ] }),
		      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Image host" }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { className: "dsh-web-runtime-lede", children: [
		          "Where disk images are fetched from. The default is the v86 project's public image repository, which serves the five machines above that need no setup. v86's own demo serves the rest from ",
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: machine?.hosts.upstream }),
		          ", which refuses requests from anywhere but ",
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", { children: "copy.sh" }),
		          " \u2014 so pointing at it only works if that is where you are. A mirror of your own works too."
		        ] }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-runtime-host", children: [
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
		            "input",
		            {
		              type: "url",
		              value: host,
		              spellCheck: false,
		              placeholder: machine?.hosts.default,
		              "aria-label": "Image host",
		              onChange: (event) => {
		                setHost(event.currentTarget.value);
		              }
		            }
		          ),
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", onClick: () => {
		            setHost(machine?.hosts.default ?? "");
		          }, children: "Default" })
		        ] })
		      ] }),
		      problem !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dsh-web-runtime-problem", children: problem }),
		      same && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsh-web-runtime-apply", "data-end": true, children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", disabled: !hostChanged, onClick: apply2, children: "Save image host" }),
		        saved && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
		          "Saved. It applies on the next load \u2014",
		          " ",
		          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { type: "button", className: "dsh-web-runtime-link", onClick: () => {
		            location.reload();
		          }, children: "reload now" }),
		          "."
		        ] })
		      ] })
		    ] })
		  ] });
		}
		function RuntimeIcon() {
		  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
		    "svg",
		    {
		      className: "dsh-web-runtime-action-icon",
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
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", { x: "1.6", y: "3", width: "12.8", height: "8.4", rx: "1.6" }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M5.6 13.6h4.8" }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M8 11.4v2.2" }),
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M4.6 6.2h3.2" })
		      ]
		    }
		  );
		}
		function RuntimeAction({ open, onToggle, wide }) {
		  return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(
		    "button",
		    {
		      type: "button",
		      className: "dsh-web-runtime-action",
		      ...wide ? {} : { "data-rail": "" },
		      ...open ? { "data-open": "" } : {},
		      "aria-expanded": open,
		      "aria-label": "Runtime",
		      onClick: onToggle,
		      title: "Choose the machine this session runs on",
		      children: [
		        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RuntimeIcon, {}),
		        wide && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "dsh-web-runtime-action-label", children: "Runtime" })
		      ]
		    }
		  );
		}
		var STYLE = `
		.dsh-web-runtime[hidden]{display:none}
		.dsh-web-runtime{position:fixed;inset:0;z-index:70;display:flex;flex-direction:column;background:var(--dsw-alias-bg-layer-1,Canvas);
		 color:var(--dsw-alias-label-primary,CanvasText)}
		.dsh-web-runtime-bar{display:flex;align-items:center;gap:.75rem;padding:.55rem .9rem;flex:none;
		 border-bottom:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.25));font:13px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif}
		.dsh-web-runtime-title{font-weight:600}
		.dsh-web-runtime-now{opacity:.6;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
		.dsh-web-runtime-bar button{font:inherit;background:transparent;border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.4));
		 color:inherit;border-radius:.35rem;padding:.2rem .55rem;cursor:pointer}
		.dsh-web-runtime-body{flex:1;min-height:0;overflow:auto;padding:1rem 1.1rem 2rem;
		 font:13px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif;max-width:64rem;width:100%;margin:0 auto;box-sizing:border-box}
		.dsh-web-runtime-body h3{margin:1.4rem 0 .4rem;font-size:13px;letter-spacing:.02em;text-transform:uppercase;opacity:.6}
		.dsh-web-runtime-lede{margin:0 0 .7rem;opacity:.72;max-width:52rem}
		.dsh-web-runtime-lede code{font-size:12px;opacity:.9}
		.dsh-web-runtime-stage{display:flex;flex-direction:column;align-items:center;gap:.4rem;padding:.6rem 0 1rem}
		.dsh-web-runtime-screen{background:#000;border:2px solid transparent;border-radius:.3rem;line-height:0;max-width:100%;overflow:auto}
		.dsh-web-runtime-screen[data-focused]{border-color:var(--dsw-alias-border-focus,#2f81f7)}
		.dsh-web-runtime-screen:focus{outline:none}
		.dsh-web-runtime-step,.dsh-web-runtime-hint{margin:0;font-size:12px;opacity:.6}
		.dsh-web-runtime-notice{padding:1rem;opacity:.7;font:12px/1.7 ui-monospace,SFMono-Regular,Menlo,monospace}
		.dsh-web-runtime-row{border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.22));border-radius:.5rem;margin-bottom:.4rem;overflow:hidden}
		.dsh-web-runtime-row[data-chosen]{border-color:var(--dsw-alias-border-focus,#2f81f7)}
		.dsh-web-runtime-pick{display:grid;grid-template-columns:minmax(9rem,auto) 1fr;gap:.15rem .75rem;width:100%;text-align:left;
		 background:0 0;border:0;color:inherit;font:inherit;padding:.6rem .75rem;cursor:pointer}
		.dsh-web-runtime-pick:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.1))}
		.dsh-web-runtime-name{font-weight:600}
		.dsh-web-runtime-tags{display:flex;gap:.35rem;flex-wrap:wrap;justify-self:start}
		.dsh-web-runtime-tags span{font-size:11px;padding:.05rem .4rem;border-radius:.6rem;opacity:.75;
		 border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.35))}
		.dsh-web-runtime-detail{grid-column:1/-1;opacity:.7}
		.dsh-web-runtime-disk{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem;padding:.5rem .75rem;font-size:12px;opacity:.85;
		 border-top:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.18))}
		.dsh-web-runtime-disk span{flex:1;min-width:16rem}
		.dsh-web-runtime-problem{margin:.8rem 0 0;color:var(--dsw-alias-label-danger,#f5a3a3)}
		.dsh-web-runtime-host{display:flex;gap:.5rem;align-items:center}
		.dsh-web-runtime-host input{flex:1;font:inherit;padding:.3rem .5rem;border-radius:.35rem;background:transparent;color:inherit;
		 border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.4))}
		.dsh-web-runtime-apply{display:flex;align-items:center;gap:.7rem;margin:0 0 1.4rem}
		.dsh-web-runtime-apply[data-end]{margin:1.4rem 0 0}
		.dsh-web-runtime-apply button,.dsh-web-runtime-disk button,.dsh-web-runtime-host button{font:inherit;cursor:pointer;
		 border:1px solid var(--dsw-alias-border-l2,rgba(127,127,127,.4));background:transparent;color:inherit;
		 border-radius:.35rem;padding:.3rem .7rem}
		.dsh-web-runtime-apply button:disabled{opacity:.4;cursor:default}
		.dsh-web-runtime-link{border:0!important;padding:0!important;text-decoration:underline}
		.dsh-web-runtime-action{box-sizing:border-box;display:flex;align-items:center;gap:8px;flex:0 0 calc(100% + 8px);
		 width:calc(100% + 8px);height:34px;margin:4px -4px;padding:6px 2px 6px 10px;border:none;border-radius:12px;
		 background:0 0;color:var(--dsw-alias-label-primary,inherit);font-family:inherit;font-size:14px;line-height:22px;
		 cursor:pointer;overflow:hidden}
		.dsh-web-runtime-action:hover,.dsh-web-runtime-action[data-open]{
		 background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12))}
		.dsh-web-runtime-action-icon{flex:none}
		.dsh-web-runtime-action-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
		.dsh-web-runtime-action[data-rail]{flex:0 0 36px;justify-content:center;gap:0;width:36px;height:36px;
		 margin:4px 0;padding:0;border-radius:50%}
		:has(> .dsh-web-runtime-action),:has(> * > .dsh-web-runtime-action){flex-wrap:wrap}
		`;
		var inject = ["slots"];
		function apply(ctx) {
		  if (document.getElementById("dsh-web-runtime-chrome") === null) {
		    const style = document.createElement("style");
		    style.id = "dsh-web-runtime-chrome";
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
		    { name: "shell.overlay", id: "web-runtime" },
		    function Overlay() {
		      const isOpen = useOpen();
		      const close = (0, import_react.useCallback)(() => {
		        setOpen(false);
		      }, []);
		      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { "data-dsh-web-runtime-slot": "", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RuntimePanel, { open: isOpen, onClose: close }) });
		    }
		  ));
		  slots.inject("sidebar.footer.action", () => slots.register(
		    { name: "sidebar.footer.action", id: "web-runtime" },
		    function Action({ wide }) {
		      const isOpen = useOpen();
		      const toggle = (0, import_react.useCallback)(() => {
		        setOpen(!open);
		      }, []);
		      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RuntimeAction, { open: isOpen, onToggle: toggle, wide });
		    }
		  ));
		}
		var client_default = { apply, inject };

		return module.exports;
	}
});
