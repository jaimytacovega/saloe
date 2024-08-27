"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const urlpattern = require("./urlpattern.cjs.js");
const worker = require("./worker.cjs.js");
const router = /* @__PURE__ */ new Map();
const getRouter = () => router;
const getRoute = ({ pathname }) => router.get(pathname);
const addRoute = ({ pathname, route }) => router.set(pathname, route);
const removeRoute = ({ pathname }) => router.delete(pathname);
const findPatternFromUrl = ({ url }) => {
  var _a;
  const patternPathname = [...new Set((_a = getRouter()) == null ? void 0 : _a.keys())].find((patternPathname2) => {
    const pattern = urlpattern.getURLPatern({ pathname: patternPathname2 });
    return pattern.test(url.href);
  });
  return patternPathname ? urlpattern.getURLPatern({ pathname: patternPathname }) : null;
};
const getRedirectResponse = ({ origin, pathname, isRedirectableCallback }) => {
  if (origin !== (self == null ? void 0 : self.origin)) return;
  const isRedirectable = isRedirectableCallback({ pathname });
  const response = isRedirectable ? Response.redirect(pathname.slice(0, -1), 301) : null;
  return { response };
};
const getNotFoundResponse = async ({ request }) => {
  var _a;
  const status = 404;
  const notFoundRoute = getRoute({ pathname: `/${status}` });
  const response = notFoundRoute ? (_a = await notFoundRoute({ request, status })) == null ? void 0 : _a.response : new Response("404", { status });
  return { response };
};
const getForbiddenResponse = ({ origin, request, isForbiddenCallback }) => {
  if (origin !== (self == null ? void 0 : self.origin)) return;
  const isForbidden = isForbiddenCallback({ request });
  if (!isForbidden) return;
  return { response: new Response(`${request == null ? void 0 : request.url} is forbidden`, { status: 503 }) };
};
const getServerOnlyResponse = ({ origin, request, isServerOnlyCallback }) => {
  if (origin !== (self == null ? void 0 : self.origin)) return;
  const isServerOnly = isServerOnlyCallback({ request });
  if (!isServerOnly) return;
  return worker.fetch({ request });
};
exports.addRoute = addRoute;
exports.findPatternFromUrl = findPatternFromUrl;
exports.getForbiddenResponse = getForbiddenResponse;
exports.getNotFoundResponse = getNotFoundResponse;
exports.getRedirectResponse = getRedirectResponse;
exports.getRoute = getRoute;
exports.getRouter = getRouter;
exports.getServerOnlyResponse = getServerOnlyResponse;
exports.removeRoute = removeRoute;
