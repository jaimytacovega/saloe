const r = {
  Cloudflare: "cloudflare-worker",
  ServiceWorker: "service-worker",
  Window: "window"
}, e = {
  Production: "prod",
  Development: "dev",
  Qa: "qa"
}, n = ({ env: o }) => o == null ? void 0 : o.IS_CLOUDFLARE_WORKER, c = ({ env: o }) => o == null ? void 0 : o.IS_SERVICE_WORKER, d = () => typeof window == "object", s = ({ env: o }) => {
  if (n({ env: o })) return r.Cloudflare;
  if (c({ env: o })) return r.ServiceWorker;
  if (d()) return r.Window;
}, t = ({ env: o } = {}) => {
  var i;
  if (n({ env: o }) || c({ env: o })) return o.ENV;
  if (d()) return (i = document == null ? void 0 : document.body) == null ? void 0 : i.getAttribute("data-env");
}, u = ({ env: o }) => t({ env: o }) === e.Production, E = ({ env: o }) => t({ env: o }) === e.Development, a = ({ env: o }) => t({ env: o }) === e.Qa;
export {
  t as getEnv,
  s as getScope,
  n as isCloudflareWorker,
  E as isDevEnv,
  u as isProdEnv,
  a as isQaEnv,
  c as isServiceWorker,
  d as isWindow
};
