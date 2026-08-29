window.__ModuleLoader__.load({
	id: "@dsh-web/tryon",
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

		// packages/dsh-web-tryon/src/client.tsx
		var client_exports = {};
		__export(client_exports, {
		  apply: () => apply,
		  default: () => client_default,
		  inject: () => inject
		});
		module.exports = __toCommonJS(client_exports);
		var SKIN_CENTER_SOURCE = "@linxin666/dsh-client-ui-skin-center";
		var inject = ["theme"];
		function themeService(ctx) {
		  try {
		    return ctx.get("theme");
		  } catch {
		    return void 0;
		  }
		}
		function isDark() {
		  return document.body?.hasAttribute("data-ds-dark-theme") === true;
		}
		function requireSkinCenter() {
		  try {
		    return require(SKIN_CENTER_SOURCE);
		  } catch {
		    return void 0;
		  }
		}
		async function waitForSkinCenter() {
		  for (let attempt = 0; attempt < 80; attempt++) {
		    const mod = requireSkinCenter();
		    if (mod !== void 0) return mod;
		    await new Promise((resolve) => setTimeout(resolve, 250));
		  }
		  return void 0;
		}
		function el(tag) {
		  return document.createElement(tag);
		}
		function currentSkinId() {
		  return document.documentElement?.getAttribute("data-dsh-skin") ?? null;
		}
		var TOOLBAR_CSS = [
		  ".dsh-tryon-toolbar{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:2147483000;",
		  " display:flex;align-items:center;gap:10px;padding:9px 14px;border-radius:999px;",
		  " border:1px solid var(--dsw-alias-border-l2,#0000001a);",
		  " background:var(--dsw-alias-bg-layer-2,rgba(255,255,255,.92));",
		  " color:var(--dsw-alias-label-primary,#1b1b1c);",
		  ' font:13px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;',
		  " box-shadow:0 10px 32px rgba(0,0,0,.16);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}",
		  ".dsh-tryon-toolbar a{color:inherit;text-decoration:none;white-space:nowrap}",
		  ".dsh-tryon-toolbar a:hover{text-decoration:underline}",
		  ".dsh-tryon-back{font-weight:600}",
		  ".dsh-tryon-toolbar select{max-width:180px;padding:4px 8px;border-radius:8px;border:1px solid var(--dsw-alias-border-l3,#0000001f);",
		  " background:var(--dsw-alias-bg-layer-1,#fff);color:inherit;font:inherit}",
		  ".dsh-tryon-toggle{display:flex;border:1px solid var(--dsw-alias-border-l3,#0000001f);border-radius:8px;overflow:hidden}",
		  ".dsh-tryon-toggle button{border:0;padding:4px 10px;background:transparent;color:inherit;font:inherit;cursor:pointer}",
		  '.dsh-tryon-toggle button[aria-pressed="true"]{background:var(--dsw-alias-interactive-bg-active,#2631481a)}',
		  ".dsh-tryon-toolbar .dsh-tryon-muted{color:var(--dsw-alias-label-tertiary,#81858c);font-size:12px}",
		  "@media (max-width:640px){.dsh-tryon-toolbar{left:12px;right:12px;transform:none;flex-wrap:wrap;justify-content:center;border-radius:16px}}"
		].join("");
		function apply(ctx) {
		  void run(ctx);
		}
		async function run(ctx) {
		  const params = new URLSearchParams(location.search);
		  const wantedSkin = params.get("skin");
		  const wantedTheme = params.get("theme");
		  const theme = themeService(ctx);
		  if (wantedTheme === "light" || wantedTheme === "dark") {
		    try {
		      theme?.setTheme(wantedTheme);
		    } catch {
		    }
		  }
		  const mod = await waitForSkinCenter();
		  if (mod === void 0) {
		    renderNotice("\u76AE\u80A4\u8BD5\u7A7F\u6A21\u5757\u52A0\u8F7D\u5931\u8D25\uFF0C\u8BF7\u5237\u65B0\u91CD\u8BD5\u3002");
		    return;
		  }
		  const skinCenter = mod;
		  const store = skinCenter.bootSkinRuntime({});
		  if (wantedSkin !== null && wantedSkin !== "") {
		    document.documentElement.setAttribute("data-dsh-skin", wantedSkin);
		  }
		  try {
		    await store.refreshCatalog();
		  } catch {
		  }
		  if (wantedSkin !== null && wantedSkin !== "") {
		    void fetch("/api/skin-center/v2/active", {
		      method: "POST",
		      headers: { "content-type": "application/json" },
		      body: JSON.stringify({ active: wantedSkin })
		    }).catch(() => {
		    });
		  }
		  renderToolbar(store, theme);
		}
		function renderToolbar(store, theme) {
		  if (document.getElementById("dsh-tryon-chrome") !== null) return;
		  const style = el("style");
		  style.id = "dsh-tryon-chrome";
		  style.textContent = TOOLBAR_CSS;
		  document.head.append(style);
		  const bar = el("div");
		  bar.className = "dsh-tryon-toolbar";
		  bar.dataset.dshMarket = "tryon";
		  const back = el("a");
		  back.href = new URL("../", location.href).href;
		  back.textContent = "\u25C0 \u5E02\u573A";
		  back.title = "\u8FD4\u56DE dsh-market.com";
		  bar.append(back);
		  const select = el("select");
		  select.setAttribute("aria-label", "\u9009\u62E9\u76AE\u80A4");
		  const active = currentSkinId();
		  refreshOptions(select, store, active);
		  select.addEventListener("change", () => {
		    const id = select.value;
		    if (id === "") return;
		    const entry = store.find(id);
		    if (entry === null) return;
		    void store.controller.switchTo(id, entry).then(() => {
		      const link = bar.querySelector(".dsh-tryon-download");
		      if (link !== null) link.href = downloadUrl(id);
		    }).catch(() => {
		    });
		  });
		  bar.append(select);
		  const toggle = el("div");
		  toggle.className = "dsh-tryon-toggle";
		  const light = el("button");
		  light.textContent = "\u4EAE";
		  light.setAttribute("aria-pressed", String(!isDark()));
		  const dark = el("button");
		  dark.textContent = "\u6697";
		  dark.setAttribute("aria-pressed", String(isDark()));
		  light.addEventListener("click", () => {
		    try {
		      theme?.setTheme("light");
		    } catch {
		    }
		    document.body.removeAttribute("data-ds-dark-theme");
		    light.setAttribute("aria-pressed", "true");
		    dark.setAttribute("aria-pressed", "false");
		  });
		  dark.addEventListener("click", () => {
		    try {
		      theme?.setTheme("dark");
		    } catch {
		    }
		    document.body.setAttribute("data-ds-dark-theme", "");
		    dark.setAttribute("aria-pressed", "true");
		    light.setAttribute("aria-pressed", "false");
		  });
		  toggle.append(light, dark);
		  bar.append(toggle);
		  const dl = el("a");
		  dl.className = "dsh-tryon-download";
		  dl.target = "_blank";
		  dl.rel = "noopener";
		  dl.textContent = "\u4E0B\u8F7D";
		  dl.title = "\u4E0B\u8F7D\u8BE5\u76AE\u80A4\u6587\u4EF6\u5305";
		  if (active !== null) dl.href = downloadUrl(active);
		  bar.append(dl);
		  document.body.append(bar);
		}
		function refreshOptions(select, store, active) {
		  const items = store.catalog() ?? [];
		  const sorted = [...items].filter((s) => typeof s.manifest?.id === "string").sort((a, b) => {
		    const no = typeof a.manifest?.order === "number" ? a.manifest.order : Number.MAX_SAFE_INTEGER;
		    const nb = typeof b.manifest?.order === "number" ? b.manifest.order : Number.MAX_SAFE_INTEGER;
		    if (no !== nb) return no - nb;
		    return String(a.manifest?.id).localeCompare(String(b.manifest?.id));
		  });
		  select.textContent = "";
		  const stock = el("option");
		  stock.value = "";
		  stock.textContent = "\u9ED8\u8BA4\u5916\u89C2";
		  select.append(stock);
		  for (const s of sorted) {
		    const opt = el("option");
		    opt.value = String(s.manifest?.id);
		    const name = typeof s.manifest?.name === "string" ? s.manifest.name : String(s.manifest?.id);
		    const nameEn = typeof s.manifest?.nameEn === "string" ? s.manifest.nameEn : "";
		    opt.textContent = nameEn !== "" ? name + " \xB7 " + nameEn : name;
		    select.append(opt);
		  }
		  if (active !== null) select.value = active;
		}
		function downloadUrl(id) {
		  return new URL("../assets/skins/" + encodeURIComponent(id) + ".zip", location.href).href;
		}
		function renderNotice(text) {
		  const style = el("style");
		  style.textContent = ".dsh-tryon-error{position:fixed;top:18px;left:50%;transform:translateX(-50%);z-index:2147483000;padding:10px 18px;border-radius:12px;background:#ec13131a;border:1px solid var(--dsw-alias-state-error-primary,#ec1313);color:var(--dsw-alias-state-error-primary,#ec1313);font:13px/1.5 sans-serif}";
		  document.head.append(style);
		  const box = el("div");
		  box.className = "dsh-tryon-error";
		  box.textContent = text;
		  document.body.append(box);
		}
		var client_default = { apply, inject };

		return module.exports;
	}
});
