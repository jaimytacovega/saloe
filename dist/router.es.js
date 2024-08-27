import { getURLPatern as i } from "./urlpattern.es.js";
import { fetch as c } from "./worker.es.js";
const o = /* @__PURE__ */ new Map(), a = () => o, p = ({ pathname: t }) => o.get(t), l = ({ pathname: t, route: e }) => o.set(t, e), R = ({ pathname: t }) => o.delete(t), f = ({ url: t }) => {
  var n;
  const e = [...new Set((n = a()) == null ? void 0 : n.keys())].find((s) => i({ pathname: s }).test(t.href));
  return e ? i({ pathname: e }) : null;
}, g = ({ origin: t, pathname: e, isRedirectableCallback: n }) => t !== (self == null ? void 0 : self.origin) ? void 0 : { response: n({ pathname: e }) ? Response.redirect(e.slice(0, -1), 301) : null }, m = async ({ request: t }) => {
  var r;
  const n = p({ pathname: "/404" });
  return { response: n ? (r = await n({ request: t, status: 404 })) == null ? void 0 : r.response : new Response("404", { status: 404 }) };
}, b = ({ origin: t, request: e, isForbiddenCallback: n }) => {
  if (!(t !== (self == null ? void 0 : self.origin) || !n({ request: e })))
    return { response: new Response(`${e == null ? void 0 : e.url} is forbidden`, { status: 503 }) };
}, F = ({ origin: t, request: e, isServerOnlyCallback: n }) => {
  if (!(t !== (self == null ? void 0 : self.origin) || !n({ request: e })))
    return c({ request: e });
};
export {
  l as addRoute,
  f as findPatternFromUrl,
  b as getForbiddenResponse,
  m as getNotFoundResponse,
  g as getRedirectResponse,
  p as getRoute,
  a as getRouter,
  F as getServerOnlyResponse,
  R as removeRoute
};
