"use strict";
var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const worker = require("./worker.cjs.js");
const router = require("./router.cjs.js");
const util = require("./util.cjs.js");
const html = (s, ...args) => {
  var _a2;
  return (_a2 = s == null ? void 0 : s.map((ss, i) => `${ss}${(args == null ? void 0 : args.at(i)) ?? ""}`)) == null ? void 0 : _a2.join("");
};
const stream = ({ head, body, scripts, env, status, args }) => {
  const headers = new Headers();
  headers.append("Content-Type", "text/html;charset=UTF-8");
  const callbacks = [
    () => html`
            <!DOCTYPE html>
            <html lang="${(args == null ? void 0 : args.lang) ?? "en"}">
            <head>
        `,
    head,
    () => html`
            </head>
            <body 
                data-scope="${util.getScope({ env })}" 
                data-env="${util.getEnv({ env })}" 
                ${(args == null ? void 0 : args.isPublic) ?? ""}
                ${(args == null ? void 0 : args.isLoading) ?? ""}
            >
        `,
    body,
    scripts ?? (() => ""),
    () => html`
            </body>
            </html>
        `
  ];
  return worker.stream({ callbacks, headers, status });
};
const awaitHtml = async ({ pending, success, error }) => {
  const id = Math.floor(Math.random() * 1e9);
  const pendingId = `pending_${id}`;
  const pendingRoutePathname = `/~/components/${pendingId}`;
  const getPage = async () => {
    const headers = {
      "Content-Type": "text/html;charset=utf-8",
      "Transfer-Encoding": "chunked"
    };
    const streamResult = worker.stream({
      callbacks: [
        async () => html`
                    ${await success().then((template) => template).catch((err) => {
          console.error(err == null ? void 0 : err.stack);
          return error ? error({ id, err }) : "";
        })}
                `
      ],
      headers
    });
    router.removeRoute({ pathname: pendingRoutePathname });
    return streamResult;
  };
  router.addRoute({
    pathname: pendingRoutePathname,
    route: { getPage }
  });
  return html(_a || (_a = __template(["\n        ", '\n        <script\n            data-script-to-load="await-html_script-', `" 
            type="text/script-to-load"
        >
            (async () => {
                const pendingEl = document?.querySelector('[data-await-pending-template="`, `"]')
                const response = await fetch('`, "')\n                const templateString = await response.text()\n                pendingEl.outerHTML = templateString\n            })()\n        <\/script>\n    "])), await pending({ id: pendingId }), id, pendingId, pendingRoutePathname);
};
exports.awaitHtml = awaitHtml;
exports.html = html;
exports.stream = stream;
