var m = Object.freeze, $ = Object.defineProperty;
var l = (e, n) => m($(e, "raw", { value: m(n || e.slice()) }));
import { stream as h } from "./worker.es.js";
import { addRoute as y, removeRoute as w } from "./router.es.js";
import { getScope as f, getEnv as b } from "./util.es.js";
const i = (e, ...n) => {
  var o;
  return (o = e == null ? void 0 : e.map((a, c) => `${a}${(n == null ? void 0 : n.at(c)) ?? ""}`)) == null ? void 0 : o.join("");
}, P = ({ head: e, body: n, scripts: o, env: a, status: c, args: t }) => {
  const p = new Headers();
  return p.append("Content-Type", "text/html;charset=UTF-8"), h({ callbacks: [
    () => i`
            <!DOCTYPE html>
            <html lang="${(t == null ? void 0 : t.lang) ?? "en"}">
            <head>
        `,
    e,
    () => i`
            </head>
            <body 
                data-scope="${f({ env: a })}" 
                data-env="${b({ env: a })}" 
                ${(t == null ? void 0 : t.isPublic) ?? ""}
                ${(t == null ? void 0 : t.isLoading) ?? ""}
            >
        `,
    n,
    o ?? (() => ""),
    () => i`
            </body>
            </html>
        `
  ], headers: p, status: c });
};
var s;
const _ = async ({ pending: e, success: n, error: o }) => {
  const a = Math.floor(Math.random() * 1e9), c = `pending_${a}`, t = `/~/components/${c}`;
  return y({
    pathname: t,
    route: { getPage: async () => {
      const u = h({
        callbacks: [
          async () => i`
                    ${await n().then((d) => d).catch((d) => (console.error(d == null ? void 0 : d.stack), o ? o({ id: a, err: d }) : ""))}
                `
        ],
        headers: {
          "Content-Type": "text/html;charset=utf-8",
          "Transfer-Encoding": "chunked"
        }
      });
      return w({ pathname: t }), u;
    } }
  }), i(s || (s = l([`
        `, `
        <script
            data-script-to-load="await-html_script-`, `" 
            type="text/script-to-load"
        >
            (async () => {
                const pendingEl = document?.querySelector('[data-await-pending-template="`, `"]')
                const response = await fetch('`, `')
                const templateString = await response.text()
                pendingEl.outerHTML = templateString
            })()
        <\/script>
    `])), await e({ id: c }), a, c, t);
};
export {
  _ as awaitHtml,
  i as html,
  P as stream
};
