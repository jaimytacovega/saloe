import * as URLPatternPolyfill from "urlpattern-polyfill";
if (self == null ? void 0 : self.URLPattern) self.URLPattern = URLPatternPolyfill.URLPattern;
const getURLPatern = ({ pathname }) => new self.URLPattern({ pathname });
export {
  getURLPatern
};
