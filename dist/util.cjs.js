"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const Scope = {
  Cloudflare: "cloudflare-worker",
  ServiceWorker: "service-worker",
  Window: "window"
};
const Environment = {
  Production: "prod",
  Development: "dev",
  Qa: "qa"
};
const isCloudflareWorker = ({ env }) => env == null ? void 0 : env.IS_CLOUDFLARE_WORKER;
const isServiceWorker = ({ env }) => env == null ? void 0 : env.IS_SERVICE_WORKER;
const isWindow = () => typeof window === "object";
const getScope = ({ env }) => {
  if (isCloudflareWorker({ env })) return Scope.Cloudflare;
  if (isServiceWorker({ env })) return Scope.ServiceWorker;
  if (isWindow()) return Scope.Window;
};
const getEnv = ({ env } = {}) => {
  var _a;
  if (isCloudflareWorker({ env }) || isServiceWorker({ env })) return env.ENV;
  if (isWindow()) return (_a = document == null ? void 0 : document.body) == null ? void 0 : _a.getAttribute("data-env");
};
const isProdEnv = ({ env }) => getEnv({ env }) === Environment.Production;
const isDevEnv = ({ env }) => getEnv({ env }) === Environment.Development;
const isQaEnv = ({ env }) => getEnv({ env }) === Environment.Qa;
exports.getEnv = getEnv;
exports.getScope = getScope;
exports.isCloudflareWorker = isCloudflareWorker;
exports.isDevEnv = isDevEnv;
exports.isProdEnv = isProdEnv;
exports.isQaEnv = isQaEnv;
exports.isServiceWorker = isServiceWorker;
exports.isWindow = isWindow;
