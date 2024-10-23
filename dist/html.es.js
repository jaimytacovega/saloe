var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
import { stream as stream$1 } from "./worker.es.js";
import { addRoute, removeRoute } from "./router.es.js";
import { getScope, getEnv } from "./util.es.js";
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
                data-scope="${getScope({ env })}" 
                data-env="${getEnv({ env })}" 
                ${args ?? ""}
            >
        `,
    body,
    scripts ?? (() => ""),
    () => html`
            </body>
            </html>
        `
  ];
  return stream$1({ callbacks, headers, status });
};
const awaitHtml = async ({ pending, success, error }) => {
  const id = Math.floor(Math.random() * 1e9);
  const pendingId = `pending_${id}`;
  const pendingRoutePathname = `/~/components/${pendingId}`;
  const route = async () => {
    const headers = new Headers();
    headers.append("Content-Type", "text/html;charset=UTF-8");
    headers.append("Transfer-Encoding", "chunked");
    const streamResult = stream$1({
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
    removeRoute({ pathname: pendingRoutePathname });
    return streamResult;
  };
  addRoute({
    pathname: pendingRoutePathname,
    route
  });
  return html(_a || (_a = __template(["\n        ", '\n        <script\n            data-script-to-load="await-html_script-', `" 
            type="text/script-to-load"
        >
            (async () => {
                const pendingEl = document?.querySelector('[data-await-pending-template="`, `"]')
                const response = await fetch('`, "')\n                const templateString = await response.text()\n                pendingEl.outerHTML = templateString\n\n                if (document?.body?.saloeListen) document?.body?.saloeListen()\n            })()\n        <\/script>\n    "])), await pending({ id: pendingId }), id, pendingId, pendingRoutePathname);
};
export {
  awaitHtml,
  html,
  stream
};
