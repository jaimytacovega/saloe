import * as URLPatternPolyfill from "urlpattern-polyfill";
self.URLPattern = (self == null ? void 0 : self.URLPattern) ?? URLPatternPolyfill.URLPattern;
const getURLPatern = ({ pathname }) => new self.URLPattern({ pathname });
export {
  getURLPatern
};
