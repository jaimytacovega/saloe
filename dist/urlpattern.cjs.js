"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const URLPatternPolyfill = require("urlpattern-polyfill");
function _interopNamespaceDefault(e) {
  const n = Object.create(null, { [Symbol.toStringTag]: { value: "Module" } });
  if (e) {
    for (const k in e) {
      if (k !== "default") {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: () => e[k]
        });
      }
    }
  }
  n.default = e;
  return Object.freeze(n);
}
const URLPatternPolyfill__namespace = /* @__PURE__ */ _interopNamespaceDefault(URLPatternPolyfill);
if (self == null ? void 0 : self.URLPattern) self.URLPattern = URLPatternPolyfill__namespace.URLPattern;
const getURLPatern = ({ pathname }) => new self.URLPattern({ pathname });
exports.getURLPatern = getURLPatern;
